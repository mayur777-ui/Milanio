---
name: gitcommit
description: Guided workflow to inspect changes, run pre-commit verification, stage atomic change sets, and generate conventional semantic commit messages.
triggers:
  - commit my changes
  - create a git commit
  - git commit
  - /gitcommit
---

# Git Commit — Conventional & Atomic Commit Workflow

## Mission

Ensure all repository commits are atomic, well-verified, follow Conventional Commits specification, and never accidentally leak secrets, unneeded build artifacts, or broken builds into Git history.

---

## Commit Workflow

### 1. Pre-Commit Status & Diff Inspection
Before touching `git add`:
```bash
git status -s
git diff --stat
```
Verify:
- [ ] No `.env`, `.env.*`, credentials, or keys are being tracked or modified.
- [ ] No compiled outputs (`dist/`, `.next/`, `*.tsbuildinfo`) are unstaged or untracked.
- [ ] Only intended, coherent changes for the current atomic unit of work are staged.

### 2. Pre-Commit Verification (Zero Broken Commits)
Never commit without verifying that the codebase actually compiles:
- If backend changes: `cd backend && npx tsc --noEmit`
- If frontend changes: `cd frontend && npx tsc --noEmit`
- If tests exist: Run relevant unit/behavioral tests.

### 3. Atomic Staging
Group changes into single-responsibility logical units rather than a giant `git add .` dump:
- If fixing a bug and adding a feature, stage and commit them separately.
- Always use explicit file paths when staging:
  ```bash
  git add <path/to/specific/file1> <path/to/specific/file2>
  ```

### 4. Conventional Commit Format
Structure commit messages following the Conventional Commits specification:

```
<type>(<scope>): <short imperative title (max 72 chars)>

[optional body explaining motivation, context, and what changed]

[optional footer(s), e.g., Closes #123, Breaking Changes]
```

#### Allowed Types:
- `feat`: A new user-facing or API feature.
- `fix`: A bug fix.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: Performance optimization (e.g. eliminating video re-render black flashes).
- `style`: UI/UX design tokens, formatting, whitespace (no functional code change).
- `docs`: Documentation updates only (`doc/`, `README.md`).
- `test`: Adding or correcting tests.
- `chore`: Build tooling, docker configuration, dependencies, `.gitignore`.

#### Examples:
```
feat(green-room): add local hardware mic and camera preview with track cleanup
fix(video-tile): eliminate decoder reset black flash using memoized VideoTile
chore(docker): bind postgres and redis ports to loopback 127.0.0.1
docs(design-system): add dual light and dark mode token specification
```

---

## Golden Rules
1. **Never use vague messages**: Avoid `"update files"`, `"fix stuff"`, `"wip"`, or `"changes"`.
2. **Imperative mood**: Write `"add feature"`, not `"added feature"` or `"adds feature"`.
3. **No Co-Author / AI noise**: Do not append generic AI watermark signatures unless requested by the user.
4. **Never bypass hooks or force**: Do not use `--no-verify` or `-f` unless explicitly instructed.
