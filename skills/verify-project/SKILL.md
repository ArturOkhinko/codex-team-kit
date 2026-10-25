---
name: verify-project
description: Run the project's lint, TypeScript, Vitest, build and deterministic evaluation checks before handing off code changes or when verification is requested.
---
# Verify project
1. Read AGENTS.md and package.json. Inspect scripts before executing them.
2. If dependencies are absent, use `npm ci` when package-lock.json exists, otherwise `npm install`. Report unavailable network or installation failures without claiming checks passed.
3. Run `npm run verify`. This stops at the first failure; later checks are not passed checks.
4. Diagnose failures and report them. Make fixes only if authorized by the active task; do not disable assertions, lint rules or required commands.
5. Report command, exit code, relevant test counts and checks not run. Distinguish local checks, deterministic fixture evaluation and actual Codex runs. GitHub CI only passed if a real workflow run confirms it.
