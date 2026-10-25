# Safe change exercise: reopen a resolved ticket

Add exactly one transition: resolved -> open. Preserve all other transitions,
including rejection of resolved -> in_progress and open -> resolved.
Return a new immutable ticket and preserve the original. Add regression tests.
No new dependency is needed.

Suggested prompt:

Before changing code, record the baseline. Update the existing transition-matrix
expectation and add a focused reopen test. Confirm that test fails on the old
implementation, then make the one-edge production change and run verification.

The delivered baseline intentionally does not implement reopening: this is a
repeatable exercise, not an uncompleted requirement in the demo.
