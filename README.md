# donumate

Standalone TypeScript CLI for Donut Browser Camoufox profiles, run via `pnpm dev` or `pnpm start`.

Flow:

```text
Donut API -> select Camoufox profile -> launch profile -> get debugging port -> connect BiDi -> run TS or .flow script
```

## Requirements

- Node.js 22+
- pnpm
- Donut Browser running
- Donut API enabled, default `http://127.0.0.1:10108`
- At least one Camoufox profile

## Setup

```bash
pnpm install
cp .env.example .env
```

Edit `.env` if needed.

## Run

Interactive root menu:

```bash
pnpm dev
# or
pnpm start
```

Root menu choices:

- `Run Scripts` — open script selector for built-in scripts plus `./scripts/*.ts` and `./scripts/*.flow`.
- `Create flow script` — ask for script name, save new `.flow` under `./scripts/`, then open Ink editor with runtime command autocomplete.
- `Exit`

Built-in Threads script:

```bash
pnpm start threads --profile <profile-id>
```

Run a `.flow` script:

```bash
pnpm start run --profile <profile-id> --script ./scripts/example.flow
```

Check `.flow` script before run:

```bash
pnpm start check --script ./scripts/example.flow
```

`check` print syntax, command, variable, loop, workflow diagnostics. No browser launch, no Donut API call.

Override `.flow` inputs:

```bash
pnpm start run --profile <profile-id> --script ./scripts/example.flow --input startUrl=https://example.com --input mode=safe
```

Override API:

```bash
pnpm start threads --api http://127.0.0.1:10108
```

## Options

```text
--api <url>                 Donut API base URL
--token <token>             Optional bearer token
--profile <profile-id>      Skip selector
--headless <boolean>        Launch profile headless
--connect-timeout <ms>      WebSocket connect timeout
--command-timeout <ms>      BiDi command timeout
--input <key=value>         Set .flow input value; repeatable
--no-update-check           Skip GitHub release check
```

## .flow scripts

`.flow` supports 3 lifecycle blocks:

- `inputs { ... }`
- `before() { ... }`
- `running() { ... }`
- `after() { ... }`

Canonical call style: `name(arg1, arg2)`.

Parser also accepts `before run profile`, `run profile`, and `after kill profile`, but docs use short form.

```flow
inputs {
  startUrl: input = "https://example.com"
  count: number = 3
  uploadFile: file
  outputDir: folder
  dryRun: checkbox = false
  mode: comboBox ["fast", "safe"] = "safe"
  excel: inputExcelFile
}

before() {
  log("Before launch: ${mode}")
}

running() {
  nav("${startUrl}")
  waitLoad()
  info()
}

after() {
  log("Browser killed")
}
```

> Note: `.flow` strings are raw. Backslashes stay literal (`"C:\Temp\note.txt"`), commas inside quotes do not split args, and embedded same quotes use doubled quotes (`"He said ""hi"""`).

Random delay after command:

```flow
running() {
  nav("https://example.com", rDelay())
  click("//button", rDelay(3000,4000))
}
```

`rDelay`, `rDelay()`, `rDelay(min,max)` can be placed as last input of any command. Runtime runs command first, then sleeps random ms.

Inputs render in one CLI GUI frame. Use Tab/arrow keys to move, Left/Right to toggle/cycle/open path picker, Enter to submit/open.

Create new scripts from the root `Create flow script` menu. Type a script name, then use the Ink editor:

- type a command prefix like `http` to open autocomplete (`httpRequest`, `httpDownload`)
- press ↑/↓ to choose, Enter/Tab to insert snippet
- examples: `nav` -> `nav('', rDelay())`, `delay` -> `delay(, rDelay())`, `httpRequest` -> `httpRequest('','','','', rDelay())`
- press Ctrl+S to validate and save


Hidden script settings are injected automatically when missing:

- `hardless: checkbox = false`
- `threads: number = 1`
- `inputExcelFile: inputExcelFile = ""`
- `mapProfileName: checkbox = false`

Legacy flat `.flow` command files still run as main logic.

More `.flow` commands:

```flow
running() {
  page = "https://example.com"
  navUrl("${page}", rDelay())
  waitLoad()
  getUrl()
  waitElement("//h1", 10000)
  getElementText("//h1")
  countElement("//a")
  scroll(500)
  js("document.title")
  delay(1000, 3000)

  for i = 0; i < 10; i = i + 1
    if i == 2
      nextLoop
    if i == 5
      exitLoop
    log("i=${i}")
}

before() {
  httpRequest("https://example.com", GET, {}, rDelay())
  httpDownload("https://example.com/image.png", "./downloads/image.png", rDelay())
  fileReadAllText("C:\Temp\note.txt")
}
```

Browser/page commands only run inside `running()`. HTTP/file commands can run in any block. Full docs: `docs/flow-scripting.md`.

## Check command

`check` uses same runtime DSL spec as executor. When add/change command or function metadata, update shared runtime spec and executor together. Checker must stay in sync with runtime command library.

Excel profile mapping — tick `mapProfileName` in Script Settings to auto-map rows by profile name in column A:

```flow
running() {
  set username = ${inputExcelFile[B]}
  set password = ${inputExcelFile[C]}
  log("User: ${username}, Pass: ${password}")
}
```

Excel format: column A = profile name, B/C/D = data per profile. If profile name not found in column A, script stops with error.

## Build

```bash
pnpm build
```

Then run linked binary:

```bash
donumate threads
```
