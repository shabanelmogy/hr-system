import fs from "node:fs";
import path from "node:path";

const nextRoot = path.resolve(".next");
const chunksRoot = path.join(nextRoot, "static", "chunks");

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

console.log(JSON.stringify({
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
}, null, 2));
