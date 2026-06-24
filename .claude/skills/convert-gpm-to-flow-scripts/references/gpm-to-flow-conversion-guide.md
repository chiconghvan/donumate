# GPM `.gscript` to Donumate `.flow` conversion guide

Use this reference when converting GPMAutomateEditor JSON exports into Donumate `.flow`.

## 1. `.gscript` structure

Typical root:

```json
{
  "$type": "GPMAutomateEditor.Models.Editor, GPMAutomateEditor.Models",
  "before_init": { "nodes": [...] },
  "main_logic": { "nodes": [...] },
  "after_quit": { "nodes": [...] }
}
```

Convert blocks:

```flow
inputs {
  # inferred external values
}

before() {
  # before_init nodes
}

running() {
  # main_logic nodes
}

after() {
  # after_quit nodes
}
```

`before()` and `after()` cannot use page/browser commands. Put `nav`, `waitElement`, `click`, `typeText`, `getUrl`, `hasElement`, `js`, etc. only in `running()`.

## 2. ActionNode fields

Example:

```json
{
  "$type": "GPMAutomateEditor.Models.ActionNode, GPMAutomateEditor.Models",
  "type": 39,
  "element_xpath": null,
  "output_variable_name": null,
  "delay": "3000,4000",
  "raw_input": "[{\"Key\":\"URL\",\"Value\":\"https://www.instagram.com/\"},{\"Key\":\"TIME_OUT\",\"Value\":\"60\"}]"
}
```

Interpretation:

- `type`: action kind.
- `element_xpath`: primary XPath for element actions.
- `output_variable_name`: destination variable for actions/functions that return value.
- `delay`: random delay after action finishes. Convert to appended `rDelay(min,max)`.
- `raw_input`: JSON array of key/value pairs. Parse first, then map by key.

## 3. Mandatory output format

Generate `.flow` like project docs/runtime expect:

- Every command/function call uses parentheses: `name(arg1, arg2)`.
- Every command call sits on one physical line.
- Do not split long `httpRequest` bodies across lines.
- Prefer single quotes for XPath strings containing double quotes.
- Do not add JSON escaping for raw `.flow` strings, except JSON text passed as quoted `httpRequest` header/body strings must be valid JSON text.
- Use `${name}` only inside command arg strings.
- Use bare variable names in expressions/assignments.

Correct:

```flow
currentUrl = getUrl()
if contains(currentUrl, 'suspended')
  log('Sus')
else
  click('//div[@role="dialog"]//button[2]', rDelay(1500,3000))
```

Incorrect:

```flow
currentUrl = ${getUrl()}
if "$currentUrl contains suspended"
  click("//div[@role=\"dialog\"]//button[2]")
```

## 4. HTTP request conversion — mandatory

GPM `type: 29` maps to `httpRequest(url, method, headersJSON, bodyJSON, optional rDelay)`.

For converted GPM scripts, always pass `headersJSON` and body as quoted JSON strings, not raw object args. Header must be wrapped in `{}` as a JSON object.

Correct:

```flow
httpRequest("http://127.0.0.1:8089/v1/events/profile-init", POST, '{"Content-Type": "application/json"}', '{"action_name": "change_ig_name", "profileName": "test name","proxy": "null"}')
```

With interpolation:

```flow
httpRequest('http://127.0.0.1:${port}/v1/events/profile-init', POST, '{"Content-Type": "application/json"}', '{"action_name": "change_ig_name", "profileName": "${profileName}","proxy": "${profileProxy}"}')
```

With post-action delay:

```flow
httpRequest('http://127.0.0.1:${port}/v1/events/action-status', POST, '{"Content-Type": "application/json"}', '{"action_name":"change_ig_name","profileName":"${profileName}","status":"pending","message":"Input Username"}', rDelay(1000,2000))
```

Avoid this in converted GPM output:

```flow
httpRequest('http://127.0.0.1:${port}/v1/events/action-status', POST, {'Content-Type':'application/json'}, {'status':'pending'})
```

Reason: quoted JSON strings keep the `.flow` argument parser stable and mirror GPM `HEADER`/`DATA` raw string fields.

Ignore `USE_PROFILE_PROXY` unless runtime exposes proxy selection.

## 5. Delay conversion

GPM `delay` field is post-action delay.

| GPM delay | Flow conversion |
|---|---|
| `"0,0"` | omit `rDelay` |
| `"3000,4000"` | append `rDelay(3000,4000)` |
| `"1000,1000"` | append `rDelay(1000,1000)` or use `rDelay(1000,1000)` for exact preservation |

Examples:

```flow
nav('https://site.test/', rDelay(3000,4000))
waitElement('//input', 30000, rDelay(1000,3000))
click('//button', rDelay(1500,3000))
typeText('//input', '${username}', rDelay(1000,3000))
httpRequest('http://127.0.0.1:8089/v1/events/action-status', POST, '{"Content-Type":"application/json"}', '{"status":"pending"}', rDelay(1000,2000))
```

Do not create separate `delay(3000,4000)` after each action when `rDelay` exists. Use separate `delay(...)` only for GPM sleep/delay action nodes.

## 6. Variables and inputs

Identify external variables used in `.gscript`:

- `$port`
- `$profileName`
- `$profileProxy`
- `$profileId`
- `$inputExcel[B]`
- other `$name` references

Declare them in `inputs {}` or assign known constants.

Examples:

```flow
inputs {
  port: input = "8089"
  profileName: input = ""
  profileProxy: input = ""
  profileId: input = ""
  inputExcelFile: file
}
```

GPM `$inputExcel[B]` has no literal `.flow` equivalent unless an Excel file and row are known. Use one of these, based on project/user context:

```flow
username = readExcel(inputExcelFile, B, 2)
```

or if user has already replaced source value:

```flow
username = "expression.bg._"
```

Then use:

```flow
typeText('//input', '${username}')
```

## 7. Node type mapping

### `type: 39` — navigate URL

GPM raw input keys: `URL`, `TIME_OUT`.

```flow
nav('https://www.instagram.com/', rDelay(3000,4000))
```

Use `TIME_OUT` only if runtime has navigation timeout command support. Current `nav` command takes URL only, so ignore `TIME_OUT` unless adding explicit wait after navigation.

### `type: 42` — get current URL

Use output variable if present:

```flow
currentUrl = getUrl()
```

### `type: 29` — HTTP request

Raw keys: `URL`, `METHOD`, `HEADER`, `DATA`, `USE_PROFILE_PROXY`.

Use mandatory quoted JSON string format described above.

```flow
httpRequest('http://127.0.0.1:${port}/v1/events/action-status', POST, '{"Content-Type":"application/json"}', '{"action_name":"change_ig_name","profileName":"${profileName}","status":"pending","message":"Input Username"}')
```

### `type: 44` — wait element by XPath

Use `element_xpath` and raw `TIME_OUT` seconds converted to ms.

```flow
waitElement('//input', 30000, rDelay(1000,3000))
```

If GPM timeout is `60`, use `60000`.

### `type: 48` — click

Raw keys: `CLICK_TYPE`, `XPATH`, `POS`.

```flow
click('//a[contains(@href,"/accounts/edit/")]', rDelay(1000,3000))
```

Use `XPATH` over `element_xpath` if raw key exists.

### `type: 54` — type text

Use `element_xpath` and raw `KEY`.

```flow
typeText('//input', '${username}', rDelay(1000,3000))
```

If source has delay per key (`DELAY_PRESS`), current flow `typeText` does not expose per-key delay in command signature. Preserve node-level delay with `rDelay`; document per-key delay gap only if exact typing cadence matters.

### `type: 20` — file write/log

Runtime `fileWriteAllText` overwrites. If GPM action appends log, emulate append:

```flow
logPath = 'E:\OneDrive\0. Threads\Log\change-name.txt'
if fileExist(logPath)
  logText = fileReadAllText(logPath)
  fileWriteAllText(logPath, '${logText}\n[${profileName}]: [${username}] - Done')
else
  fileWriteAllText(logPath, '[${profileName}]: [${username}] - Done')
```

Keep each `fileWriteAllText(...)` one line.

### `type: 7` — delay/sleep

Raw keys `MIN`, `MAX`.

```flow
delay(4000, 6000)
```

### `type: 76` — exit/stop

No direct documented flow command. Options:

- If branch is terminal and rest is in `else`, no command needed.
- If later commands would still run incorrectly, restructure as `if/else` to avoid needing exit.
- If impossible, add `log('Exit requested')` and report runtime gap.

## 8. Conditions

GPM condition strings often look like:

```text
$currentUrl contains suspended
hasElement(//div[@role="dialog"]//button[2])
```

Convert to valid expression syntax:

```flow
if contains(currentUrl, 'suspended')
  ...

if hasElement('//div[@role="dialog"]//button[2]')
  ...
```

Supported expressions in this runtime:

- `contains(left, right)`
- `hasElement(xpath)` / `existsXPath(xpath)`
- `getUrl()`
- comparisons: `==`, `!=`, `<`, `<=`, `>`, `>=`
- booleans: `&&`, `||`, `!`
- arithmetic for loops

## 9. Nested branch conversion

GPM blocks:

```json
IfBlockNode { nodes: [...] }
ElseBlockNode { nodes: [...] }
```

Convert preserving nesting:

```flow
if hasElement('//valid')
  log('valid')
  if hasElement('//confirm')
    log('done')
  else
    log('failed')
else
  log('invalid')
```

Do not flatten branches if doing so changes execution order.

## 10. Common Instagram workflow pattern

GPM sequence:

1. Navigate Instagram.
2. Get current URL.
3. If suspended, report suspended.
4. Else wait/click avatar.
5. Dismiss dialog if exists.
6. Walk profile edit/account center/profile/Instagram/username.
7. Type username.
8. Wait valid username indicator.
9. Click Done.
10. Confirm still on username/profile screen.
11. Log Done/Error.

Flow pattern:

```flow
nav('https://www.instagram.com/', rDelay(3000,4000))
currentUrl = getUrl()
if contains(currentUrl, 'suspended')
  log('Sus')
else
  waitElement('//avatar-xpath', 60000, rDelay(3000,4000))
  click('//avatar-xpath')
  if hasElement('//div[@role="dialog"]//button[2]')
    click('//div[@role="dialog"]//button[2]')
  ...
```

## 11. Conversion checklist

Before finalizing:

- [ ] Read bundled skill references, not project-relative docs.
- [ ] Parse every `raw_input` and preserve each relevant key.
- [ ] Convert every nonzero action `delay` to appended `rDelay(min,max)`.
- [ ] Preserve all node order.
- [ ] Preserve nested if/else structure.
- [ ] Keep every command on one line.
- [ ] Use raw strings, no JSON-style escaping except valid quoted JSON text inside `httpRequest` header/body args.
- [ ] For `httpRequest`, wrap header in `{}` and quote header/body JSON strings.
- [ ] Declare every external `$variable` in `inputs {}` or assign it.
- [ ] Convert `$var` to `${var}` only inside command strings.
- [ ] Use bare variables in expressions/assignments.
- [ ] Convert timeouts from seconds to milliseconds where flow command expects ms.
- [ ] Replace append-file with read-old + `fileWriteAllText` if needed.
- [ ] Document any runtime gaps.
- [ ] Run `pnpm typecheck` if code changed; for flow-only changes, run a parser/runtime smoke test if project has one.

## 12. Known runtime gaps and safe choices

- `fileWriteAllText` overwrites, so emulate append manually.
- GPM `DELAY_PRESS` per keystroke may not be supported by `typeText`; use `rDelay` after action and document if needed.
- GPM `USE_PROFILE_PROXY` in HTTP requests may not map to runtime `fetch`; ignore unless runtime adds support.
- GPM stop/exit action may require flow restructuring because documented `exitLoop` only exits loops.
- `waitElement(...)` throws on timeout. If source expected fail-block behavior, inspect `use_failed_block` and convert to explicit `if hasElement(...)` if runtime behavior should continue.

## 13. Response template

After writing output:

```text
Done: scripts/name.flow

Preserved:
- block mapping
- nested branches
- rDelay from GPM delay fields
- XPath/page steps
- HTTP/file actions

Gaps:
- <only if any>

Verify:
- <commands run or skipped>
```
