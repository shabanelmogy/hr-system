import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { ar } from '../ar';
import { en } from '../en';

const staticTranslationCall = /\bt\(\s*['"]([A-Za-z0-9_.-]+)['"]/g;
const projectRoot = resolve(__dirname, '../../../../..');

describe('mobile translation usage', () => {
  it('resolves every literal translation key used by an app screen or shared component', () => {
    const keys = new Set<string>();

    for (const root of ['app', 'src']) {
      for (const file of sourceFiles(join(projectRoot, root))) {
        const content = readFileSync(file, 'utf8');
        for (const match of content.matchAll(staticTranslationCall)) {
          keys.add(match[1]);
        }
      }
    }

    const unresolved = [...keys]
      .filter((key) => !hasTranslation(en, key) || !hasTranslation(ar, key))
      .sort();

    expect(unresolved).toEqual([]);
  });
});

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return entry.name === '__tests__' ? [] : sourceFiles(path);
    }

    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function resolveKey(resource: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((current, segment) => (
    isRecord(current) ? current[segment] : undefined
  ), resource);
}

function hasTranslation(resource: unknown, key: string): boolean {
  return resolveKey(resource, key) !== undefined
    || resolveKey(resource, `${key}_one`) !== undefined
    || resolveKey(resource, `${key}_other`) !== undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
