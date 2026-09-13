import {spawnSync} from 'node:child_process';
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'preview', '--host', '127.0.0.1', '--port', '4322'], {
  stdio: 'inherit', env: {...process.env, DESIGN_PREVIEW: '1'}
});
process.exit(result.status ?? 1);
