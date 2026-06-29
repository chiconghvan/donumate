# Donumate

Donumate is a focused GPM Automate `.gscript` runner for Donut Browser and GPMLogin profiles.

Current scope is intentionally small:

- Run GPMAutomateEditor `.gscript` JSON files.
- Launch and clean up browser profiles through Donut Browser or GPMLogin APIs.
- Drive browser pages through WebDriver BiDi, with Playwright/CDP support for managers that expose CDP.
- Keep dev mode interactive with Ink TUI.
- Keep packaged Windows exe mode readline-based and free of Ink/React runtime UI.

Removed by design:

- `.flow` runtime.
- Script builder.
- Auto update checker/installer.
- Script store release artifacts.
- Profile-name lookup. `--profile` is profile ID only.

## Requirements

- Node.js 22 or newer.
- pnpm 9.15.4.
- Donut Browser with API enabled, or GPMLogin with API enabled.
- A valid GPMAutomateEditor `.gscript` file.

Default API URLs:

- Donut Browser: `http://127.0.0.1:10108`
- GPMLogin: `http://127.0.0.1:19995`

## Install

```bash
pnpm install
```

Optional local config:

```bash
copy .env.example .env
```

## Dev Mode

Dev mode keeps Ink TUI enabled.

```bash
pnpm dev
```

or:

```bash
pnpm start
```

Without `--script`, Donumate opens the TUI script picker. It lists `.gscript` files under `scripts/`, prompts for script inputs when needed, then prompts for a browser profile when `--profile` is not provided.

Run one script directly:

```bash
pnpm start -- run --script ./scripts/auto-post-v4.gscript --manager gpm --profile <profile-id>
```

## Exe Mode

Build Windows exe:

```bash
pnpm build:exe
```

Output:

```text
release/donumate.exe
```

Run:

```bash
.\release\donumate.exe run --script .\scripts\auto-post-v4.gscript --manager gpm --profile <profile-id>
```

Exe mode uses readline prompts instead of Ink. It still uses the same `.gscript`, Bidi, Playwright, Donut, and GPMLogin runtime code as dev mode.

## CLI Options

```text
--manager <donut|gpm>       Browser manager, default donut
--api <url>                 Browser manager API base URL
--token <token>             Donut Browser API bearer token
--profile <profile-id>      Profile ID only; skips profile picker
--headless                  Launch profile headless
--win-size <width,height>   GPMLogin browser window size, for example 800,1000
--connect-timeout <ms>      BiDi/CDP connect timeout, default 30000
--command-timeout <ms>      Runtime command timeout, default 15000
--script <path>             GPMAutomateEditor .gscript path
--input <key=value>         Script input override; repeatable
--minimal-log               Compact runtime logs
```

## Examples

Run with GPMLogin:

```bash
donumate-win-x64.exe run --manager gpm --api http://127.0.0.1:19995 --script .\scripts\auto-post-v4.gscript --profile <profile-id>
```

Run with Donut Browser:

```bash
donumate-win-x64.exe run --manager donut --api http://127.0.0.1:10108 --script .\scripts\auto-post-v4.gscript --profile <profile-id> --token <token>
```

Pass script inputs:

```bash
donumate-win-x64.exe run --script .\scripts\auto-post-v4.gscript --profile <profile-id> --input username=alice --input count=3
```

Run headless with minimal logs:

```bash
donumate-win-x64.exe run --script .\scripts\auto-post-v4.gscript --profile <profile-id> --headless --minimal-log
```

## Runtime Variables

Donumate injects profile values into the `.gscript` execution context:

- `profileID`
- `profileId`
- `profileName`
- `profileProxy`

These values are available to actions through normal gscript variable interpolation.

## Build Commands

```bash
pnpm typecheck
pnpm build
pnpm build:exe
pnpm build:all
pnpm build:clean
```

Build outputs:

- `dist/`: dev bundle with Ink.
- `dist-exe/`: exe bundle without Ink.
- `release/donumate-win-x64.exe`: packaged Windows executable.

## Code Layout

```text
src/cli.ts                    CLI entrypoint
src/config/                   CLI/env config loading
src/browser-manager/          Donut/GPMLogin profile manager abstraction
src/donut/                    Donut API client and profile picker helpers
src/bidi/                     WebDriver BiDi client and command types
src/runtime/gscript/          GPMAutomateEditor .gscript parser/executor/actions
src/runtime/profile-session.ts Launch/connect/cleanup profile sessions
src/runtime/page-automation.ts BiDi page automation implementation
src/runtime/playwright-page-automation.ts Playwright page automation implementation
src/ui/                       Ink UI for dev, readline UI/stubs for exe
src/utils/                    shared errors, abort, logging, retry helpers
scripts/                      sample .gscript files
```

See `cli-guide.md` for detailed exe usage.
