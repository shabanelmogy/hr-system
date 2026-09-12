import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { generateModule, moduleFiles } from "./generate-module.mjs";

const files = moduleFiles({ code: "sample", slug: "sample-module", name: "Sample Module" });
assert(files.has("moduleDefinition.tsx"));
assert(files.has("index.ts"));
assert(files.has("locales/en.json"));

const root = fs.mkdtempSync(path.join(os.tmpdir(), "erp-module-generator-"));
const planned = generateModule({ code: "sample", slug: "sample-module", name: "Sample Module", root, dryRun: true });
assert.equal(planned.length, files.size);
assert.equal(fs.existsSync(path.join(root, "sample-module")), false);
const written = generateModule({ code: "sample", slug: "sample-module", name: "Sample Module", root });
assert.equal(written.length, files.size);
for (const relativePath of files.keys()) {
  assert.equal(fs.existsSync(path.join(root, "sample-module", relativePath)), true);
}
assert.match(fs.readFileSync(path.join(root, "sample-module", "moduleDefinition.tsx"), "utf8"), /code: "sample"/);
assert.throws(() => moduleFiles({ code: "../escape", slug: "safe", name: "Escape" }), /kebab-case/);
assert.throws(() => moduleFiles({ code: "safe", slug: "../escape", name: "Escape" }), /kebab-case/);
fs.rmSync(root, { recursive: true, force: true });

console.log("Module generator self-test passed.");
