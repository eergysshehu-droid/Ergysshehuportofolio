import {spawnSync} from 'node:child_process';
// Explicit local design review, isolated from the deployable dist directory.
const result = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {
  stdio: 'inherit', env: {...process.env, DESIGN_PREVIEW: '1'}
});
process.exit(result.status ?? 1);
