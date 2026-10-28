import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { assertAndroidBundlePolicy } from './android-bundle-policy.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = await mkdtemp(path.join(os.tmpdir(), 'erp-mobile-android-export-'));

try {
  const expoCli = path.join(projectRoot, 'node_modules', 'expo', 'bin', 'cli');
  const result = spawnSync(
    process.execPath,
    [
      expoCli, 'export', '--platform', 'android', '--output-dir', outputDirectory,
      '--clear', '--max-workers', '2', '--source-maps',
    ],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        CI: '1',
        NODE_ENV: 'production',
        EXPO_PUBLIC_API_URL: 'https://api.example.invalid/api/v1',
        EXPO_PUBLIC_REPORT_API_URL: 'https://api.example.invalid/api/v1',
      },
      stdio: 'inherit',
    },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
  else if ((await readdir(outputDirectory)).length === 0) {
    throw new Error('Expo Android export completed without producing bundle output.');
  } else {
    const maps = (await readdir(outputDirectory, {recursive: true})).filter((file) =>
      file.replaceAll('\\', '/').startsWith('_expo/static/js/android/') && file.endsWith('.map'));
    if (maps.length === 0) throw new Error('Expo Android export did not produce native source-map evidence.');
    let sourceCount = 0;
    let metroLoaderCount = 0;
    for (const file of maps) {
      const map = JSON.parse(await readFile(path.join(outputDirectory, file), 'utf8'));
      const evidence = assertAndroidBundlePolicy(map);
      sourceCount += evidence.sourceCount;
      metroLoaderCount += evidence.metroLoaderCount;
    }
    console.log(`Android bundle policy passed (${maps.length} map(s), ${sourceCount} sources, ${metroLoaderCount} Metro loader(s); no CLI tooling, legacy Zod or deepmerge).`);
  }
} finally {
  await rm(outputDirectory, { recursive: true, force: true });
}
