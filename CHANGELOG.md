# Changelog

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
