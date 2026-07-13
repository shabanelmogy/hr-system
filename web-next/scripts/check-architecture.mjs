import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const sourceRoot = path.resolve("src");
const sourceFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) sourceFiles.push(filePath);
  }
}

walk(sourceRoot);
const sourceFileSet = new Set(sourceFiles);

function resolveImport(fromFile, specifier) {
  let candidate = null;
  if (specifier.startsWith("@/")) candidate = path.join(sourceRoot, specifier.slice(2));
  else if (specifier.startsWith(".")) candidate = path.resolve(path.dirname(fromFile), specifier);
  if (!candidate) return null;

  const candidates = [
    candidate,
    `${candidate}.ts`,
    `${candidate}.tsx`,
    `${candidate}.js`,
    `${candidate}.jsx`,
    path.join(candidate, "index.ts"),
    path.join(candidate, "index.tsx"),
    path.join(candidate, "index.js"),
  ];

  return candidates.find((filePath) => sourceFileSet.has(filePath)) ?? null;
}

function layerOf(filePath) {
  const relative = path.relative(sourceRoot, filePath).split(path.sep)[0];
  return relative || "root";
}

function featureGroup(filePath) {
  const parts = path.relative(sourceRoot, filePath).split(path.sep);
  return parts[0] === "features" ? parts[1] : null;
}

const graph = new Map(sourceFiles.map((filePath) => [filePath, []]));
const importPattern = /(?:from|import)\s*["']([^"']+)["']/g;
const violations = [];

for (const filePath of sourceFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  let match;

  while ((match = importPattern.exec(source))) {
    const target = resolveImport(filePath, match[1]);
    if (!target) continue;
    graph.get(filePath).push(target);

    const fromLayer = layerOf(filePath);
    const targetLayer = layerOf(target);
    const allowedFeatureDependency = fromLayer === "features" &&
      targetLayer === "features" &&
      (featureGroup(filePath) === featureGroup(target) || path.basename(target) === "index.ts");

    if (
      (fromLayer === "shared" && ["app", "layouts", "features"].includes(targetLayer)) ||
      (fromLayer === "features" && ["app", "layouts"].includes(targetLayer)) ||
      (fromLayer === "layouts" && ["app", "features"].includes(targetLayer)) ||
      (fromLayer === "lib" && ["app", "layouts", "features"].includes(targetLayer)) ||
      (fromLayer === "config" && ["app", "layouts", "features", "shared"].includes(targetLayer)) ||
      (fromLayer === "features" && targetLayer === "features" && !allowedFeatureDependency)
    ) {
      violations.push(`${path.relative(process.cwd(), filePath)} -> ${path.relative(process.cwd(), target)}`);
    }
  }
}

const states = new Map();
const stack = [];
const cycles = new Set();

function visit(filePath) {
  states.set(filePath, "visiting");
  stack.push(filePath);

  for (const dependency of graph.get(filePath)) {
    if (states.get(dependency) === "visiting") {
      const start = stack.indexOf(dependency);
      cycles.add([...stack.slice(start), dependency].map((item) => path.relative(process.cwd(), item)).join(" -> "));
    } else if (!states.has(dependency)) {
      visit(dependency);
    }
  }

  stack.pop();
  states.set(filePath, "visited");
}

for (const filePath of sourceFiles) {
  if (!states.has(filePath)) visit(filePath);
}

if (violations.length || cycles.size) {
  if (violations.length) {
    console.error("Forbidden architecture dependencies:");
    for (const violation of violations) console.error(`  ${violation}`);
  }
  if (cycles.size) {
    console.error("Circular dependencies:");
    for (const cycle of cycles) console.error(`  ${cycle}`);
  }
  process.exit(1);
}

console.log("Architecture checks passed: dependency direction and cycles are clean.");
