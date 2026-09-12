import assert from "node:assert/strict";
import { collectImportSpecifiers } from "./import-specifiers.mjs";

assert.deepEqual([...collectImportSpecifiers(`
  import type { A } from "@/static";
  export { B } from "@/export";
  const lazy = import(/* webpackChunkName: "x" */ "@/dynamic", { with: { type: "json" } });
  const template = import(\`@/template\`);
  const commonjs = require("@/require");
  import alias = require("@/alias");
  type Contract = import("@/contract").Contract;
  // import("@/comment")
  const text = 'import("@/string")';
`)], ["@/static", "@/export", "@/dynamic", "@/template", "@/require", "@/alias", "@/contract"]);
console.log("Import parser self-test passed: static, dynamic, templates, require, import types, and false positives.");
