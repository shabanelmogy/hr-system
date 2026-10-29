import fs from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { pathToFileURL } from 'node:url';

export const appRoot = path.resolve(import.meta.dirname, '..');

export function readApiEnvironment(root = appRoot, environment = process.env) {
  const values = {};
  for (const name of ['.env', '.env.local']) {
    const file = path.join(root, name);
    if (fs.existsSync(file)) Object.assign(values, parseEnv(fs.readFileSync(file, 'utf8')));
  }
  return { ...values, ...environment };
}

export function resolveApiOrigin(values, targetOverride) {
  const target = (targetOverride ?? values.ERP_API_TARGET ?? '').trim();
  if (!['local', 'host'].includes(target)) throw new Error('ERP_API_TARGET must be local or host.');
  const key = target === 'local' ? 'ERP_API_LOCAL_URL' : 'ERP_API_HOST_URL';
  const value = values[key]?.trim();
  let url;
  try { url = new URL(value); } catch { throw new Error(`${key} must be an absolute HTTPS origin.`); }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error(`${key} must be an HTTPS origin without credentials, path, query or fragment.`);
  }
  return { target, origin: url.origin };
}

export function configureApi(targetOverride, root = appRoot, environment = process.env) {
  const config = resolveApiOrigin(readApiEnvironment(root, environment), targetOverride);
  const output = path.join(root, 'src/config/api.generated.ts');
  const content = '// Generated from public .env configuration. Do not edit.\n' +
    `export const apiOrigin: string = ${JSON.stringify(config.origin)};\n`;
  fs.mkdirSync(path.dirname(output), { recursive: true });
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== content) fs.writeFileSync(output, content);
  process.stdout.write(`API target: ${config.target} (${config.origin})\n`);
  return config;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  configureApi();
}
