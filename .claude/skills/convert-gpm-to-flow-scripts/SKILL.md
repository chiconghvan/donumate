---
name: convert-gpm-to-flow-scripts
description: This skill should be used when the user asks to "convert GPM to Flow", "convert .gscript to .flow", "chuyển gscript sang flow", "convert GPM Automate script", or provides a GPMAutomateEditor .gscript JSON file and wants a valid Donumate .flow script.
---

# Convert GPM to Flow scripts

Convert GPMAutomateEditor `.gscript` JSON exports into Donumate `.flow` scripts that match this project's runtime exactly.

## Required reference loading

Before converting, read bundled references from this skill, not project-relative `./docs`, so conversion works from any current directory:

1. `references/flow-scripting.md`
2. `references/flow-functions-cheatsheet.md`
3. `references/flow-ai-guide.md`
4. `references/gpm-to-flow-conversion-guide.md`
5. Source `.gscript` file

If a Donumate project is present, also inspect `src/runtime/dsl/executor.ts` for runtime truth, especially current `rDelay` and `httpRequest` behavior. Prefer runtime/source over docs when conflict exists.

## Output rules

Produce valid `.flow` only:

- Use `inputs {}`, `before()`, `running()`, `after()` blocks.
- Put browser/page commands only in `running()`.
- Put prep HTTP/log/file commands without browser access in `before()` when source block is `before_init`.
- Put cleanup/log commands in `after()` when source block is `after_quit`.
- Use `command(arg1, arg2)` format for every command.
- Keep each command call on one physical line, even if long.
- Keep `httpRequest(...)` header/body on one physical line.
- Use raw strings. Do not add JSON-style escaping for quotes/backslashes. Prefer single-quoted `.flow` strings around XPath containing double quotes.
- Keep Windows paths raw, e.g. `'E:\OneDrive\0. Threads\Log\change-name.txt'`; do not double-escape for JSON.
- Preserve nested `if/else` indentation. Do not add braces for `if` bodies unless source `.flow` patterns require braces.
- Preserve comments only if helpful; conversion correctness beats comment completeness.

## Mandatory `httpRequest` format

For GPM HTTP action (`type: 29`), pass headers and body as quoted JSON strings. Header must be a JSON object wrapped in `{}`.

Correct one-line format:

```flow
httpRequest("http://127.0.0.1:8089/v1/events/profile-init", POST, '{"Content-Type": "application/json"}', '{"action_name": "change_ig_name", "profileName": "test name","proxy": "null"}')
```

When interpolating variables:

```flow
httpRequest('http://127.0.0.1:${port}/v1/events/profile-init', POST, '{"Content-Type": "application/json"}', '{"action_name": "change_ig_name", "profileName": "${profileName}","proxy": "${profileProxy}"}')
```

Do not emit unquoted header/body objects like `{"Content-Type":"application/json"}` as raw args for converted GPM scripts. Use quoted JSON strings to keep argument parsing stable.

## Core conversion workflow

1. Parse `.gscript` as JSON.
2. Identify root blocks:
   - `before_init` -> `before()`
   - `main_logic` -> `running()`
   - `after_quit` -> `after()`
3. Walk each block's `nodes` in order.
4. Convert each node by `$type`:
   - `ActionNode` -> one `.flow` command or assignment
   - `IfBlockNode` -> `if <expression>` plus converted child nodes
   - `ElseBlockNode` -> `else` plus converted child nodes
5. Preserve node order exactly.
6. For each `ActionNode`, parse `raw_input` JSON into key/value map.
7. Convert node `delay` into `rDelay(min,max)` appended as final command argument, not separate `delay(...)`, unless source action is itself a delay/sleep action.
8. Keep `output_variable_name` by assignment when command returns value.
9. Map variable syntax from GPM `$name` to `.flow` interpolation `${name}` inside command strings. In expressions/assignments use variable names directly.
10. Verify generated `.flow` line-by-line against runtime command arity.

## Delay rule: critical

GPM node field:

```json
"delay": "3000,4000"
```

means random delay after that action completes.

Convert to appended `rDelay`:

```flow
nav('https://www.instagram.com/', rDelay(3000,4000))
waitElement('//xpath', 60000, rDelay(3000,4000))
typeText('//input', '${username}', rDelay(1000,3000))
```

Do not convert action-level delay into a separate `delay(...)` before/after command unless runtime lacks `rDelay`. This project's runtime supports final-argument `rDelay` and `rDelay(min,max)`.

## Common node mapping

Use `references/gpm-to-flow-conversion-guide.md` for detailed mapping and checklist.

Quick mapping:

| GPM action | Meaning | `.flow` |
|---|---|---|
| `type: 39` | navigate URL | `nav(url, rDelay(...))` |
| `type: 42` | current URL | `name = getUrl()` |
| `type: 44` | wait XPath | `waitElement(xpath, timeout, rDelay(...))` |
| `type: 48` | click XPath | `click(xpath, rDelay(...))` |
| `type: 54` | type text | `typeText(xpath, text, rDelay(...))` |
| `type: 29` | HTTP request | `httpRequest(url, method, headersJsonString, bodyJsonString, rDelay(...))` |
| `type: 20` | write log/file | `fileWriteAllText(...)` with read-old + rewrite when append needed |
| `type: 7` | delay | `delay(min, max)` |
| `type: 76` | stop/exit | Prefer `log(...)` or omit if no runtime equivalent; document gap |

## Final response after conversion

Report:

- output file path
- whether logic preserved 100%
- any unavoidable runtime gaps, especially append-file vs overwrite or stop/exit semantics
- verification run status if executed

Keep explanation terse unless user asks for full walkthrough.
