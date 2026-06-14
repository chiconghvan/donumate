# Plan: Standalone Camoufox BiDi CLI for Donut Browser Profiles

## Context

Need build new standalone project, separate from Donut Browser codebase. Project will use Donut Browser REST API documented in root `api-guide.md` to manage profiles: list profiles, select Camoufox profile, launch profile, read `remote_debugging_port`, then connect WebDriver BiDi to Camoufox at `ws://127.0.0.1:{remote_debugging_port}/session` and run automation.

First feature only:
1. Load Donut profiles.
2. Filter profiles where `browser == "camoufox"`.
3. Let user select one profile from CLI.
4. Launch selected profile through Donut API.
5. Connect BiDi using returned debugging port.
6. Navigate to `https://www.threads.com/`.
7. Count interactive elements.
8. Print result to console.

This project is CLI-only now. No GUI. Design should allow GUI later.

## Recommended stack

Use **TypeScript + Node.js 22 + pnpm**.

Why:
- Best fit for CLI + async WebSocket automation.
- Good libraries for prompts, config, logs, HTTP, and WebSocket.
- Easier to later wrap with GUI/Electron/Tauri/web backend.
- Avoids current `playwright-rust` compatibility issue.
- Does not depend on Playwright attach. Uses proven Camoufox WebDriver BiDi protocol.

Recommended libraries:
- `undici` or built-in `fetch` for Donut API HTTP calls.
- `ws` for WebSocket BiDi connection.
- `commander` for CLI commands.
- `@inquirer/prompts` for profile selection.
- `zod` for config/response validation.
- `tsx` for dev execution.
- `typescript` for build.

## Project location/name

Suggested project folder when implementing:

```text
E:\Code\donut-camoufox-bidi-cli\
```

Plan file intended copy target:

```text
.\plans\donut-camoufox-bidi-cli-plan.md
```

## Project structure

```text
donut-camoufox-bidi-cli/
  package.json
  tsconfig.json
  README.md
  .env.example

  src/
    cli.ts
    index.ts

    config/
      load-config.ts
      types.ts

    donut/
      api-client.ts
      api-types.ts
      profile-selector.ts

    bidi/
      bidi-client.ts
      bidi-types.ts
      commands.ts

    automation/
      threads-task.ts
      interactive-elements.ts

    utils/
      errors.ts
      logger.ts
      retry.ts

  plans/
    donut-camoufox-bidi-cli-plan.md
```

## Config

Support `.env` and CLI flags.

`.env.example`:

```env
DONUT_API_BASE_URL=http://127.0.0.1:10108
DONUT_API_TOKEN=
DONUT_PROFILE_ID=
CAMOUFOX_HEADLESS=false
BIDI_CONNECT_TIMEOUT_MS=30000
BIDI_COMMAND_TIMEOUT_MS=15000
```

CLI flags override env:

```bash
donut-camoufox threads --api http://127.0.0.1:10108
```

For first version, token can be optional because current Donut API may not enforce bearer token, but client should support it:

```http
Authorization: Bearer <token>
```

## Donut API usage

Use `api-guide.md` as source of truth. First version needs these endpoints only.

### List profiles

```http
GET /v1/profiles
```

Expected response shape:

```ts
type ApiProfilesResponse = {
  profiles: ApiProfile[];
  total: number;
};

type ApiProfile = {
  id: string;
  name: string;
  browser: string;
  version: string;
  process_id?: number | null;
  is_running?: boolean;
  camoufox_config?: unknown;
};
```

Filter:

```ts
profile.browser === "camoufox"
```

### Launch profile

```http
POST /v1/profiles/{id}/run
Content-Type: application/json
```

Request:

```json
{
  "url": "about:blank",
  "headless": false
}
```

Expected response:

```ts
type RunProfileResponse = {
  profile_id: string;
  remote_debugging_port: number;
  ws_url?: string | null;
  headless: boolean;
};
```

WS resolution:

```ts
const wsUrl = response.ws_url ?? `ws://127.0.0.1:${response.remote_debugging_port}/session`;
```

For Camoufox, do not use `/json`, `/json/version`, `/json/list`. Tested result:

```text
/json          -> 404
/json/version  -> 404
/json/list     -> 404
/session       -> WebSocket endpoint
```

Correct Camoufox WebDriver BiDi URL:

```text
ws://127.0.0.1:{remote_debugging_port}/session
```

### Optional kill profile

First version can keep browser open after automation by default. Add optional flag:

```bash
--kill-after
```

If enabled:

```http
POST /v1/profiles/{id}/kill
```

## WebDriver BiDi protocol flow

### 1. Connect WebSocket

```text
ws://127.0.0.1:{port}/session
```

### 2. Create session

```json
{
  "id": 1,
  "method": "session.new",
  "params": {
    "capabilities": {}
  }
}
```

Response contains:

```json
{
  "type": "success",
  "result": {
    "sessionId": "..."
  }
}
```

Store `sessionId` and include it on future commands:

```json
{
  "id": 2,
  "sessionId": "...",
  "method": "browsingContext.getTree",
  "params": {}
}
```

### 3. Get context

```json
{
  "method": "browsingContext.getTree",
  "params": {}
}
```

Use first context:

```ts
const contextId = result.contexts[0].context;
```

### 4. Navigate Threads

```json
{
  "method": "browsingContext.navigate",
  "params": {
    "context": contextId,
    "url": "https://www.threads.com/"
  }
}
```

### 5. Wait page load

First version can use simple sleep 8 seconds after navigation. Later improve with polling:

```js
document.readyState === "complete"
```

### 6. Count interactive elements

Use `script.evaluate`:

```json
{
  "method": "script.evaluate",
  "params": {
    "target": { "context": contextId },
    "expression": "(() => { const selectors = ['a','button','input','textarea','select','[role=button]','[role=link]','[tabindex]:not([tabindex=\"-1\"])']; const elements = Array.from(document.querySelectorAll(selectors.join(','))); const visible = elements.filter(el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; }); return { total: elements.length, visible: visible.length, byTag: visible.reduce((acc, el) => { const key = el.tagName.toLowerCase(); acc[key] = (acc[key] || 0) + 1; return acc; }, {}) }; })()",
    "awaitPromise": false
  }
}
```

BiDi returns remote values. Need unwrap recursively:

```ts
function fromRemoteValue(value: RemoteValue): unknown
```

Expected console output:

```text
Selected profile: My Camoufox Profile (...uuid...)
Launched profile.
Remote debugging port: 51234
BiDi WS: ws://127.0.0.1:51234/session
Navigated: https://www.threads.com/
Title: Threads
Interactive elements:
  total: 128
  visible: 52
  byTag:
    a: 30
    button: 18
    input: 4
Done.
```

## CLI commands

First command:

```bash
pnpm start threads
```

or after build:

```bash
donut-camoufox threads
```

Options:

```bash
donut-camoufox threads \
  --api http://127.0.0.1:10108 \
  --token <optional-token> \
  --profile <profile-id> \
  --headless false \
  --kill-after false
```

Behavior:
- If `--profile` provided, skip interactive selector.
- If not provided, fetch profiles and show selector.
- Show only Camoufox profiles.
- If no Camoufox profile found, print clear error.

## Module design

### `src/donut/api-client.ts`

Responsibilities:
- `listProfiles()`
- `runProfile(profileId, options)`
- `killProfile(profileId)`
- Add bearer token if configured.
- Validate API responses with `zod`.
- Convert HTTP errors to useful messages:
  - `402` automation entitlement missing
  - `403` terms not accepted
  - `404` profile not found
  - `500` launch failure

### `src/donut/profile-selector.ts`

Responsibilities:
- Filter Camoufox profiles.
- Render profile choices in CLI.
- Return selected profile.

Choice label:

```text
{name} | {id} | {version} | running={is_running}
```

### `src/bidi/bidi-client.ts`

Responsibilities:
- Connect WebSocket.
- Send command envelopes with incremental `id`.
- Track pending responses by `id`.
- Include `sessionId` after `session.new`.
- Ignore/event-emit BiDi events.
- Timeouts per command.
- Reject pending commands on socket close.

Methods:

```ts
class BidiClient {
  connect(wsUrl: string): Promise<void>;
  newSession(): Promise<string>;
  getTree(): Promise<BrowsingContextTree>;
  navigate(contextId: string, url: string): Promise<void>;
  evaluate(contextId: string, expression: string): Promise<unknown>;
  close(): Promise<void>;
}
```

### `src/automation/threads-task.ts`

Responsibilities:
- Run first business flow:
  - get context
  - navigate Threads
  - wait
  - get title/url
  - count interactive elements
  - print result

### `src/automation/interactive-elements.ts`

Responsibilities:
- Export JS expression string for counting interactive elements.
- Export result types.

## First milestone implementation steps

1. Initialize project:

```bash
pnpm init
pnpm add commander @inquirer/prompts zod ws dotenv
pnpm add -D typescript tsx @types/node @types/ws
```

2. Create `tsconfig.json`.
3. Implement config loader.
4. Implement Donut API client.
5. Implement profile selector.
6. Implement BiDi client.
7. Implement Threads automation task.
8. Implement CLI command `threads`.
9. Add README with setup/run instructions.
10. Test against running Donut Browser API.

## Verification plan

### Precondition

- Donut Browser app is running.
- API server enabled in Donut Integrations.
- Default API available at:

```text
http://127.0.0.1:10108
```

- At least one Camoufox profile exists.
- Automation entitlement/terms pass in Donut.

### Manual test

```bash
pnpm dev threads
```

Expected:
1. CLI lists Camoufox profiles.
2. User selects one.
3. CLI calls Donut run endpoint.
4. CLI prints `remote_debugging_port`.
5. CLI connects to `ws://127.0.0.1:{port}/session`.
6. CLI creates BiDi session.
7. CLI navigates to `https://www.threads.com/`.
8. CLI prints title and interactive element count.

### Non-interactive test

```bash
pnpm dev threads --profile <profile-id>
```

### Failure tests

- Donut API not running -> clear error.
- No Camoufox profiles -> clear error.
- Bad profile id -> clear error.
- Run returns `402` -> print automation entitlement missing.
- Run returns `403` -> print terms/API access issue.
- WebSocket connect fails -> print port/ws debug info.
- BiDi `session.new` fails -> print response.

## Future expansion

After first feature works:
- Add batch mode for many profiles.
- Add task files:

```bash
donut-camoufox run-script --profiles profiles.json --script ./tasks/threads-like.ts
```

- Add screenshot/export result.
- Add REST server mode for GUI later.
- Add queue/concurrency controls:

```bash
--concurrency 5
```

- Add GUI later using same SDK.

## Important design notes

- This standalone project should not modify Donut Browser code.
- Donut Browser remains owner of profile launch, fingerprint, proxy, and process lifecycle.
- New project only uses Donut API + BiDi after launch.
- Do not use Playwright for attaching to already-open Camoufox profiles.
- Do not use Chromium CDP `/json` endpoints for Camoufox.
- For Camoufox, always derive WS URL from port:

```ts
`ws://127.0.0.1:${remote_debugging_port}/session`
```

## Deliverable

A standalone CLI project that can run:

```bash
pnpm dev threads
```

and complete:

```text
Donut API -> select Camoufox profile -> launch profile -> get debugging port -> connect BiDi -> open Threads -> count interactive elements -> print console result
```
