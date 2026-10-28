import assert from 'node:assert/strict';
import test from 'node:test';
import {assertAndroidBundlePolicy} from './android-bundle-policy.mjs';

const nativeSources = ['src/core/api/client.ts', 'node_modules/react-native/index.js'];
const sourceMap = (sources, sourceRoot) => ({version: 3, sources, sourceRoot});

test('accepts application/native sources and patched Zod v4', () => {
  assert.deepEqual(assertAndroidBundlePolicy(sourceMap([
    ...nativeSources, 'node_modules/zod/v4/core/schemas.js', nativeSources[0],
  ])), {sourceCount: 3, metroLoaderCount: 0});
});

test('accepts Windows absolute paths and indexed source maps', () => {
  const map = {version: 3, sections: [
    {map: sourceMap(['C:\\workspace\\mobile-react\\app\\_layout.tsx'])},
    {map: sourceMap(['C:\\workspace\\mobile-react\\node_modules\\react-native\\index.js'])},
  ]};
  assert.equal(assertAndroidBundlePolicy(map).sourceCount, 2);
});

for (const dependency of [
  'node_modules/expo/node_modules/@expo/cli/build/src/index.js',
  'node_modules/zod/v3/types.js',
  'node_modules/zod/src/v3/types.ts',
  'node_modules/zod/lib/index.js',
  'node_modules/deepmerge/dist/cjs.js',
  'node_modules/@expo/cli/build/metro-require/require-extra.js',
  'node_modules/@expo/cli/build/src/start/server/DevToolsPlugin.schema.js',
]) {
  test(`rejects runtime dependency ${dependency}`, () => {
    assert.throws(() => assertAndroidBundlePolicy(sourceMap([...nativeSources, dependency])), /prohibited dependency/);
  });
}

test('allows only the SDK57 Metro module loader within the CLI package', () => {
  const map = sourceMap([...nativeSources, 'node_modules/expo/node_modules/@expo/cli/build/metro-require/require.js']);
  assert.deepEqual(assertAndroidBundlePolicy(map), {sourceCount: 3, metroLoaderCount: 1});
});

test('checks section sources and sourceRoot before deciding the boundary', () => {
  const map = {version: 3, sections: [
    {map: sourceMap(nativeSources)},
    {map: sourceMap(['types.js'], 'node_modules/zod/v3')},
  ]};
  assert.throws(() => assertAndroidBundlePolicy(map), /prohibited dependency/);
});

test('rejects missing, empty or malformed evidence', () => {
  for (const map of [null, {}, {version: 2, sources: nativeSources}, sourceMap([]),
    sourceMap([42]), sourceMap(nativeSources, 42), {version: 3, sections: []},
    {version: 3, sections: [{url: 'external.map'}]}]) {
    assert.throws(() => assertAndroidBundlePolicy(map), /source map|source-map/);
  }
});

test('rejects maps that omit application or native runtime sources', () => {
  for (const sources of [[nativeSources[0]], [nativeSources[1]], ['node_modules/zod/v4/index.js']]) {
    assert.throws(() => assertAndroidBundlePolicy(sourceMap(sources)), /application and React Native/);
  }
});
