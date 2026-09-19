import fs from "node:fs";
import path from "node:path";
import {
  classifyRoute,
  findRouteClassBudgetViolations,
  isProtectedRouteClass,
  MIB,
  protectedSharedBudgetSpec,
  routeClassBudgetSpecs,
} from "./performance-budget-policy.mjs";

const nextRoot = path.resolve(".next");
const chunksRoot = path.join(nextRoot, "static", "chunks");

function readPositiveByteBudget(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  if (!/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
    console.error(`${name} must be a positive integer number of bytes.`);
    process.exit(1);
  }
  return Number(raw);
}

const budgets = {
  totalJavaScriptBytes: readPositiveByteBudget("WEB_BUNDLE_MAX_TOTAL_JS_BYTES", 26 * MIB),
  largestChunkBytes: readPositiveByteBudget("WEB_BUNDLE_MAX_CHUNK_BYTES", 12 * MIB),
  firstLoadRouteBytes: readPositiveByteBudget("WEB_BUNDLE_MAX_FIRST_LOAD_ROUTE_BYTES", 4.5 * MIB),
  protectedSharedJavaScriptBytes: readPositiveByteBudget(
    protectedSharedBudgetSpec.env,
    protectedSharedBudgetSpec.defaultBytes,
  ),
};
const routeClassBudgets = Object.fromEntries(
  routeClassBudgetSpecs.map((entry) => [
    entry.name,
    readPositiveByteBudget(entry.env, entry.defaultBytes),
  ]),
);

if (!fs.existsSync(chunksRoot)) {
  console.error("No .next/static/chunks directory found. Run `npm run build` first.");
  process.exit(1);
}

const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (entry.name.endsWith(".js")) {
      files.push({
        file: path.relative(nextRoot, filePath).replaceAll(path.sep, "/"),
        bytes: fs.statSync(filePath).size,
      });
    }
  }
}
walk(chunksRoot);

const totalBytes = files.reduce((total, item) => total + item.bytes, 0);
const largest = files.toSorted((left, right) => right.bytes - left.bytes).slice(0, 12);
const appPathsManifest = path.join(nextRoot, "server", "app-paths-manifest.json");
const routeCount = fs.existsSync(appPathsManifest)
  ? Object.keys(JSON.parse(fs.readFileSync(appPathsManifest, "utf8"))).length
  : null;
const routeBundleStatsPath = path.join(nextRoot, "diagnostics", "route-bundle-stats.json");
const routeBundleStats = fs.existsSync(routeBundleStatsPath)
  ? JSON.parse(fs.readFileSync(routeBundleStatsPath, "utf8"))
  : null;
const rawRouteEntries = Array.isArray(routeBundleStats)
  ? routeBundleStats.map((value) => [value?.route, value])
  : routeBundleStats && typeof routeBundleStats === "object"
    ? Object.entries(routeBundleStats.routes ?? routeBundleStats)
    : [];
const routeEntries = rawRouteEntries
  .flatMap(([route, value]) => {
    const bytes = Number(
      value?.firstLoadUncompressedJsBytes ??
      value?.firstLoadJsSize ??
      value?.firstLoadJS ??
      value?.firstLoadBytes,
    );
    return typeof route === "string" && Number.isFinite(bytes) ? [{ route, bytes }] : [];
  })
  .toSorted((left, right) => right.bytes - left.bytes);

const routeClassSummaries = routeClassBudgetSpecs.map((policy) => {
  const entries = routeEntries.filter((entry) => classifyRoute(entry.route) === policy.name);
  const totalBytes = entries.reduce((total, entry) => total + entry.bytes, 0);
  const max = entries[0] ?? null;
  const budgetBytes = routeClassBudgets[policy.name];
  return {
    name: policy.name,
    routeCount: entries.length,
    maxRoute: max?.route ?? null,
    maxBytes: max?.bytes ?? null,
    maxMiB: max ? Number((max.bytes / MIB).toFixed(2)) : null,
    averageMiB: entries.length > 0
      ? Number((totalBytes / entries.length / MIB).toFixed(2))
      : null,
    budgetBytes,
    budgetMiB: Number((budgetBytes / MIB).toFixed(2)),
  };
});

function normalizeChunkPath(chunkPath) {
  return chunkPath.replaceAll("\\", "/").replace(/^\.next\//, "");
}

const protectedRouteEntries = rawRouteEntries
  .flatMap(([route, value]) => {
    if (typeof route !== "string") return [];
    const routeClass = classifyRoute(route);
    if (!isProtectedRouteClass(routeClass) || !Array.isArray(value?.firstLoadChunkPaths)) return [];
    return [{ route, chunkPaths: value.firstLoadChunkPaths.map(normalizeChunkPath) }];
  });

const protectedSharedChunkPaths = protectedRouteEntries.length > 0
  ? protectedRouteEntries
      .slice(1)
      .reduce(
        (intersection, entry) => new Set(entry.chunkPaths.filter((chunkPath) => intersection.has(chunkPath))),
        new Set(protectedRouteEntries[0].chunkPaths),
      )
  : new Set();
const fileSizeByPath = new Map(files.map((entry) => [entry.file, entry.bytes]));
const protectedSharedJavaScriptBytes = [...protectedSharedChunkPaths]
  .reduce((total, chunkPath) => total + (fileSizeByPath.get(chunkPath) ?? 0), 0);

const report = {
  generatedAt: new Date().toISOString(),
  routeCount,
  measuredFirstLoadRouteCount: routeEntries.length || null,
  javascriptChunkCount: files.length,
  javascriptBytes: totalBytes,
  javascriptMiB: Number((totalBytes / 1024 / 1024).toFixed(2)),
  largestChunks: largest.map((item) => ({
    ...item,
    kib: Number((item.bytes / 1024).toFixed(1)),
  })),
  largestFirstLoadRoutes: routeEntries.slice(0, 12).map((item) => ({
    ...item,
    mib: Number((item.bytes / 1024 / 1024).toFixed(2)),
  })),
  routeClasses: routeClassSummaries,
  protectedSharedFirstLoad: {
    measuredRouteCount: protectedRouteEntries.length,
    sharedChunkCount: protectedSharedChunkPaths.size,
    javascriptBytes: protectedSharedJavaScriptBytes,
    javascriptMiB: Number((protectedSharedJavaScriptBytes / MIB).toFixed(2)),
    budgetBytes: budgets.protectedSharedJavaScriptBytes,
    budgetMiB: Number((budgets.protectedSharedJavaScriptBytes / MIB).toFixed(2)),
  },
  budgets: {
    ...budgets,
    totalJavaScriptMiB: Number((budgets.totalJavaScriptBytes / MIB).toFixed(2)),
    largestChunkMiB: Number((budgets.largestChunkBytes / MIB).toFixed(2)),
    firstLoadRouteMiB: Number((budgets.firstLoadRouteBytes / MIB).toFixed(2)),
    protectedSharedJavaScriptMiB: Number((budgets.protectedSharedJavaScriptBytes / MIB).toFixed(2)),
  },
};

console.log(JSON.stringify(report, null, 2));

const violations = [];
if (totalBytes > budgets.totalJavaScriptBytes) {
  violations.push(`total JavaScript ${totalBytes} bytes exceeds ${budgets.totalJavaScriptBytes}`);
}
if (largest[0]?.bytes > budgets.largestChunkBytes) {
  violations.push(`largest chunk ${largest[0].bytes} bytes exceeds ${budgets.largestChunkBytes}`);
}
if (routeEntries[0]?.bytes > budgets.firstLoadRouteBytes) {
  violations.push(`largest first-load route ${routeEntries[0].bytes} bytes exceeds ${budgets.firstLoadRouteBytes}`);
}
for (const violation of findRouteClassBudgetViolations(routeEntries, routeClassBudgets)) {
  violations.push(
    `${violation.routeClass} route ${violation.route} is ${violation.bytes} bytes and exceeds ${violation.budgetBytes}`,
  );
}
if (protectedSharedJavaScriptBytes > budgets.protectedSharedJavaScriptBytes) {
  violations.push(
    `protected shared first-load JavaScript ${protectedSharedJavaScriptBytes} bytes exceeds ${budgets.protectedSharedJavaScriptBytes}`,
  );
}
if (violations.length > 0) {
  console.error("Web bundle budget exceeded:");
  for (const violation of violations) console.error(`  ${violation}`);
  process.exit(1);
}
