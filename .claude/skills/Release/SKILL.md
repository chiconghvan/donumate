---
name: release
description: Auto-detect changes, generate commit, tag, push, and create GitHub release
---

# Auto Release Skill

Automates the full release cycle: detect changes → generate commit → bump version → tag → push → create GitHub release.

## Trigger

User says: "release", "tạo release", "auto release", "commit and release", "release now"

## Workflow

Execute these steps IN ORDER. Stop and report if any step fails.

### Step 1: Pre-checks

```bash
# Must be on a branch with upstream
git rev-parse --abbrev-ref HEAD
git rev-parse --abbrev-ref --symbolic-full-name '@{u}'

# Check for uncommitted changes
git status --short

# Check latest tag
git tag --sort=-v:refname | head -3

# Check package.json version
grep '"version"' package.json
```

Verify:
- Working tree is clean (no uncommitted changes) OR user confirms to include current changes
- Not in detached HEAD state
- `gh` CLI is available and authenticated

If working tree is dirty, auto-stage and commit changes first (see Step 2).

### Step 2: Analyze Changes

```bash
# Full diff summary
git diff --stat

# Source code changes (non-docs)
git diff -- src/

# Doc changes
git diff -- docs/ README.md CLAUDE.md

# New untracked files
git status --short -- scripts/
```

Classify changes into categories:
- **feat**: new functionality (new commands, functions, options, inputs)
- **fix**: bug fixes, error handling improvements
- **docs**: documentation only changes
- **chore**: dependency updates, config changes, refactoring
- **perf**: performance improvements
- **refactor**: code restructuring without behavior change

### Step 3: Generate Commit Message

Format:
```
<type>: <short summary>

- <bullet point 1>
- <bullet point 2>
- ...
```

Rules:
- Summary line ≤ 72 chars, imperative mood, no period
- Bullet points describe WHAT changed, not how
- Group related changes into single bullet
- Use conventional commit type: feat/fix/docs/chore/perf/refactor
- If multiple types, use the most significant one
- Build message as real multiline text, not a single escaped string with `\n`
- Prefer writing message to temp file and using `git commit -F <file>`

### Step 4: Version Bump

Determine bump type from changes:
- **patch** (0.0.X): bug fixes, small improvements, docs
- **minor** (0.X.0): new features, new commands/functions
- **major** (X.0.0): breaking changes (rare, confirm with user)

```bash
# Read current version
grep '"version"' package.json

# Bump (use node -e for cross-platform)
node -e "const p=require('./package.json'); const v=p.version.split('.'); v['<index>']++; require('fs').writeFileSync('package.json', JSON.stringify({...p,version:v.join('.')},null,2)+'\n')"
```

### Step 5: Commit

```bash
git add -A
git commit -F <commit-message-file>
```

### Step 6: Create Annotated Tag

```bash
git tag -a v<new-version> -m 'v<new-version> - <one-line summary>'
```

### Step 7: Build Release Asset

```bash
pnpm build:exe
```

Verify `release/donumate-win-x64.exe` exists before creating the GitHub release.

### Step 8: Push

```bash
git push origin <current-branch> --tags
```

### Step 9: Create GitHub Release

```bash
gh release create v<new-version> \
  --title "v<new-version>" \
  --notes-file <release-notes-file> \
  release/donumate-win-x64.exe
```

Release notes format:
```markdown
## v<version>

### New Features
- ...

### Improvements
- ...

### Bug Fixes
- ...

### Files Changed
- path/to/file.ts — description
```

Rules:
- Write release notes to temp file, then pass file path via `--notes-file`
- Do not pass notes as inline shell string with `\n`
- Keep blank lines as actual blank lines in file

### Step 10: Report

Output summary:
```
✅ Release v<version> complete
- Commit: <hash>
- Tag: v<version>
- Release: <URL>
- Branch: <branch> → origin
```

## Error Handling

- If `gh` not authenticated: tell user to run `! gh auth login`
- If push fails (remote has new commits): suggest `git pull --rebase` then retry
- If tag already exists: ask user to confirm overwrite or skip
- If package.json missing: skip version bump, use existing version from tag

## Notes

- Never force push
- Always use annotated tags (not lightweight)
- Confirm with user before proceeding if > 20 files changed
- Skip GitHub release if `gh` is not available (just push tag)
