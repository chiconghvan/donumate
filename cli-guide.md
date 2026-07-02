# Donumate Release Exe CLI Guide

This guide only covers the packaged Windows release executable:

```text
release/donumate_v<version>.exe
```

Use this guide after you already have `release/donumate_v<version>.exe` from a release build.

The release exe uses readline/plain terminal prompts when an argument is missing. It runs GPMAutomateEditor `.gscript` files against Donut Browser, GPMLogin, or GPMGlobal browser profiles.

Check help:

```bash
.\release\donumate_v<version>.exe --help
```

## Basic Command

```bash
.\release\donumate_v<version>.exe --script .\scripts\auto-post-v4.gscript --manager gpm --profile <profile-id>
```

Pass options directly to the exe root command.

## Full Syntax

```bash
donumate_v<version>.exe --script <file.gscript> --manager <donut|gpm|gpmglobal> --api <url> --token <token> --profile <profile-id> --headless --win-size <width,height> --connect-timeout <ms> --command-timeout <ms> --input key=value --minimal-log
```

All options except `--input` appear at most once. `--input` can repeat.

## Options

### `--script <path>`

Path to a GPMAutomateEditor `.gscript` JSON file.

Examples:

```bash
--script .\scripts\auto-post-v4.gscript
--script C:\Automation\scripts\job.gscript
```

If omitted, exe mode opens a readline script picker for `.gscript` files under `scripts/`.

### `--manager <donut|gpm|gpmglobal>`

Selects browser profile manager.

```bash
--manager gpm
--manager gpmglobal
--manager donut
```

Default is `donut`.

Use `gpm` for GPMLogin local API. Use `gpmglobal` for GPMGlobal local API. Use `donut` for Donut Browser local API.

### `--api <url>`

Browser manager API base URL.

Defaults:

```text
Donut Browser: http://127.0.0.1:10108
GPMLogin:      http://127.0.0.1:19995
GPMGlobal:     http://127.0.0.1:9495
```

Examples:

```bash
--api http://127.0.0.1:19995
--api http://127.0.0.1:9495
--api http://127.0.0.1:10108
--api http://192.168.1.20:19995
```

For GPMGlobal, pass host and port only. Donumate appends `/api/v1` internally. Do not include `/api/v1` unless you intentionally want to pass the full API root.

### `--token <token>`

Bearer token for Donut Browser API when required.

Example:

```bash
--manager donut --token <donut-api-token>
```

GPMLogin and GPMGlobal normally do not use this option.

### `--profile <profile-id>`

Profile ID to run.

Important: this is profile ID only. Profile name is not supported.

When provided, Donumate calls profile API directly and skips profile picker.

Example:

```bash
--profile 64f1a0c2d8e9
```

If omitted, exe mode lists profiles from the selected manager and asks you to choose by number.

### `--headless`

Launches the profile headless when manager supports it.

Example:

```bash
.\release\donumate_v<version>.exe --script .\scripts\auto-post-v4.gscript --manager gpm --profile <profile-id> --headless
```

### `--win-size <width,height>`

Sets GPMLogin or GPMGlobal browser window size.

Format must be two integers separated by comma.

Example:

```bash
--win-size 800,1000
```

This option is intended for GPMLogin and GPMGlobal. Donut Browser may ignore it depending API behavior.

### `--connect-timeout <ms>`

Timeout for connecting to BiDi/CDP endpoint.

Default:

```text
30000
```

Example:

```bash
--connect-timeout 60000
```

Use higher values when profile launch is slow.

### `--command-timeout <ms>`

Timeout for browser automation commands.

Default:

```text
15000
```

Example:

```bash
--command-timeout 30000
```

Use higher values for slow pages or heavy JavaScript.

### `--input <key=value>`

Overrides a user input declared by the `.gscript` file.

Repeat for multiple inputs:

```bash
--input username=alice --input count=3 --input enabled=true
```

If a required script input is not provided, exe mode prompts for it in terminal.

Input values are parsed by the script input type:

- text: string value.
- number: numeric value.
- checkbox: `true`, `false`, `1`, `0`, `yes`, `no`, `on`, `off`.
- comboBox: one of script-defined options.

Example:

```bash
.\release\donumate_v<version>.exe --script .\scripts\auto-post-v4.gscript --manager gpm --profile <profile-id> --input username=alice --input maxPosts=5
```

### `--minimal-log`

Shows compact runtime logs.

Example:

```bash
.\release\donumate_v<version>.exe --script .\scripts\auto-post-v4.gscript --manager gpm --profile <profile-id> --minimal-log
```

Use this for automation logs where each action should be short.

## Profile Flow

With `--profile`:

1. Donumate loads script.
2. Donumate resolves script inputs from `--input` or prompts.
3. Donumate calls selected manager API with profile ID.
4. Donumate runs script lifecycle.

Without `--profile`:

1. Donumate loads script.
2. Donumate resolves script inputs.
3. Donumate lists profiles through selected manager API.
4. Terminal shows numbered profile list.
5. User enters profile number.
6. Donumate runs script lifecycle.

Profile name input is not supported by design.

## Runtime Variables Injected By Donumate

These variables are available during `.gscript` execution:

```text
profileID
profileId
profileName
profileProxy
```

Use them inside script actions through normal variable interpolation supported by GPMAutomateEditor scripts.

## GPMLogin Examples

Run with default GPMLogin API:

```bash
.\release\donumate_v<version>.exe --manager gpm --script .\scripts\auto-post-v4.gscript --profile <profile-id>
```

Run with explicit API URL:

```bash
.\release\donumate_v<version>.exe --manager gpm --api http://127.0.0.1:19995 --script .\scripts\auto-post-v4.gscript --profile <profile-id>
```

Run headless with window size:

```bash
.\release\donumate_v<version>.exe --manager gpm --script .\scripts\auto-post-v4.gscript --profile <profile-id> --headless --win-size 800,1000
```

Run with inputs:

```bash
.\release\donumate_v<version>.exe --manager gpm --script .\scripts\auto-post-v4.gscript --profile <profile-id> --input keyword=donumate --input limit=10
```

## GPMGlobal Examples

Run with default GPMGlobal API:

```bash
.\release\donumate_v<version>.exe --manager gpmglobal --script .\scripts\auto-post-v4.gscript --profile <profile-id>
```

Run with explicit API URL:

```bash
.\release\donumate_v<version>.exe --manager gpmglobal --api http://127.0.0.1:9495 --script .\scripts\auto-post-v4.gscript --profile <profile-id>
```

Run headless with window size:

```bash
.\release\donumate_v<version>.exe --manager gpmglobal --script .\scripts\auto-post-v4.gscript --profile <profile-id> --headless --win-size 800,1000
```

## Donut Browser Examples

Run with default Donut API:

```bash
.\release\donumate_v<version>.exe --manager donut --script .\scripts\auto-post-v4.gscript --profile <profile-id>
```

Run with token:

```bash
.\release\donumate_v<version>.exe --manager donut --api http://127.0.0.1:10108 --token <token> --script .\scripts\auto-post-v4.gscript --profile <profile-id>
```

## Script Lifecycle

Donumate executes GPMAutomateEditor lifecycle blocks:

- `before_init`: runs before profile launch.
- `main_logic`: runs after profile launch and browser connection.
- `after_quit`: runs after connection/profile cleanup.

If `main_logic` is empty, Donumate skips browser launch and still runs `before_init`/`after_quit` as applicable.

## Troubleshooting

### Script path not found

Check `--script` path. Relative paths resolve from current working directory.

### Invalid `.gscript` JSON

Open the file in GPMAutomateEditor and export/save it again. Donumate expects GPMAutomateEditor JSON with `before_init`, `main_logic`, and `after_quit` blocks.

### Profile not found

`--profile` must be profile ID, not profile name. Verify the ID in Donut Browser, GPMLogin, or GPMGlobal.

### API connection failed

Confirm manager app is running and API is enabled.

For GPMLogin:

```bash
--manager gpm --api http://127.0.0.1:19995
```

For GPMGlobal:

```bash
--manager gpmglobal --api http://127.0.0.1:9495
```

For Donut Browser:

```bash
--manager donut --api http://127.0.0.1:10108
```

### Browser connection timeout

Increase connect timeout:

```bash
--connect-timeout 60000
```

### Page command timeout

Increase command timeout:

```bash
--command-timeout 30000
```

### Too much log output

Use:

```bash
--minimal-log
```

### Missing input prompt in automation

Pass all required script inputs with `--input` so command can run unattended.

Example:

```bash
.\release\donumate_v<version>.exe --script .\scripts\auto-post-v4.gscript --manager gpm --profile <profile-id> --input username=alice --input password=secret --minimal-log
```
