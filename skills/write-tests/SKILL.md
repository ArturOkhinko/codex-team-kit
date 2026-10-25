---
name: write-tests
description: Add meaningful Vitest tests for changed ticket behavior, regression bugs and missing boundary coverage when tests are requested.
---
# Write tests
1. Read AGENTS.md, package.json, implementation and existing demo/tests tests.
2. Derive expected behavior from the task and public contract, not from copying the implementation. Resolve contradictory requirements before encoding them.
3. Cover normal behavior, boundaries and invalid input. For state transitions, verify forbidden edges and that failure preserves the original object.
4. For a bug fix, demonstrate the regression test fails on the old behavior when practical; record the actual result.
5. Avoid clocks, network access and brittle snapshots. Keep fixtures synthetic and small.
6. Run `npm test`, then `npm run typecheck`. Do not alter production behavior merely to accommodate a test. Report cases added and actual command outcomes.
