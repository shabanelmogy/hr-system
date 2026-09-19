import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  allowedOwnerDependencies,
  appRouteOwnerGroups,
  documentedRouteOwnership,
  moduleDocumentationSlugs,
  moduleDirectories,
  ownershipGroups,
} from "./module-boundaries.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(webRoot, "..");
const appRoot = path.join(webRoot, "src", "app");
const mainAppRoot = path.join(appRoot, "(main)");
const manifestPath = path.join(
  repositoryRoot,
  "documentation",
  "web-next",
  "architecture",
  "frontend-architecture-manifest.md",
);
const moduleDocumentationRoot = path.join(repositoryRoot, "documentation", "modules");

const toPosix = (value) => value.split(path.sep).join("/");

function walkPages(directory, pages = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkPages(filePath, pages);
    else if (entry.isFile() && entry.name === "page.tsx") pages.push(filePath);
  }
  return pages;
}

export function canonicalAppRoute(pageFile) {
  const segments = path
    .relative(appRoot, pageFile)
    .split(path.sep)
    .slice(0, -1)
    .filter((segment) => !/^\(.+\)$/.test(segment));
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

function protectedOwner(pageFile) {
  if (!pageFile.startsWith(`${mainAppRoot}${path.sep}`)) return null;
  const segments = path.relative(mainAppRoot, pageFile).split(path.sep).slice(0, -1);
  const owners = [
    ...new Set(segments.map((segment) => appRouteOwnerGroups[segment]).filter(Boolean)),
  ];
  if (owners.length !== 1) {
    throw new Error(
      `${toPosix(path.relative(repositoryRoot, pageFile))}: expected exactly one protected route owner, found ${owners.length ? owners.join(", ") : "none"}`,
    );
  }
  return owners[0];
}

export function collectProtectedRoutes() {
  return walkPages(appRoot)
    .map((pageFile) => ({
      route: canonicalAppRoute(pageFile),
      owner: protectedOwner(pageFile),
      source: toPosix(path.relative(repositoryRoot, pageFile)),
    }))
    .filter((entry) => entry.owner)
    .sort((left, right) => left.route.localeCompare(right.route));
}

function validateDocumentedOwnership(routes) {
  const routeMap = new Map(routes.map((entry) => [entry.route, entry]));
  for (const [route, expectedOwner] of Object.entries(documentedRouteOwnership)) {
    const entry = routeMap.get(route);
    if (!entry) throw new Error(`Documented ownership route '${route}' is missing from the protected App Router tree.`);
    if (entry.owner !== expectedOwner) {
      throw new Error(
        `Documented ownership route '${route}' belongs to '${entry.owner}', expected '${expectedOwner}'.`,
      );
    }
  }
}

function ownerSource(owner) {
  if (owner === "platform") return "web-next/src/platform";
  if (owner === "shell") return "web-next/src/shell";
  if (owner === "shared") return "web-next/src/shared";
  const moduleDirectory = moduleDirectories[owner];
  return moduleDirectory ? `web-next/${toPosix(moduleDirectory)}` : "—";
}

function ownerRouteGroup(owner) {
  return Object.entries(appRouteOwnerGroups).find(([, value]) => value === owner)?.[0] ?? "—";
}

function collectModuleDocumentation() {
  const registeredOwners = Object.keys(moduleDirectories).sort();
  const mappedOwners = Object.keys(moduleDocumentationSlugs).sort();
  if (registeredOwners.join("|") !== mappedOwners.join("|")) {
    throw new Error(
      "moduleDocumentationSlugs must contain exactly the registered frontend business-module owners.",
    );
  }

  return registeredOwners.map((owner) => {
    const slug = moduleDocumentationSlugs[owner];
    const moduleJsonPath = path.join(moduleDocumentationRoot, slug, "module.json");
    if (!fs.existsSync(moduleJsonPath)) {
      throw new Error(`Missing module documentation manifest for '${owner}': ${toPosix(path.relative(repositoryRoot, moduleJsonPath))}`);
    }

    const document = JSON.parse(fs.readFileSync(moduleJsonPath, "utf8"));
    const surface = document.webNextSurface;
    if (!surface || surface.status !== "active") {
      throw new Error(`Module documentation '${slug}' must declare webNextSurface.status = 'active'.`);
    }
    if (surface.owner !== owner) {
      throw new Error(`Module documentation '${slug}' declares web owner '${surface.owner}', expected '${owner}'.`);
    }

    const expectedSourceRoot = `web-next/${toPosix(moduleDirectories[owner])}`;
    const expectedModuleDefinition = `${expectedSourceRoot}/moduleDefinition.tsx`;
    if (surface.sourceRoot !== expectedSourceRoot) {
      throw new Error(`Module documentation '${slug}' sourceRoot is '${surface.sourceRoot}', expected '${expectedSourceRoot}'.`);
    }
    if (surface.moduleDefinition !== expectedModuleDefinition) {
      throw new Error(
        `Module documentation '${slug}' moduleDefinition is '${surface.moduleDefinition}', expected '${expectedModuleDefinition}'.`,
      );
    }

    const webReadme = document.documentationPaths?.webNext;
    if (!webReadme || !fs.existsSync(path.join(repositoryRoot, webReadme))) {
      throw new Error(`Module documentation '${slug}' must point to an existing documentationPaths.webNext README.`);
    }

    return {
      owner,
      slug,
      status: surface.status,
      sourceRoot: surface.sourceRoot,
      moduleDefinition: surface.moduleDefinition,
      moduleManifest: toPosix(path.relative(repositoryRoot, moduleJsonPath)),
      webReadme: toPosix(webReadme),
    };
  });
}

export function renderArchitectureManifest(routes = collectProtectedRoutes()) {
  validateDocumentedOwnership(routes);
  const moduleDocumentation = collectModuleDocumentation();

  const ownerRows = ownershipGroups.map((owner) => {
    const dependencies = allowedOwnerDependencies[owner] ?? [];
    return `| ${owner} | \`${ownerSource(owner)}\` | \`${ownerRouteGroup(owner)}\` | ${dependencies.length ? dependencies.join(", ") : "—"} |`;
  });

  const routeMap = new Map(routes.map((entry) => [entry.route, entry]));
  const contractRows = Object.entries(documentedRouteOwnership)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([route, owner]) => {
      const entry = routeMap.get(route);
      return `| \`${route}\` | ${owner} | \`${entry.source}\` |`;
    });

  const routeRows = routes.map(
    (entry) => `| \`${entry.route}\` | ${entry.owner} | \`${entry.source}\` |`,
  );

  const moduleDocumentationRows = moduleDocumentation.map(
    (entry) => `| ${entry.owner} | ${entry.status} | \`${entry.moduleManifest}\` | \`${entry.webReadme}\` | \`${entry.moduleDefinition}\` |`,
  );

  return [
    "<!-- Generated by web-next/scripts/architecture-governance.mjs. Do not edit manually. -->",
    "# Frontend Architecture Manifest",
    "",
    "This Phase 13 manifest is generated from the live ownership policy and App Router tree.",
    "Run `npm run generate:architecture-manifest` after an intentional ownership/route change and",
    "`npm run check:governance` to verify the committed manifest is current.",
    "",
    "## Ownership policy",
    "",
    "| Owner | Source root | Protected route group | May depend on |",
    "| --- | --- | --- | --- |",
    ...ownerRows,
    "",
    "## Module documentation parity",
    "",
    "Every registered frontend business module must declare an active Web surface in its module manifest.",
    "",
    "| Owner | Web status | Module manifest | Web documentation | Module definition |",
    "| --- | --- | --- | --- | --- |",
    ...moduleDocumentationRows,
    "",
    "## Canonical ownership contracts",
    "",
    "These routes are explicit Phase 13 regression contracts, not just examples in prose.",
    "",
    "| Public route | Owner | App Router source |",
    "| --- | --- | --- |",
    ...contractRows,
    "",
    "## Protected App Router manifest",
    "",
    "| Public route | Owner | App Router source |",
    "| --- | --- | --- |",
    ...routeRows,
    "",
  ].join("\n");
}

function checkManifest(expected) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `Architecture manifest is missing at ${toPosix(path.relative(repositoryRoot, manifestPath))}. Run npm run generate:architecture-manifest.`,
    );
  }
  const current = fs.readFileSync(manifestPath, "utf8").replace(/\r\n/g, "\n");
  if (current !== expected) {
    throw new Error(
      "Frontend architecture manifest is stale. Run npm run generate:architecture-manifest and review the ownership/route diff.",
    );
  }
}

function main() {
  const mode = process.argv[2];
  const manifest = renderArchitectureManifest();
  if (mode === "--write") {
    fs.writeFileSync(manifestPath, manifest, "utf8");
    console.log(`Wrote ${toPosix(path.relative(repositoryRoot, manifestPath))}.`);
    return;
  }
  if (mode === "--check") {
    checkManifest(manifest);
    console.log("Architecture governance check passed: ownership contracts and generated route manifest are current.");
    return;
  }
  throw new Error("Usage: node scripts/architecture-governance.mjs --write|--check");
}

const invokedAsScript = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;
if (invokedAsScript) main();
