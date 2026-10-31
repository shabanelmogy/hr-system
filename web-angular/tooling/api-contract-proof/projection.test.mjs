import assert from 'node:assert/strict';
import test from 'node:test';
import { projectSpec } from './projection.mjs';

function fixture() {
  return { openapi: '3.0.4', info: { title: 'Technical fixture', version: '1.0' },
    paths: {
      '/observed': { get: { tags: ['Countries'], responses: { 200: { description: 'OK', content: {
        'application/json': { schema: { $ref: '#/components/schemas/Observed' } },
      } } } } },
      '/unrelated': { get: { tags: ['Unrelated'], responses: { 200: { description: 'OK' } } } },
    },
    components: { schemas: {
      Observed: { type: 'object', properties: { label: { type: 'string', nullable: true } } },
      Unrelated: { type: 'string' },
    }, securitySchemes: { Bearer: { type: 'http', scheme: 'bearer' } } }, security: [{ Bearer: [] }],
  };
}

test('Projection excludes unrelated paths/models and cannot repair required/nullability/security', () => {
  const input = fixture();
  const before = JSON.stringify(input);
  const projected = projectSpec(input);
  assert.deepEqual(Object.keys(projected.paths), ['/observed']);
  assert.deepEqual(Object.keys(projected.components.schemas), ['Observed']);
  assert.deepEqual(projected.components.schemas.Observed, input.components.schemas.Observed);
  assert.equal('required' in projected.components.schemas.Observed, false);
  assert.equal('Cookie' in projected.components.securitySchemes, false);
  assert.equal(JSON.stringify(input), before);
});

test('Missing and external references fail closed instead of creating fake DTOs', () => {
  const input = fixture();
  delete input.components.schemas.Observed;
  assert.throws(() => projectSpec(input), /Missing observed component/);
  const external = fixture();
  external.paths['/observed'].get.responses[200].content['application/json'].schema.$ref = 'https://fixture.invalid/model.json';
  assert.throws(() => projectSpec(external), /Non-local component reference/);
});

test('Cyclic local schema references retain their closure without recursion overflow', () => {
  const input = fixture();
  input.components.schemas.Observed.properties.parent = { $ref: '#/components/schemas/Observed' };
  assert.deepEqual(projectSpec(input).components.schemas, input.components.schemas.Observed && { Observed: input.components.schemas.Observed });
});

test('Observed JSON media-map order is preserved for generator alias collision assessment', () => {
  const input = fixture();
  input.paths['/observed'].get.requestBody = { content: {
    'application/json': {}, 'text/json': {}, 'application/*+json': {},
  } };
  const output = JSON.parse(JSON.stringify(projectSpec(input)));
  assert.deepEqual(Object.keys(output.paths['/observed'].get.requestBody.content),
    ['application/json', 'text/json', 'application/*+json']);
});
