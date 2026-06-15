# Changelog

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
