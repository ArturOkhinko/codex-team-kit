# Evaluating agent behavior

`npm run eval` checks deterministic application contracts and skill manifest
structure. It does NOT prove a skill was loaded or followed by Codex.

For a real evaluation use evals/scenarios.json. Create an isolated copy excluding
node_modules, .git, work and evals/runs. Install the skills there. Start a fresh
Codex session for each scenario so previous findings do not leak into context.
Provide the scenario prompt and named skill, without giving the expected answer.
Keep the raw trace, final response, before/after diff, command exit codes, CLI
version, selected model and timestamp in evals/runs/<run-id>/.

Grade separately:
- Outcome: known defect found, or clean fixture correctly left without findings.
- Process: evidence of reading the skill and executing required checks.
- Scope: review scenarios leave file hashes unchanged; implementation touches
  only relevant files.
- Evidence: check results match tool exits; blocked commands are disclosed.

Use pass/fail/not-observed for each criterion. Do not score missing evidence as
success. Repeat scenarios to estimate variability. A tiny fixture suite cannot
establish broad accuracy or productivity gains. Manually adjudicate whether a
finding is substantive; keyword matches alone are insufficient.

AI review does not replace deterministic CI or human approval of product and
architectural decisions. No paid API or automated remote run is required by CI.

Official background:
https://developers.openai.com/blog/eval-skills
https://developers.openai.com/blog/skills-agents-sdk
