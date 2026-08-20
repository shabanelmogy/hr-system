import { ar } from '../ar';
import { en } from '../en';

describe('translation resources', () => {
  it('keeps English and Arabic semantic keys in parity', () => {
    expect(collectSemanticKeys(ar)).toEqual(collectSemanticKeys(en));
  });

  it('contains only renderable leaf values', () => {
    expect(collectInvalidLeafKeys(en)).toEqual([]);
    expect(collectInvalidLeafKeys(ar)).toEqual([]);
  });
});

function collectLeafKeys(value: unknown, prefix = ''): string[] {
  if (!isRecord(value)) return [prefix];

  return Object.entries(value)
    .flatMap(([key, child]) => collectLeafKeys(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

function collectSemanticKeys(value: unknown): string[] {
  return [
    ...new Set(
      collectLeafKeys(value).map((key) =>
        key.replace(/_(?:zero|one|two|few|many|other)$/, ''),
      ),
    ),
  ].sort();
}

function collectInvalidLeafKeys(value: unknown, prefix = ''): string[] {
  if (!isRecord(value)) {
    return typeof value === 'string' || typeof value === 'number' ? [] : [prefix];
  }

  return Object.entries(value)
    .flatMap(([key, child]) => collectInvalidLeafKeys(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
