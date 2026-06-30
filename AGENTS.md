# Repository Guidelines

## Project Identity

Donumate is a TypeScript CLI for running GPMAutomateEditor `.gscript` JSON workflows against Donut Browser and GPMLogin browser profiles.

Current supported product surface:

- `.gscript` runtime only.
- Donut Browser profile launch/list/get/close.
- GPMLogin profile launch/list/get/close.
- WebDriver BiDi page automation.
- Playwright/CDP page automation where profile manager exposes CDP.
- Dev CLI with Ink TUI.
- Packaged Windows exe with readline UI and no Ink/React runtime UI.

Do not reintroduce:

- `.flow` runtime, parser, checker, commands, examples, or docs.
- Script builder or flow editor.
- Auto update checker/installer.
- Script store, script manifest, or scripts.zip release artifacts.
- Profile-name lookup. `--profile` is profile ID only.

## Mandatory Code Search Rule

Always use `semble_search` before any code action. Use focused natural-language queries. Examples:

```text
gscript runner profile launch inputs
browser manager gpm donut close profile
build exe ink readline stub
```

Use `grep`, `glob`, and `read` only after `semble_search`, for exact path lookup, exhaustive literal matches, or full-file inspection of returned locations.

Do not guess file locations. Search first, then edit.

## Commands

Install:

```bash
pnpm install
```

Run dev Ink CLI:

```bash
pnpm dev
pnpm start
```

Typecheck:

```bash
pnpm typecheck
```

Build dev bundle:

```bash
pnpm build
```

Build Windows exe:

```bash
pnpm build:exe
```

Full build:

```bash
pnpm build:all
```

Clean generated output:

```bash
pnpm build:clean
```

## Runtime Behavior

Runtime lifecycle:

1. Load `.gscript` JSON file.
2. Parse `before_init`, `main_logic`, and `after_quit` blocks.
3. Collect user inputs from action type `1` where `ALLOW_USER_INPUT=true`.
4. Resolve inputs from `--input` overrides or UI prompts.
5. Resolve profile by profile ID when `--profile` is provided, otherwise show profile picker.
6. Inject runtime profile variables: `profileID`, `profileId`, `profileName`, `profileProxy`.
7. Execute `before_init` before launching profile.
8. Launch browser profile only when `main_logic` has executable nodes.
9. Connect page automation through BiDi or Playwright/CDP depending manager response.
10. Execute `main_logic`.
11. Close automation connection and browser profile.
12. Execute `after_quit` after cleanup.

## Folder Structure

```text
.github/workflows/            GitHub Actions release workflow
scripts/                      sample and local .gscript files
src/                          TypeScript source
src/bidi/                     WebDriver BiDi client
src/browser-manager/          Donut/GPMLogin manager abstraction
src/config/                   CLI/env config loader
src/donut/                    Donut API client and profile selection helpers
src/runtime/                  runtime primitives shared by gscript
src/runtime/gscript/          gscript parser/executor/action runtime
src/ui/                       Ink dev UI, readline exe UI, UI stubs
src/utils/                    errors, retry, abort, logging, runtime helpers
dist/                         generated dev bundle
dist-exe/                     generated exe bundle
release/                      generated Windows exe output
```

## Important Files

`src/cli.ts`

- CLI entrypoint.
- Defines root command and `run` command.
- Owns CLI options.
- Keeps Ink TUI in dev when no `--script` is provided.
- Must not import update code.

`src/config/load-config.ts`

- Merges CLI options and env defaults.
- Selects default API URL for Donut or GPMLogin.
- Parses timeout and headless settings.

`src/browser-manager/types.ts`

- Shared browser-manager contract.
- Manager kinds: `donut`, `gpm`.
- Launch options: headless and optional GPM window size.

`src/browser-manager/index.ts`

- Factory for Donut or GPMLogin manager.

`src/browser-manager/donut-manager.ts`

- Donut Browser manager implementation.
- Uses `DonutApiClient`.

`src/browser-manager/gpm-manager.ts`

- GPMLogin manager implementation.
- Calls GPMLogin local API.
- Normalizes GPM profiles into shared profile shape.

`src/donut/api-client.ts`

- HTTP client for Donut Browser API.
- Handles profile list/get/run/close calls.

`src/donut/profile-selector.ts`

- UI-based profile picker.
- Used only when `--profile` is not provided.

`src/bidi/bidi-client.ts`

- WebSocket client for WebDriver BiDi.
- Manages request IDs, pending responses, and command timeouts.

`src/bidi/commands.ts`

- BiDi command helpers and remote value conversion.

`src/runtime/profile-session.ts`

- Launches profile with retry.
- Connects BiDi or Playwright/CDP.
- Returns active automation session.

`src/runtime/page-automation.ts`

- BiDi-backed `BrowserPageAutomation` implementation.
- Handles navigation, XPath, keyboard, mouse, scroll, JS, upload, tabs, cookies.

`src/runtime/playwright-page-automation.ts`

- Playwright-backed `BrowserPageAutomation` implementation.
- Used when runtime connects through CDP.

`src/runtime/page-automation-types.ts`

- Shared interface used by gscript actions.

`src/runtime/input-types.ts`

- Runtime input type model.

`src/runtime/input-values.ts`

- Input coercion, validation, and stringification.

`src/runtime/input-state-store.ts`

- Stores last input values in temp directory.

`src/runtime/gscript/parser.ts`

- Loads GPMAutomateEditor JSON.
- Parses supported action/block nodes.
- Collects user-input definitions.

`src/runtime/gscript/executor.ts`

- Executes blocks, loops, conditionals, and action sequences.

`src/runtime/gscript/actions.ts`

- Maps supported GPM action type IDs to runtime behavior.
- Uses file system, HTTP, Excel, page automation, cookies, JS, keyboard, mouse, tabs, scroll, and TOTP helpers.

`src/runtime/gscript/runner.ts`

- Owns end-to-end gscript workflow lifecycle.
- Do not fork this for exe; exe must use same runtime.

`src/runtime/gscript/script-selector.ts`

- Lists `.gscript` files from `scripts/` for interactive mode.

`src/ui/ui-provider.ts`

- Selects Ink UI for TTY dev mode.
- Selects readline UI when `DONUMATE_READLINE=1`, `DONUMATE_READLINE=true`, or stdin is not TTY.

`src/ui/ui-ink.ts`

- Ink provider for list picker and text input.

`src/ui/ui-readline.ts`

- Readline provider used by exe/stub path.

`src/ui/stub-ink.ts`, `src/ui/stub-react.ts`, `src/ui/stub-ink-bridge.ts`

- Build-time stubs to keep exe free of Ink/React runtime UI.

`build.mjs`

- Build orchestrator.
- `dev` uses tsup and keeps Ink.
- `exe` uses esbuild, redirects Ink/React imports to stubs, then packages with `@yao-pkg/pkg`.

`tsup.config.ts`

- Dev bundle config.

`.github/workflows/release.yml`

- Builds Windows exe and publishes it to GitHub Releases.
- Must not publish script store artifacts.

## CLI Rules

Keep supported options aligned with `cli-guide.md`:

- `--manager <donut|gpm>`
- `--api <url>`
- `--token <token>`
- `--profile <profile-id>`
- `--headless`
- `--win-size <width,height>`
- `--connect-timeout <ms>`
- `--command-timeout <ms>`
- `--script <path>`
- `--input <key=value>`
- `--minimal-log`

`--profile` is always profile ID. Do not add name matching unless explicitly requested later.

## Build Rules

Dev build and exe build must use the same gscript runtime files. Do not create a separate exe-only runtime.

Exe build may replace UI dependencies with stubs, but must preserve:

- gscript parser/executor/actions.
- BiDi runtime.
- Playwright runtime.
- Donut manager.
- GPMLogin manager.

## Verification

Minimum verification after code changes:

```bash
pnpm typecheck
```

For build/runtime changes:

```bash
pnpm build
pnpm build:exe
```

Smoke tests:

```bash
pnpm start -- --help
.\release\donumate_v<version>.exe --help
```

If local API/profile is available:

```bash
.\release\donumate_v<version>.exe run --manager gpm --api http://127.0.0.1:19995 --script .\scripts\auto-post-v4.gscript --profile <profile-id> --minimal-log
```

## Coding Style

- TypeScript ESM.
- Strict types.
- 2-space indentation.
- Prefer small targeted changes.
- Keep shared types near owning feature.
- Avoid compatibility shims unless there is persisted data, shipped behavior, or explicit requirement.
- Do not modify generated `dist/`, `dist-exe/`, or `release/` unless building.

## Documentation Rule

Docs must describe current gscript-only behavior. Do not document removed `.flow`, builder, update, or script-store features.
