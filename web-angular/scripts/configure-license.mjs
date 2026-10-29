import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const license = process.env.PRIMEUI_LICENSE_KEY?.trim();
const target = path.join(root, 'src/config/license.generated.ts');
const content = '// Local build input. Do not commit or print.\n' +
  `export const primeUiLicenseKey: string | undefined = ${license ? JSON.stringify(license) : 'undefined'};\n`;
fs.mkdirSync(path.dirname(target), { recursive: true });
if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) fs.writeFileSync(target, content);
process.stdout.write(license ? 'PrimeUI local license configured (value omitted).\n' : 'PrimeUI local key not configured; licensed runtime acceptance remains pending.\n');
