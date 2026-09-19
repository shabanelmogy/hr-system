import {cp, lstat, mkdtemp, readFile, rm, symlink} from 'node:fs/promises';
import {basename, dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {tmpdir} from 'node:os';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tempDirectory = resolve(tmpdir());
const tempPrefix = 'erp-system-mobile-native-';
const tempRoot = await mkdtemp(join(tempDirectory, tempPrefix));

function assertSafeTempRoot(candidate) {
  const resolvedCandidate = resolve(candidate);
  const relativeCandidate = relative(tempDirectory, resolvedCandidate);
  if (
    !relativeCandidate ||
    isAbsolute(relativeCandidate) ||
    relativeCandidate === '..' ||
    relativeCandidate.startsWith(`..${sep}`) ||
    !basename(resolvedCandidate).startsWith(tempPrefix)
  ) {
    throw new Error(`Refusing to remove an unexpected native-check temp path: ${resolvedCandidate}`);
  }
}

assertSafeTempRoot(tempRoot);

const requiredFiles = [
  'app.config.ts',
  'app.json',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
];

const childEnvironment = {...process.env, CI: '1', ERP_LOCAL_NATIVE_BUILD: 'true'};
delete childEnvironment.EXPO_EAS_PROJECT_ID;
delete childEnvironment.EAS_BUILD;
delete childEnvironment.EAS_BUILD_PROJECT_ID;

function run(command, args, cwd, captureOutput = false, environment = childEnvironment) {
  return new Promise((resolvePromise, reject) => {
    let output = '';
    const child = spawn(command, args, {
      cwd,
      stdio: captureOutput ? ['ignore', 'pipe', 'inherit'] : 'inherit',
      shell: false,
      env: environment,
    });
    if (captureOutput) {
      child.stdout.on('data', (chunk) => {
        output += chunk;
      });
    }
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolvePromise(output);
      } else {
        reject(new Error(`${command} exited with ${code ?? signal}`));
      }
    });
  });
}

try {
  for (const relativePath of requiredFiles) {
    await cp(join(projectRoot, relativePath), join(tempRoot, relativePath));
  }

  await cp(join(projectRoot, 'assets'), join(tempRoot, 'assets'), {recursive: true});

  const linkedNodeModules = join(tempRoot, 'node_modules');
  await symlink(
    join(projectRoot, 'node_modules'),
    linkedNodeModules,
    process.platform === 'win32' ? 'junction' : 'dir',
  );

  await run(
    process.execPath,
    [join(tempRoot, 'node_modules', 'expo', 'bin', 'cli'), 'prebuild', '--platform', 'android', '--no-install', '--clean'],
    tempRoot,
  );

  const resolvedConfigOutput = await run(
    process.execPath,
    [join(tempRoot, 'node_modules', 'expo', 'bin', 'cli'), 'config', '--type', 'public', '--json'],
    tempRoot,
    true,
  );
  const resolvedConfig = JSON.parse(resolvedConfigOutput);
  const resolvedEas = resolvedConfig.extra?.eas;
  if (
    resolvedEas?.projectId !== '00000000-0000-4000-8000-000000000057' ||
    resolvedEas?.observe?.dispatchingEnabled !== false
  ) {
    throw new Error('local native config did not bake the reserved project ID with observability dispatch disabled');
  }

  const easProjectId = '11111111-1111-4111-8111-111111111111';
  const easConfigOutput = await run(
    process.execPath,
    [join(tempRoot, 'node_modules', 'expo', 'bin', 'cli'), 'config', '--type', 'public', '--json'],
    tempRoot,
    true,
    {
      ...childEnvironment,
      ERP_LOCAL_NATIVE_BUILD: 'false',
      EAS_BUILD: 'true',
      EAS_BUILD_PROJECT_ID: easProjectId,
      EXPO_PUBLIC_APP_LINK_HOST: 'app.example.com',
    },
  );
  const easConfig = JSON.parse(easConfigOutput);
  if (
    easConfig.extra?.eas?.projectId !== easProjectId ||
    easConfig.extra?.eas?.observe?.dispatchingEnabled !== true
  ) {
    throw new Error('EAS config did not use its build project ID with observability dispatch enabled');
  }

  const gradlePropertiesPath = join(tempRoot, 'android', 'gradle.properties');
  const gradleProperties = await readFile(gradlePropertiesPath, 'utf8');
  if (!/^expo\.sqlite\.useSQLCipher=true$/m.test(gradleProperties)) {
    throw new Error('generated Android gradle.properties does not enable SQLCipher');
  }

  const manifestPath = join(tempRoot, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  const manifest = await readFile(manifestPath, 'utf8');
  if (!/android:allowBackup=["']false["']/.test(manifest)) {
    throw new Error('generated AndroidManifest.xml does not disable Android backups');
  }

  console.log(
    'Native Expo config passed (local/EAS observability, SQLCipher, and Android backup settings).',
  );
} finally {
  const linkedNodeModules = join(tempRoot, 'node_modules');
  assertSafeTempRoot(tempRoot);
  let nodeModulesStat;
  try {
    nodeModulesStat = await lstat(linkedNodeModules);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  if (nodeModulesStat && !nodeModulesStat.isSymbolicLink()) {
    throw new Error('Refusing to remove native-check node_modules because it is not a symlink/junction');
  }
  if (nodeModulesStat) {
    await rm(linkedNodeModules, {force: true, maxRetries: 10, retryDelay: 200});
  }
  await rm(tempRoot, {recursive: true, force: true, maxRetries: 10, retryDelay: 200});
}
