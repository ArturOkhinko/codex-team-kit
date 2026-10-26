import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const steps = [
  ['lint', 'Проверка ESLint'],
  ['typecheck', 'Проверка типов'],
  ['test:report', 'Тесты генератора отчёта'],
  ['test', 'Тесты приложения'],
  ['build', 'Сборка'],
  ['eval', 'Детерминированные проверки'],
];

function execute(command, args, options) {
  return spawnSync(command, args, { ...options, encoding: 'utf8' });
}

export function runVerification({ root = projectRoot, run = execute } = {}) {
  const startedAt = new Date().toISOString();
  const reportPath = path.join(root, 'docs/verification.md');
  const temporary = mkdtempSync(path.join(tmpdir(), 'codex-team-kit-verify-'));
  const testReport = path.join(temporary, 'vitest.json');
  const git = args => {
    const result = run('git', args, { cwd: root, stdio: 'pipe' });
    return result.status === 0 ? (result.stdout ?? '').trim() : null;
  };
  // Ignore only the generated report itself, so rerunning does not create a false dirty state.
  const commit = git(['rev-parse', 'HEAD']);
  const status = git(['status', '--porcelain', '--untracked-files=normal', '--', '.', ':(exclude)docs/verification.md']);
  const results = steps.map(([script, label]) => ({ script, label, state: 'не выполнена' }));
  let summary = 'Выполняется';
  let tests;
  const save = () => {
    const lines = [
      '# Отчёт о проверках', '',
      'Файл автоматически обновляется командой `npm run verify`. Не редактируйте его вручную.', '',
      `- Начало запуска (UTC): ${startedAt}`,
      `- Обновлён (UTC): ${new Date().toISOString()}`,
      `- Git-коммит: ${commit ?? 'не удалось определить'}`,
      `- Незакоммиченные изменения на старте: ${status === null ? 'не удалось определить' : status ? 'да' : 'нет'}. Сам этот отчёт исключён из проверки.`,
      `- Среда: ${process.platform}/${process.arch}, Node.js ${process.version}.`,
      `- Результат: **${summary}**.`, '',
      '## Команды и результаты', '',
      ...results.map(r => `- \`npm run ${r.script}\` — ${r.label}: **${r.state}**${r.exitCode !== undefined ? `; код ${r.exitCode}` : ''}${r.signal ? `; сигнал ${r.signal}` : ''}${r.durationMs !== undefined ? `; ${r.durationMs} мс` : ''}${r.note ? `. ${r.note}` : ''}.`),
      '', '## Тесты приложения', '',
      tests ? `Всего: ${tests.total}; прошли: ${tests.passed}; упали: ${tests.failed}; пропущены: ${tests.pending}.` : 'Сведения о количестве тестов этого запуска недоступны.',
      '', '## Область проверки', '',
      'Это результаты указанных команд для состояния рабочей папки на момент запуска. При незакоммиченных изменениях одного хеша коммита недостаточно для воспроизведения.',
      'После первой ошибки последующие команды не запускаются. Если отчёт остался в состоянии «Выполняется», запуск не был завершён.',
      'Подробные ошибки выводятся в терминал. Отчёт не включает сырой вывод команд.',
      'Детерминированные проверки не являются AI-бенчмарком. Этот запуск не подтверждает статус GitHub CI, чистую установку зависимостей или отсутствие уязвимостей.',
      'Исторические результаты и ограничения первоначальной установки: [verification-initial.md](verification-initial.md).', '',
    ];
    mkdirSync(path.dirname(reportPath), { recursive: true });
    const pending = reportPath + '.tmp';
    writeFileSync(pending, lines.join('\n'));
    renameSync(pending, reportPath);
  };
  try {
    save();
    for (const result of results) {
      result.state = 'выполняется';
      save();
      const args = ['run', result.script];
      if (result.script === 'test') args.push('--', '--reporter=default', '--reporter=json', `--outputFile=${testReport}`);
      const start = Date.now();
      // npm_execpath is supplied by npm; avoid shell interpolation on every platform.
      const npmCli = process.env.npm_execpath;
      const output = run(npmCli ? process.execPath : 'npm', npmCli ? [npmCli, ...args] : args, { cwd: root, stdio: 'inherit' });
      result.durationMs = Date.now() - start;
      result.exitCode = output.status ?? 1;
      result.signal = output.signal;
      result.state = output.status === 0 && !output.error ? 'успешно' : 'ошибка';
      if (output.error) result.note = 'Не удалось запустить команду';
      if (result.script === 'test') {
        try {
          const data = JSON.parse(readFileSync(testReport, 'utf8'));
          const counts = [data.numTotalTests, data.numPassedTests, data.numFailedTests, data.numPendingTests];
          if (!counts.every(n => Number.isInteger(n) && n >= 0)) throw new Error('Invalid counts');
          tests = { total: counts[0], passed: counts[1], failed: counts[2], pending: counts[3] };
          if (data.success !== true || tests.failed > 0) result.state = 'ошибка';
        } catch {
          result.state = 'ошибка';
          result.note = 'Не удалось прочитать корректный JSON-отчёт Vitest этого запуска';
        }
      }
      if (result.state === 'ошибка') {
        summary = 'Проверки не пройдены';
        save();
        return result.exitCode || 1;
      }
      save();
    }
    summary = 'Все проверки пройдены';
    save();
    return 0;
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = runVerification();
}
