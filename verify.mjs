import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const cwd = fileURLToPath(new URL('./', import.meta.url));
for (const args of [
  ['node_modules/typescript/bin/tsc', '-p', 'tsconfig.json'],
  ['--test', ...readdirSync(new URL('./tests', import.meta.url)).filter(name => name.endsWith('.test.mjs')).map(name => `tests/${name}`)]
]) {
  const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
