# donumate

Standalone TypeScript CLI for Donut Browser Camoufox profiles.

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

Interactive profile/script selection:

```bash
pnpm dev
```

Built-in Threads script:

```bash
pnpm dev threads --profile <profile-id>
```

Run a `.flow` script:

```bash
pnpm dev run --profile <profile-id> --script ./scripts/example.flow
```

Override `.flow` inputs:

```bash
pnpm dev run --profile <profile-id> --script ./scripts/example.flow --input startUrl=https://example.com --input mode=safe
```

Override API:

```bash
pnpm dev threads --api http://127.0.0.1:10108
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
```

## .flow scripts

`.flow` supports 3 lifecycle blocks:

```flow
inputs {
  startUrl: input = "https://example.com"
  count: number = 3
  uploadFile: file
  outputDir: folder
  dryRun: checkbox = false
  mode: comboBox ["fast", "safe"] = "safe"
}

before run profile {
  log("Before launch: ${mode}")
}

run profile {
  nav("${startUrl}")
  waitLoad()
  info()
}

after kill profile {
  log("Browser killed")
}
```

> Note: `.flow` strings are raw. Backslashes stay literal (`"C:\Temp\note.txt"`), commas inside quotes do not split args, and embedded same quotes use doubled quotes (`"He said ""hi"""`).

```flow
before run profile {
  httpRequest("https://example.com", POST, {
    "content-type": "application/json"
  }, {
    "ok": true,
    "message": "hello, world"
  })

  fileReadAllText("C:\Temp\note.txt")
  httpDownload("https://example.com/image.png", "C:\Temp\download.png")
}
```

Inputs render in one CLI GUI frame. Use Tab/arrow keys to move, Left/Right to toggle/cycle/open path picker, Enter to submit/open.

Legacy flat `.flow` command files still run as main logic.

More `.flow` commands:

```flow
run profile {
  set page = "https://example.com"
  navUrl("${page}")
  waitLoad()
  getUrl()
  waitElement("//h1", 10000)
  getElementText("//h1")
  countElement("//a")
  scroll(500)
  js("document.title")

  for i = 0; i < 10; i = i + 1
    if i == 2
      nextLoop
    if i == 5
      exitLoop
    log "i=${i}"
}

before run profile {
  httpRequest("https://example.com", GET, {})
  httpDownload("https://example.com/image.png", "./downloads/image.png")
}
```

Browser/page commands only run inside `run profile`. HTTP commands can run in any block. Full docs: `docs/flow-scripting.md`.

## Build

```bash
pnpm build
```

Then run linked binary:

```bash
donumate threads
```
