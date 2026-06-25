# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the TypeScript application. Key areas are `src/cli.ts` for the entrypoint, `src/runtime/` for flow parsing and execution, `src/donut/` and `src/bidi/` for browser/API integration, `src/ui/` for Ink-based CLI UI, and `src/script-builder/` plus `src/script-builder-app/` for the visual script builder. Documentation lives in `docs/`, sample automation scripts live in `scripts/`, and generated outputs go to `dist/`, `dist-exe/`, and `release/`.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies from `pnpm-lock.yaml`.
- `pnpm dev` or `pnpm start` runs the CLI directly with `tsx`.
- `pnpm build` builds the dev bundle via `build.mjs`.
- `pnpm build:exe` creates the packaged executable.
- `pnpm build:all` runs the full build pipeline.
- `pnpm build:clean` removes generated build artifacts.
- `pnpm typecheck` runs TypeScript in `--noEmit` mode.

## Coding Style & Naming Conventions
Use TypeScript with ESM modules, strict types, and 2-space indentation. Follow the existing file naming pattern: `camelCase` for utility modules, `PascalCase.tsx` for React components, and lowercase feature folders such as `runtime/` or `script-builder/`. Prefer small focused modules and keep shared types in nearby `types.ts` files.

## Testing Guidelines
There is no dedicated automated test runner configured in `package.json`. Use `pnpm typecheck` as the baseline verification step, then validate behavior with the relevant CLI flow or `.flow` sample in `scripts/`. If you add tests, place them next to the feature they cover and name them consistently, such as `*.test.ts`.

## Commit & Pull Request Guidelines
Git history uses Conventional Commits style with prefixes like `feat:`, `fix:`, `chore:`, and `release:`. Keep commits narrow and descriptive. Pull requests should summarize the user-visible change, list the commands you ran, and include screenshots or terminal output for UI or workflow changes. Link related issues when applicable.

## Security & Configuration Tips
Copy `.env.example` to `.env` for local setup and keep secrets out of version control. Treat `dist/`, `dist-exe/`, and `release/` as generated artifacts. When changing flow behavior, update the matching docs in `docs/flow-scripting.md` or related guides.
