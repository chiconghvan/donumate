# donut-camoufox-bidi-cli

Standalone TypeScript CLI for Donut Browser Camoufox profiles.

Flow:

```text
Donut API -> select Camoufox profile -> launch profile -> get debugging port -> connect BiDi -> open Threads -> count interactive elements
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

Interactive profile selection:

```bash
pnpm dev threads
```

With profile id:

```bash
pnpm dev threads --profile <profile-id>
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
--kill-after <boolean>      Kill profile after task
--connect-timeout <ms>      WebSocket connect timeout
--command-timeout <ms>      BiDi command timeout
```

## Build

```bash
pnpm build
```

Then run linked binary:

```bash
donut-camoufox threads
```
