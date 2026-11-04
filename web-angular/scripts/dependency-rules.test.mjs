import assert from 'node:assert/strict';
import test from 'node:test';
import { sourceImports, inspectDependency, staticDependencyCycles } from './dependency-rules.mjs';

test('dependency analysis distinguishes value, explicit type, import type and lazy edges', () => {
  const result = sourceImports(`import { Value } from './a'; import type { Type } from './b';
    import { type Other } from './c'; type T = import('./d').T;
    const lazy = import('./e'); export type { X } from './f';`);
  assert.deepEqual(
    result.map(({ kind }) => kind),
    ['static', 'type', 'type', 'type', 'dynamic', 'type'],
  );
});
test('cross-owner internal paths are rejected for resolved aliases and type edges too', () => {
  const caller = 'src/app/modules/accounting/fiscal-year-context/state/context.ts';
  assert.ok(inspectDependency(caller, 'src/app/platform/auth/state/auth-session.ts').length);
  assert.deepEqual(inspectDependency(caller, 'src/app/platform/auth/session.public-api.ts'), []);
  assert.deepEqual(
    inspectDependency(
      caller,
      'src/app/modules/accounting/fiscal-year-context/services/fiscal-service.ts',
    ),
    [],
  );
  assert.deepEqual(
    inspectDependency(
      'src/app/modules/reference-data/public-api.ts',
      'src/app/modules/reference-data/geographical-information/countries/pages/countries.ts',
    ),
    [],
  );
  assert.deepEqual(
    inspectDependency(
      'src/app/modules/accounting/fiscal-year-context/fiscal.fixture.ts',
      'src/app/modules/accounting/fiscal-year-context/types/fiscal.ts',
    ),
    [],
  );
});
test('shared dependencies allow the reviewed localization adapter but reject business/session state', () => {
  const caller = 'src/app/shared/ui/button/button.ts';
  assert.deepEqual(inspectDependency(caller, 'src/app/platform/localization/public-api.ts'), []);
  assert.ok(inspectDependency(caller, 'src/app/platform/auth/session.public-api.ts').length);
  assert.ok(inspectDependency(caller, 'src/app/modules/reference-data/public-api.ts').length);
});
test('only static value cycles fail; intentional type/lazy feedback is distinct', () => {
  const edge = (source, target, kind = 'static') => ({ source, target, kind });
  assert.deepEqual(staticDependencyCycles([edge('a', 'b'), edge('b', 'a', 'type')]), []);
  assert.deepEqual(staticDependencyCycles([edge('a', 'b'), edge('b', 'a', 'dynamic')]), []);
  assert.deepEqual(staticDependencyCycles([edge('a', 'b'), edge('b', 'a')]), [['a', 'b']]);
});
