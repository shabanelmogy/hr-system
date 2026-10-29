import { spawn } from 'node:child_process';
import path from 'node:path';
import { appRoot, configureApi } from './configure-api.mjs';

// Only the allowlisted public API origin is emitted into the browser bundle.
const args = process.argv.slice(2);
const overrides = args.filter(value => value.startsWith('--api-target='));
if (overrides.length > 1) throw new Error('Specify --api-target only once.');
configureApi(overrides[0]?.slice('--api-target='.length));
const child = spawn(process.execPath, [
  path.join(appRoot, 'node_modules/@angular/cli/bin/ng.js'),
  ...args.filter(value => !value.startsWith('--api-target=')),
], { cwd: appRoot, stdio: 'inherit' });
child.on('error', error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
