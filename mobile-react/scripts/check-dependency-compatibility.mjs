import {performance} from 'node:perf_hooks';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const decodeUriComponent = require('decode-uri-component');
const queryString = require('query-string');

function fail(message) {
  throw new Error(`Dependency compatibility check failed: ${message}`);
}

const decodePackage = require('decode-uri-component/package.json');
if (decodePackage.version !== '0.5.0') {
  fail(`decode-uri-component must resolve to 0.5.0 (got ${decodePackage.version})`);
}

if (decodeUriComponent('st%C3%A5le') !== 'ståle') {
  fail('valid UTF-8 URI decoding changed');
}

const parsedQuery = queryString.parse('name=st%C3%A5le&broken=%E0%A4%A');
if (parsedQuery.name !== 'ståle' || parsedQuery.broken !== '%E0%A4%A') {
  fail('query-string does not use the patched decoder for valid/malformed values');
}

if (queryString.stringify({name: parsedQuery.name}) !== 'name=st%C3%A5le') {
  fail('query-string stringify compatibility changed');
}

for (const malformed of ['%E0%A4%A', '%', '%GG', '%C3%28']) {
  let decoded;
  try {
    decoded = decodeUriComponent(malformed);
  } catch (error) {
    fail(`malformed URI ${malformed} threw ${String(error)}`);
  }

  if (typeof decoded !== 'string') {
    fail(`malformed URI ${malformed} did not return a string`);
  }
}

const adversarialInput = '%E0%A4%'.repeat(10_000);
const startedAt = performance.now();
const adversarialOutput = decodeUriComponent(adversarialInput);
const elapsedMs = performance.now() - startedAt;

if (adversarialOutput.length === 0 || elapsedMs > 3_000) {
  fail(`malformed-percent input took ${Math.round(elapsedMs)}ms`);
}

const xcode = require('xcode');
if (typeof xcode.project !== 'function') {
  fail('xcode CommonJS project API was lost');
}

const project = xcode.project('dependency-compatibility.pbxproj');
project.hash = {project: {objects: {}}};
const projectId = project.generateUuid();
if (!/^[A-F0-9]{24}$/.test(projectId)) {
  fail('xcode did not generate a valid PBX project identifier');
}

console.log(`Dependency compatibility passed (decode-uri-component adversarial case: ${Math.round(elapsedMs)}ms).`);
