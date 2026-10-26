import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runVerification } from '../verify.mjs';

function fixture(t, { failAt, omitJson = false, gitAvailable = true, dirty = false } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'kit-report-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const calls = [];
  const run = (command, args) => {
    if (command === 'git') return { status: gitAvailable ? 0 : 128, stdout: args[0] === 'rev-parse' ? 'abc123\n' : dirty ? ' M demo/src/tickets.ts\n' : '' };
    const script = args[args.indexOf('run') + 1];
    calls.push(script);
    if (script === 'test' && !omitJson) {
      const file = args.find(x => x.startsWith('--outputFile=')).slice('--outputFile='.length);
      writeFileSync(file, JSON.stringify({ success: failAt !== 'test', numTotalTests: 3, numPassedTests: failAt === 'test' ? 2 : 3, numFailedTests: failAt === 'test' ? 1 : 0, numPendingTests: 0 }));
    }
    return { status: script === failAt ? 1 : 0 };
  };
  return { root, run, calls, report: () => readFileSync(path.join(root, 'docs/verification.md'), 'utf8') };
}

test('records counts, commit and successful checks', t => {
  const f = fixture(t, { dirty: true });
  assert.equal(runVerification(f), 0);
  assert.match(f.report(), /Все проверки пройдены/);
  assert.match(f.report(), /Всего: 3; прошли: 3; упали: 0/);
  assert.match(f.report(), /Git-коммит: abc123/);
  assert.match(f.report(), /изменения на старте: да/);
  assert.deepEqual(f.calls, ['lint', 'typecheck', 'test:report', 'test', 'build', 'eval']);
});

test('failed tests return failure and skip build and eval', t => {
  const f = fixture(t, { failAt: 'test' });
  assert.equal(runVerification(f), 1);
  assert.match(f.report(), /прошли: 2; упали: 1/);
  assert.match(f.report(), /Сборка: \*\*не выполнена\*\*/);
  assert.ok(!f.calls.includes('build') && !f.calls.includes('eval'));
});

test('a later failed run replaces previous success and does not reuse test counts', t => {
  const f = fixture(t);
  assert.equal(runVerification(f), 0);
  assert.equal(runVerification({ root: f.root, run: (command, args, options) => command === 'git' ? f.run(command, args, options) : { status: 2 } }), 2);
  assert.doesNotMatch(f.report(), /Все проверки пройдены|Всего: 3/);
  assert.match(f.report(), /Сведения о количестве тестов этого запуска недоступны/);
});

test('missing test JSON cannot produce a successful report', t => {
  const f = fixture(t, { omitJson: true });
  assert.equal(runVerification(f), 1);
  assert.match(f.report(), /Не удалось прочитать корректный JSON/);
});

test('missing Git information is unknown, not a clean working tree', t => {
  const f = fixture(t, { gitAvailable: false });
  assert.equal(runVerification(f), 0);
  assert.match(f.report(), /Git-коммит: не удалось определить/);
  assert.match(f.report(), /изменения на старте: не удалось определить/);
});
