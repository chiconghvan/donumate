# Gscript Runtime

## Overview
Donumate now runs GPM Automate `.gscript` workflows by default. The CLI entry points are:

```bash
pnpm start -- --script ./scripts/example.gscript
pnpm start -- run --script ./scripts/example.gscript
```

Without `--script`, the interactive UI lists `.gscript` files from `./scripts/`.

## Runtime Layout
- `src/cli.ts`: root and `run` commands, both dispatching to `runGscriptWorkflow()`.
- `src/runtime/gscript/parser.ts`: reads `.gscript` JSON, parses the node tree, extracts user inputs, and validates required root blocks.
- `src/runtime/gscript/runner.ts`: resolves inputs, selects a Camoufox/Weyfern profile, launches the browser profile, creates context, and runs the workflow phases.
- `src/runtime/gscript/executor.ts`: executes blocks, loops, conditions, failed blocks, and `next` / `exit` / `stop` signals.
- `src/runtime/gscript/actions.ts`: maps GPM action node types to browser, file, HTTP, Excel, cookie, and variable operations.

## Execution Flow
1. Load `.gscript` and collect inputs from action `type = 1` with `ALLOW_USER_INPUT = true`.
2. Show the input form when needed and save local input state for reuse.
3. Select or load a Camoufox/Weyfern profile.
4. Run `before_init`.
5. Launch the profile, then attach `run`, `bidi`, and `page` to the execution context.
6. Run `main_logic`.
7. Always clean up and run `after_quit`, including after failures.

`while` loops have a safety limit of `10000` iterations. A `failed_block` runs only when the action enables `use_failed_block`.

## Script Usage
- Put files in `./scripts/` or pass an absolute/relative path with `--script`.
- Use clear names such as `login.gscript` or `scrape-profile.gscript`.
- Invalid JSON or missing `before_init` / `main_logic` / `after_quit` stops early with a detailed error.

## Inputs
For non-interactive runs, pass input values with repeated `--input key=value` flags:

```bash
donumate.exe --script .\scripts\example.gscript --input username=demo --input password=secret
```

Rules:
- Each value is one `key=value` pair.
- Repeating a key uses the last value.
- Quote values with spaces according to your shell, for example PowerShell: `--input query="camera lens"`.
- `checkbox` inputs accept `true` or `false`.
- `number` inputs accept numeric text, for example `--input retryCount=3`.

Values are available in `ctx.inputs` and stringified in `ctx.args`. If every declared input is present in `--input`, the input form is skipped.

## EXE Build
Build the Windows executable with:

```bash
pnpm build:exe
```

The build bundles `src/cli.ts` into `dist-exe/cli.js`, packages `release/donumate-win-x64.exe`, and uses the UI stubs under `src/ui/` for the executable build.
