import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createTicket, transitionTicket } from '../dist/tickets.js';
const checks = [];
const check = (name, run) => { run(); checks.push({ name, passed: true }); };
check('untrusted status cannot bypass initial state', () => assert.equal(createTicket({ id: 'x', title: 'x', status: 'resolved' }).status, 'open'));
check('open tickets cannot resolve directly', () => assert.throws(() => transitionTicket(createTicket({ id: 'x', title: 'x' }), 'resolved')));
check('invalid transition preserves input', () => {
  const ticket = createTicket({ id: 'x', title: 'x' });
  assert.throws(() => transitionTicket(ticket, '__proto__'));
  assert.equal(ticket.status, 'open');
});
for (const name of ['review-changes', 'write-tests', 'security-audit', 'verify-project']) {
  const text = await readFile(new URL(`../skills/${name}/SKILL.md`, import.meta.url), 'utf8');
  check(`${name}: manifest structure`, () => {
    assert.ok(text.startsWith(`---\nname: ${name}\ndescription: `));
    assert.ok(text.includes('\n---\n'));
  });
}
await mkdir(new URL('../evals/runs/', import.meta.url), { recursive: true });
await writeFile(new URL('../evals/runs/deterministic.json', import.meta.url), JSON.stringify({ kind: 'deterministic-contract-checks', timestamp: new Date().toISOString(), agentRun: false, checks }, null, 2));
console.log(`${checks.length} deterministic checks passed. No agent behavior was evaluated by this command.`);
