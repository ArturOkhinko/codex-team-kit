import { cp, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const names = ['review-changes', 'write-tests', 'security-audit', 'verify-project'];
for (const name of names) {
  const target = path.join(root, '.agents/skills', name);
  let exists = true;
  try { await access(target); } catch (error) { if (error.code === 'ENOENT') exists = false; else throw error; }
  if (exists) throw new Error(`Refusing to overwrite ${target}`);
}
await mkdir(path.join(root, '.agents/skills'), { recursive: true });
for (const name of names) await cp(path.join(root, 'skills', name), path.join(root, '.agents/skills', name), { recursive: true, errorOnExist: true, force: false });
console.log('Installed four repository-local skills. Reopen the Codex session to discover them.');
