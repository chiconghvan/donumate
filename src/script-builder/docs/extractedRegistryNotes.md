# Extracted Registry Notes

Source set scanned before implementation:

- `CLAUDE.md`
- `README.md`
- `docs/flow-scripting.md`
- `docs/flow-ai-guide.md`
- `docs/flow-functions-cheatsheet.md`
- `scripts/*.flow`

## Commands extracted from docs/runtime spec

Canonical command nodes:

1. `goto`
2. `newTab`
3. `closeTab`
4. `activeTab`
5. `backNav`
6. `reloadNav`
7. `getUrl`
8. `waitUrlChange`
9. `waitLoad`
10. `waitElement`
11. `getElementAttribute`
12. `getElementText`
13. `countElement`
14. `click`
15. `typeText`
16. `pasteText`
17. `moveMouse`
18. `scroll`
19. `js`
20. `fileUpload`
21. `info`
22. `httpRequest`
23. `httpDownload`
24. `fileWriteAllText`
25. `fileAppendText`
26. `sendKey`
27. `exit`
28. `writeExcel`
29. `delay`
30. `log`
31. `help`

Aliases mentioned in docs/runtime:

- `nav` -> `goto`
- `navUrl` / `navurl` -> `goto`
- `waitXPath` -> `waitElement`
- `type` -> `typeText`
- `executeJs` / `executeJS` -> `js`
- `sleep` -> `delay`

## Expression functions extracted

1. `getUrl()`
2. `httpRequest()`
3. `js()`
4. `getElementText()`
5. `getElementAttribute()`
6. `countElement()`
7. `hasElement()`
8. `existsXPath()`
9. `splitText()`
10. `contains()`
11. `readJson()`
12. `randomNum()`
13. `fileExist()`
14. `folderExist()`
15. `getFiles()`
16. `arrayLength()`
17. `readExcel()`
18. `findRow()`
19. `fileReadAllText()`
20. `2FA()`

## Blocks / control flow extracted

1. `inputs { ... }`
2. `before() { ... }`
3. `running() { ... }`
4. `after() { ... }`
5. `if`
6. `else if`
7. `else`
8. `while`
9. `for`
10. `nextLoop`
11. `exitLoop`
12. comments `# ...`
13. comments `// ...`
14. legacy flat script mode

## Variable syntax extracted

- `${name}`
- `${expression}`
- `${inputExcelFile[B]}`
- `set name = value`
- `name = value`
- `a = b`
- `parts[0]`
- `inputExcelFile("B")`
- string interpolation inside command args: `log("value=${name}")`

## Selector / expression / condition notes

- Selector syntax in docs is XPath-first.
- `if` / `while` / `for` conditions use expression parser operators: `!`, `-`, `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `<`, `<=`, `>`, `>=`, `&&`, `||`.
- `for` syntax is `for init; condition; update`.
- `rDelay()`, `rDelay(min,max)` is allowed as the last command argument.
- Strings are raw and keep backslashes literal.
- Quotes inside same-quoted strings use doubled quotes.

## Mapping command -> node type

- `command.<canonicalName>`
- examples: `command.goto`, `command.waitElement`, `command.httpRequest`

## Mapping block -> node type

- `block.if`
- `block.while`
- `block.for`
- `block.nextLoop`
- `block.exitLoop`
- `variable.assignment`
- `meta.comment`
- `raw.command`
- `raw.block`
- entry meta nodes:
  - `meta.entry.before`
  - `meta.entry.running`
  - `meta.entry.after`

## Sample files found

1. `scripts/a.flow`
2. `scripts/auto-post-v4.flow`
3. `scripts/changeIGName.flow`
4. `scripts/example.flow`
5. `scripts/excel-test.flow`
6. `scripts/test chec.flow`
7. `scripts/test input-ui.flow`
8. `scripts/test-interaction-flow.flow`

## Uncertain / TODO

- Docs do not explicitly document every runtime command shown in `runtime-spec.ts` or used by samples, so the builder uses runtime spec as the canonical command registry and keeps unsupported/unknown lines as raw nodes.
- Nested standalone comments are preserved best-effort; inline comments remain safest when the node keeps `useRawSource = true`.
- Sample flows use some malformed or legacy constructs; importer keeps round-trip safety by preserving raw source on imported nodes until edited.
