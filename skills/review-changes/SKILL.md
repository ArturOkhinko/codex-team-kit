---
name: review-changes
description: Review current Git changes for concrete bugs, security issues and regressions when a code review is requested. Does not modify files.
---
# Review changes
1. Read AGENTS.md and inspect `git status --short`, `git diff`, and `git diff --cached`. Include relevant untracked source files. If there is no Git repository, state that limitation and review the explicitly requested files.
2. Read surrounding implementation, callers and tests. Establish expected behavior before calling something a bug.
3. Check input boundaries, invalid states, error propagation, compatibility and missing regression tests. Focus on actionable defects introduced by the change.
4. Run narrowly relevant existing checks when useful. Do not change source, tests, configuration or dependencies.
5. Return findings ordered P0 (critical), P1 (high), P2 (medium), P3 (low). Include file and line, triggering input, consequence and suggested fix. Separate verified defects from questions.
6. If no defects are found, say so and disclose untested paths. Never invent findings or equate review with proof of correctness.
