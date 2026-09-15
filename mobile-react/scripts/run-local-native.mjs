import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const platform = process.argv[2];
if (platform !== 'android' && platform !== 'ios') {
  throw new Error('Usage: npm run android|ios [Expo run arguments]');
}

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const expoCli = resolve(projectRoot, 'node_modules', 'expo', 'bin', 'cli');
const child = spawn(
  process.execPath,
  [expoCli, `run:${platform}`, ...process.argv.slice(3)],
  {
    cwd: projectRoot,
    env: {
      ...process.env,
      ERP_LOCAL_NATIVE_BUILD: 'true',
    },
    stdio: 'inherit',
  },
);

child.once('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.once('exit', (code, signal) => {
  if (signal) {
    process.exitCode = 1;
    return;
  }

  process.exitCode = code ?? 1;
});
