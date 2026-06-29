# Changelog

## 0.5.2 - 2026-06-29

### Improvements
- BiDi now runs only for Camoufox profiles.
- Cloak and Wayfern/Weyfern profiles now use Playwright/CDP automation.
- Donut browser profile picker and validation now accept Cloak profiles.

### Files Changed
- `src/runtime/profile-session.ts` - switched automation engine selection to BiDi for Camoufox only and Playwright for other supported browsers.
- `src/donut/browser-types.ts` - added Cloak to supported Donut browser types.
- `src/donut/profile-selector.ts` - updated supported-browser labels and validation text.
- `package.json` - bumped version from `0.5.1` to `0.5.2`.
- `CHANGELOG.md` - documented `0.5.2` changes.

## 0.5.1 - 2026-06-29

### Improvements
- Added shared Ghost Cursor-style human mouse movement runtime for browser automation.
- Applied human mouse movement consistently to BiDi and Playwright/CDP backends.
- Click targets now use random points inside element bounding boxes instead of center-biased jitter.
- Mouse paths now use Cubic Bezier control points, Fitts' Law step sizing, local-speed timing, and long-distance overshoot correction.
- Click timing now includes randomized hesitate and mouse down/up hold delays.

### Refactor
- Moved reusable mouse math, path generation, timing, overshoot, clamping, and random helpers into `src/runtime/human-mouse.ts`.
- Removed duplicated mouse path logic from `src/runtime/page-automation.ts` and `src/runtime/playwright-page-automation.ts`.

### Files Changed
- `src/runtime/human-mouse.ts` - added shared human mouse movement helper.
- `src/runtime/page-automation.ts` - switched BiDi mouse movement and click logic to shared human path runtime.
- `src/runtime/playwright-page-automation.ts` - switched Playwright/CDP mouse movement and click logic to shared human path runtime.
- `package.json` - bumped version from `0.5.0` to `0.5.1`.
- `CHANGELOG.md` - documented `0.5.1` changes.

## 0.5.0 - 2026-06-29

### Major Changes
- Gscript-only scope locked in across repo docs and CLI guidance.
- Legacy `.flow`, script builder, auto-update, script-store, and profile-name lookup removed.
- Dev UI and exe UI split kept: Ink for dev, readline for packaged exe.
- Browser session flow kept on shared runtime with retry, BiDi, and Playwright/CDP support.

### Improvements
- CLI `run` flow kept aligned with `.gscript` execution and profile input handling.
- Playwright CDP path and profile launch cleanup hardened.
- README and CLI docs refreshed for current runtime model and executable usage.
- Release workflow and repo guidance updated for current packaging and publishing path.

### Removed
- Old `.flow` runtime, parser, checker, commands, examples, and docs.
- Update checker and self-update code.
- Script store and release artifacts tied to removed flow/update surface.
- Legacy docs, tests, and helper files that only served removed features.

### Files Changed
- Core runtime: `src/cli.ts`, `src/runtime/profile-session.ts`, `src/runtime/playwright-page-automation.ts`.
- UI layer: `src/ui/ui-provider.ts`, `src/ui/ui-readline.ts`, `src/ui/ui-ink.ts`, `src/ui/ui-types.ts`.
- Package and release metadata: `package.json`, `.github/workflows/release.yml`.
- Repo docs: `README.md`, `AGENTS.md`, `.claude/CLAUDE.md`, `CLAUDE.md`, `cli-guide.md`.
- Large doc cleanup: `docs/GPM-Automate-Docs/**`, `docs/gscript-runtime.md`, `api-guide.md`, `gpmlogin_api_document.md`.
- Removed update code: `src/update/**`, `src/ui/update-prompt.tsx`.
- Removed old tests and examples: `test/**`, `__test_for_loop*.mjs`, `__test_trace.mjs`.
- Skill and reference cleanup: `.claude/skills/convert-gpm-to-flow-scripts/**`.

### Notes
- This release reflects current workspace state, including tracked deletions and doc cleanup.
- Version bumped from `0.4.1` to `0.5.0`.
