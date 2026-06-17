# Changelog

## 0.0.7

### New features

- **Windows exe auto-update** — CLI checks GitHub Releases at startup, prompts via Ink, downloads newer Windows x64 exe, and hands off replacement to a detached updater script.
- **`--no-update-check`** — skips GitHub update checks for any CLI command.
- **Native release workflow** — GitHub Actions builds Windows, Linux, and macOS binaries with `@yao-pkg/pkg` and publishes tag releases with artifacts.

### Changes

- CLI version now reads from `package.json` instead of a hardcoded value.
- Profile launch now retries failed launch/connect attempts and cleans up partial launches before retrying.
- Donut profile readiness now requires both `is_running === true` and a positive `process_id`.

## 0.0.6

### New features

- **`.flow` expanded command set** — added `navUrl`, tab controls, history/reload/URL helpers, XPath read/count helpers, mouse move, scroll, JS execution, file upload, HTTP request, HTTP download, and `fileReadAllText` commands.
- **Raw `.flow` strings** — no JSON-style escaping needed in script source; runtime handles escaping/serialization.
- **Docs cleanup** — removed doubled backslashes from `.flow` examples; paths now shown in raw form.
- **Loop controls** — added `nextLoop` and `exitLoop` for `while`/`for` bodies.
- **Assignment shorthand** — added `set ${name}=expr` while keeping `set name = expr` and `name = expr` compatible.
- **Result variables** — commands now expose values like `${pageUrl}`, `${elementText}`, `${elementAttribute}`, `${elementCount}`, `${jsResult}`, `${httpStatus}`, `${httpBody}`, `${downloadPath}`, and `${downloadBytes}`.
- **BiDi tab support** — added browsing context create/close/activate wrappers.
- **File upload helper** — loads local files into `input[type=file]` targets and dispatches `input`/`change` events.

### Changes

- `PageAutomation` now exposes higher-level navigation, element, scrolling, JS, tab, and upload helpers for `.flow` and TypeScript scripts.
- `.flow` docs and README now include expanded command examples and command result variables.

## 0.0.3

### New features

- **Human-like typing** — `typeTextXPath()` uses BiDi key actions with random delays per grapheme, pause after spaces/punctuation
- **Human-like mouse movement** — cursor follows Bezier curve with jitter, overshoot on long moves, settle-back on close moves
- **Virtual mouse cursor** — visible red dot injected into page for debugging mouse path
- **`clickXPath()` rewrite** — resolves target coordinates via `getBoundingClientRect`, moves mouse to element center with jitter, then clicks
- **`PasteText` global clipboard lock** — `pasteTextXPath()` now uses process-wide mutex to serialize clipboard + Ctrl+V critical section, safe for future multi-profile concurrent runs
- **Host clipboard writer** — `writeHostClipboardText()` sets Windows clipboard via PowerShell file-based approach, avoids page-context clipboard API race
- **`.flow pastetext` command** — `pastetext "//xpath" "text"` in `run profile` block

### Changes

- `PageAutomation.clickXPath()` — rewritten to use coordinate-based BiDi pointer actions instead of `node.click()`
- `PageAutomation.typeXPath()` — now delegates to `typeTextXPath()` with BiDi key actions
- `PageAutomation.pasteTextXPath()` — clipboard write moved to host process, wrapped in global lock
- `BidiClient` — added `performActions()` and `releaseActions()` public methods
- Removed `PageAutomation.writeClipboardText()` — no longer using in-page clipboard API

## 0.0.2

### New features

- **`.flow` DSL control flow** — `if` / `else if` / `else` / `while` / `for` with indentation-based block syntax
- **Expression evaluator** — arithmetic (`+ - * / %`), comparison (`== != < <= > >=`), logic (`&& || !`), parentheses, function calls
- **`hasElement(xpath)`** — check XPath existence in `.flow` conditions (uses BiDi `document.evaluate`)
- **`loopIndex` variable** — zero-based index of nearest enclosing `for`/`while` loop, auto-restored on nested loop exit
- **`set` / assignment statements** — `set x = expr` or `x = expr` for mutable variables
- **XPath page helpers** — `existsXPath()`, `waitForXPath()`, `clickXPath()`, `typeXPath()`, `textXPath()` on `PageAutomation`
- **`.flow` input UI** — renders `inputs {}` block as interactive CLI form (Tab/arrow/Enter)
- **CLI `--input` option** — override `.flow` inputs from command line (`--input key=value`, repeatable)
- **Lifecycle blocks** — `before run profile {}`, `run profile {}`, `after kill profile {}` with validation
- **`.flow` script loader** — detect `.flow` extension, parse to AST, execute via interpreter
- **Script selector** — interactive prompt now lists `.ts` and `.flow` files
- **Loop guard** — 10,000 iteration cap on `while`/`for` to prevent infinite loops

### Changes

- Runner refactored to 6-step flow: load script → collect inputs → load profile → launch → run → cleanup
- `BidiClient.evaluate()` now defaults `awaitPromise: true`
- `WorkflowContext` gains `inputs` field (typed `FlowInputValue` map)
- `WorkflowContext.args` remains as string map for backward compatibility
- `CLAUDE.md` and `README.md` updated with `.flow` documentation

### Bug fixes

- BiDi connect retry on initial connection failure

## 0.0.1

- Initial release
- Donut REST API client (list/get/run/kill profiles)
- Camoufox profile selector (interactive)
- WebDriver BiDi client (connect, navigate, evaluate)
- `PageAutomation` class (goto, waitForLoad, evaluate, info, interactive element counting)
- TypeScript workflow scripts with `WorkflowContext`
- Built-in `threads` workflow
- `.env` + CLI flag config merging via zod
