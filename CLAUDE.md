# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Standalone CLI that launches Donut Browser Camoufox profiles and automates them over WebDriver BiDi protocol. Architecture: **runtime/runner** (core) + **user scripts** (automation logic).

**Prerequisites:** Donut Browser running with REST API enabled at `http://127.0.0.1:10108`. At least one Camoufox profile.

## Commands

```bash
pnpm install              # Install dependencies
pnpm build                # TypeScript compile (tsc)
pnpm start <command>      # Run via tsx (dev mode)
pnpm typecheck            # Type-check without emit
```

## Running

```bash
# Generic runner - user script
pnpm start run --profile <id> --script threads
pnpm start run --profile <id> --script ./scripts/my-task.ts

# Built-in threads command
pnpm start threads --profile <id>

# Interactive profile selection (omit --profile)
pnpm start threads
```

## Architecture

```
src/
  cli.ts                    # CLI entry point (thin, delegates to runner)
  runtime/
    types.ts                # WorkflowContext, WorkflowScript types
    page-automation.ts      # PageAutomation class (high-level BiDi wrapper)
    script-loader.ts        # Dynamic import of user scripts
    runner.ts               # Core runner: launch → wait ready → connect BiDi → call script
  donut/
    api-client.ts           # Donut REST API client (list, get, run, kill, waitForReady)
    api-types.ts            # Zod schemas + types for API responses
    profile-selector.ts     # CLI interactive profile picker
  bidi/
    bidi-client.ts          # Raw WebDriver BiDi WebSocket client
    bidi-types.ts           # BiDi protocol types
    commands.ts             # Remote value unwrapping
  automation/
    interactive-elements.ts # JS expressions for counting interactive elements
    threads-task.ts         # Legacy hard-coded task (deprecated, use scripts/threads.ts instead)
  config/
    load-config.ts          # .env + CLI flag loader
    types.ts                # AppConfig type
  utils/
    errors.ts               # AppError class
    logger.ts               # Console logger
    retry.ts                # sleep() helper
scripts/
  threads.ts                # Built-in threads workflow script
```

## Key Design Patterns

**Runner flow:** The runner (`src/runtime/runner.ts`) handles all profile lifecycle:
1. List/select Camoufox profile via Donut API
2. Launch profile (`GET /v1/profiles/{id}/run`)
3. Poll profile status until `is_running=true` (`GET /v1/profiles/{id}`)
4. Connect BiDi WebSocket to `ws://127.0.0.1:{port}/session`
5. Initialize `PageAutomation` (session + context)
6. Dynamic-import user script, call with `WorkflowContext`
7. Cleanup (close BiDi, optional kill profile)

**User scripts:** Export default async function receiving `WorkflowContext`:
```ts
import type { WorkflowContext } from '../src/runtime/types.js';

export default async function(ctx: WorkflowContext) {
  await ctx.page.goto('https://example.com/');
  await ctx.page.waitForLoad();
  const info = await ctx.page.info();
  ctx.log(info.title);
}
```

**PageAutomation API:** High-level wrapper over raw BiDi — `goto()`, `waitForLoad()`, `evaluate()`, `info()`, `countInteractiveElements()`, `getButtons()`. Raw BiDi client available via `ctx.bidi`.

**Script resolution:** `src/runtime/script-loader.ts` resolves script spec: built-in name (`threads` → `scripts/threads.ts`) → absolute path → relative to cwd. Uses `pathToFileURL()` for Windows compatibility.

## Donut API (REST)

Base: `http://127.0.0.1:10108/v1` — no auth required.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/profiles` | GET | List profiles |
| `/v1/profiles/{id}` | GET | Get profile (check `is_running`, `process_id`) |
| `/v1/profiles/{id}/run` | GET | Launch browser (query params: `url`, `headless`) |
| `/v1/profiles/{id}/kill` | POST | Kill browser process |

**Important:** The run endpoint is **GET** with query params, not POST with JSON body. See `api-donutbrowser-guide.md` for full API reference.

## Camoufox BiDi Notes

- No CDP `/json`, `/json/version`, `/json/list` — Camoufox returns 404 for these
- BiDi endpoint: `ws://127.0.0.1:{remote_debugging_port}/session`
- Session flow: connect → `session.new` → `browsingContext.getTree` → use first context ID
- Response type discrimination: `{"type":"success","id":N,"result":...}` vs `{"type":"error",...}`
