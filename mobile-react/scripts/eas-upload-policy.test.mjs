import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import test from 'node:test';

const require = createRequire(import.meta.url);
const ignore = require('ignore');
const repositoryRoot = resolve(import.meta.dirname, '../..');
const policy = ignore().add(readFileSync(resolve(repositoryRoot, '.easignore'), 'utf8'));

test('allows directory traversal entries used by the EAS copy filter', () => {
  for (const directory of ['mobile-react', 'mobile-react/', 'packages', 'packages/',
    'packages/tokens', 'packages/tokens/', 'packages/tokens/dist', 'packages/tokens/dist/']) {
    assert.equal(policy.ignores(directory), false, `Pruned build directory: ${directory}`);
  }
  assert.equal(policy.ignores('packages/unrelated'), true);
});

test('includes actual mobile build inputs and the packed local token dependency', () => {
  for (const file of [
    'mobile-react/package.json', 'mobile-react/package-lock.json', 'mobile-react/.npmrc',
    'mobile-react/app.config.ts', 'mobile-react/app.json', 'mobile-react/eas.json',
    'mobile-react/app/_layout.tsx', 'mobile-react/vendor/decode-uri-component-0.5.0.tgz',
    'packages/tokens/package.json', 'packages/tokens/dist/lib/index.js',
    'packages/tokens/dist/lib/native.js',
  ]) {
    assert.equal(existsSync(resolve(repositoryRoot, file)), true, `Missing build input: ${file}`);
    assert.equal(policy.ignores(file), false, `Excluded build input: ${file}`);
  }
});

test('excludes other applications, documentation, graphs and local tooling', () => {
  for (const file of [
    'api/ErpSystem.Api/appsettings.json', 'web-next/package.json',
    'packages/unrelated/package.json', 'documentation/plans/PLAN_REGISTRY.md',
    'graphify-out/graph.json', '.git/config', '.codex/skills/example/SKILL.md',
    '.codex-tmp/toolchains/node.exe',
  ]) {
    assert.equal(policy.ignores(file), true, `Unexpected upload path: ${file}`);
  }
});

test('excludes secrets, caches, installed dependencies and generated native output', () => {
  for (const file of [
    'mobile-react/.env', 'mobile-react/.env.local', 'mobile-react/credentials.json',
    'mobile-react/keys/release.jks', 'mobile-react/keys/client.pem',
    'mobile-react/keys/client.key', 'mobile-react/keys/ios.p12',
    'mobile-react/keys/auth.p8', 'mobile-react/keys/app.mobileprovision',
    'mobile-react/node_modules/expo/package.json', 'packages/tokens/node_modules/typescript/package.json',
    'mobile-react/.expo/settings.json', 'mobile-react/.jest-cache/result.json',
    'mobile-react/coverage/coverage-summary.json', 'mobile-react/android/app/build.gradle',
    'mobile-react/ios/Podfile', 'mobile-react/dist/bundle.js', 'mobile-react/tsconfig.tsbuildinfo',
  ]) {
    assert.equal(policy.ignores(file), true, `Sensitive/generated upload path: ${file}`);
  }
});
