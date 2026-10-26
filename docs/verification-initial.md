# Verification evidence — 2026-10-25

Environment: macOS arm64, Node.js 22.23.1, npm 12.2.0.

## Executed successfully

- `npm run verify`: exit 0. ESLint, TypeScript, 32 Vitest tests, build,
  and 7 deterministic checks passed. See verification.log.
- Safe-change exercise in an isolated copy: before exit 1 (regression demonstrated),
  after exit 0. See regression-result.json and regression-before/after.log.
  This demonstrates a test/fix cycle, not an independent agent benchmark.
- Four SKILL.md frontmatters parsed using js-yaml and checked for matching names
  and nonempty descriptions within 1024 characters.
- `npm ci --dry-run --offline --ignore-scripts`: exit 0 after completing the lockfile.
  This validates dependency-tree consistency; it is not a clean installation.

## Limitations and failed attempts

- npm registry DNS was unavailable. Normal npm install failed with ENOTFOUND.
  Offline npm install could not find the cached package metadata (ENOTCACHED).
- Dependencies were recovered from existing cached npm tarballs. The lockfile
  records their actual versions and cached integrity hashes. Uncached optional
  platform binaries use exact versions declared by their parent packages and
  lack integrity hashes. Clean installation on Linux and GitHub CI have NOT
  been executed. Verify them online before presenting the project as CI-proven.
- The bundled Python skill validator could not run because PyYAML was absent.
  YAML parsing and manifest checks above were used instead.
- The sandbox refused writing `.agents/skills`. The sources exist in `skills/`;
  run `node scripts/install-skills.mjs` from a user terminal to activate them.
  The release ZIP also contains the intended `.agents/skills` layout.
- No independent Codex CLI evaluation, security advisory scan, published PR,
  or GitHub Actions run was performed. The suite does not quantify AI accuracy,
  productivity improvement or time saved.

## Review during implementation

Input review identified that null priority silently received a default. The
parser now defaults only when priority is absent, and rejects null with a
regression test. Input validation, transition matrix and immutable updates were
checked locally. This is implementation self-review, not independent review.

Raw check output is included with local absolute project paths replaced by
`<project>` for portability. No command outcomes have been edited.
