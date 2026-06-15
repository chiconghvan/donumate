# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Standalone TypeScript CLI that launches Donut Browser Camoufox profiles and automates them over WebDriver BiDi. Core split:

- `src/cli.ts` parses commands/options with `commander`, then calls the runtime runner.
- `src/runtime/runner.ts` owns profile lifecycle: load script, collect `.flow` inputs, select profile, run pre-launch flow block, launch profile, wait ready, connect BiDi, run main script, close BiDi, kill profile, then run post-kill flow block.
- User automation lives in either TypeScript scripts (`export default async function(ctx)`) or `.flow` DSL scripts.

Prerequisites: Donut Browser running with REST API enabled at `http://127.0.0.1:10108`; at least one Camoufox profile.

## Commands

```bash
pnpm install              # Install dependencies
pnpm typecheck            # Type-check without emit
pnpm build                # TypeScript compile to dist/
pnpm start                # Run CLI via tsx, interactive script/profile selection
pnpm start threads        # Run built-in Threads workflow
pnpm start run --script ./scripts/example.flow --profile <id>
```

No test runner is configured in `package.json`; use `pnpm typecheck` as current verification. There is no single-test command until a test framework is added.

## Running Workflows

```bash
# Built-in workflow
pnpm start threads --profile <profile-id>

# TypeScript workflow
pnpm start run --profile <profile-id> --script ./scripts/my-task.ts

# .flow workflow
pnpm start run --profile <profile-id> --script ./scripts/example.flow

# Override .flow inputs
pnpm start run --profile <profile-id> --script ./scripts/example.flow --input startUrl=https://example.com --input mode=safe

# Omit --profile for interactive Camoufox profile selection
pnpm start run --script ./scripts/example.flow
```

Common options:

```text
--api <url>                 Donut API base URL
--token <token>             Optional bearer token
--profile <profile-id>      Skip profile selector
--headless <boolean>        Launch profile headless
--connect-timeout <ms>      BiDi connect timeout
--command-timeout <ms>      BiDi command timeout
--input <key=value>         Set .flow input value; repeatable
```

## Architecture

### CLI/config layer

- `src/cli.ts` defines root, `run`, and `threads` commands.
- `src/config/load-config.ts` merges CLI flags with `.env` values and validates via `zod`.
- `src/runtime/script-loader.ts` resolves script specs in this order: built-in name (`threads`), absolute path, path relative to `cwd`. It loads TS scripts by dynamic import and `.flow` scripts via the DSL parser.

### Donut profile lifecycle

- `src/donut/api-client.ts` wraps Donut REST API.
- `src/donut/profile-selector.ts` filters/selects Camoufox profiles.
- `src/runtime/runner.ts` is the only place that should orchestrate profile launch/connect/cleanup.

Runner flow for `.flow`:

1. Load `.flow` and parse input definitions/blocks.
2. Collect inputs in one terminal UI frame (`src/ui/run-flow-input-form.ts`).
3. List/select profile.
4. Execute `before run profile` block without page/BiDi access.
5. Launch profile with `GET /v1/profiles/{id}/run`.
6. Wait until profile is running.
7. Connect WebDriver BiDi at `ws://127.0.0.1:{remote_debugging_port}/session` unless API supplies `ws_url`.
8. Initialize `PageAutomation`.
9. Execute TS script or `.flow` `run profile` block.
10. Close BiDi, kill profile, execute `.flow` `after kill profile` block.

### BiDi/page automation

- `src/bidi/bidi-client.ts` is the raw WebDriver BiDi WebSocket client.
- `src/bidi/commands.ts` unwraps remote values.
- `src/runtime/page-automation.ts` provides high-level methods used by TS scripts and `.flow` commands: `goto()`, `waitForLoad()`, `evaluate()`, `info()`, XPath helpers (`waitForXPath()`, `clickXPath()`, `typeXPath()`, `textXPath()`), and interactive element helpers.

Camoufox notes:

- No CDP `/json`, `/json/version`, `/json/list`; use BiDi only.
- BiDi session flow: connect → `session.new` → `browsingContext.getTree` → use first context ID.
- Response discrimination: success responses have `type: "success"`; protocol errors have `type: "error"`.

## Script Types

### TypeScript scripts

Default export function receiving `WorkflowContext`:

```ts
import type { WorkflowContext } from '../src/runtime/types.js';

export default async function(ctx: WorkflowContext) {
  await ctx.page.goto('https://example.com/');
  await ctx.page.waitForLoad();
  const info = await ctx.page.info();
  ctx.log(info.title);
}
```

`WorkflowContext` includes `profile`, `run`, `page`, `bidi`, `log`, `sleep`, `inputs`, and stringified `args`.

### `.flow` scripts

`.flow` supports lifecycle blocks:

```flow
inputs {
  startUrl: input = "https://example.com"
  mode: comboBox ["fast", "safe"] = "safe"
  enabled: checkbox = true
}

before run profile {
  log "Before launch: ${mode}"
}

run profile {
  nav "${startUrl}"
  waitLoad
  info
}

after kill profile {
  log "Browser killed"
}
```

Supported input types: `input` (auto text/number), `text`, `number`, `file`, `folder`, `checkbox`, `comboBox`. Inputs are interpolated as `${name}` inside command args. Full user docs live in `docs/flow-scripting.md`.

Legacy flat `.flow` scripts without block headers are still treated as main logic.

## Donut API Details

Base URL default: `http://127.0.0.1:10108/v1`.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/profiles` | GET | List profiles |
| `/v1/profiles/{id}` | GET | Get profile status/details |
| `/v1/profiles/{id}/run` | GET | Launch browser; query params include `url`, `headless` |
| `/v1/profiles/{id}/kill` | POST | Kill browser process |

Important: run endpoint is GET with query params, not POST JSON.
