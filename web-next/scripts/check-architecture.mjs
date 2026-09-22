import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { collectImportSpecifiers } from "./import-specifiers.mjs";
import {
  allowedOwnerDependencies,
  appBusinessRouteGroup,
  appRouteOwnerGroups,
  documentedRouteOwnership,
  moduleDirectories,
  ownershipGroups,
  sharedMainRouteRoots,
} from "./module-boundaries.mjs";

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

function ownerOf(filePath) {
  const parts = path.relative(sourceRoot, filePath).split(path.sep);
  if (parts[0] === "platform") return "platform";
  if (parts[0] === "modules") return parts[1] ?? null;
  if (parts[0] === "shell") return "shell";
  if (parts[0] === "shared") return "shared";
  return null;
}

function isPublicApi(filePath) {
  return /^index\.(?:ts|tsx|js|jsx)$/.test(path.basename(filePath));
}

function normalizedSegments(filePath, root) {
  return path.relative(root, filePath).split(path.sep);
}

function canonicalAppRoute(pageFile) {
  const appRoot = path.join(sourceRoot, "app");
  const segments = normalizedSegments(pageFile, appRoot)
    .slice(0, -1)
    .filter((segment) => !/^\(.+\)$/.test(segment));
  return `/${segments.join("/")}`.replace(/\/$/, "") || "/";
}

function directoryContainsSourceFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory() && directoryContainsSourceFiles(item)) return true;
    if (entry.isFile() && /\.(?:ts|tsx|js|jsx)$/.test(entry.name)) return true;
  }
  return false;
}


const ownershipViolations = [];
const legacyFeatureRoot = path.join(sourceRoot, "features");
if (fs.existsSync(legacyFeatureRoot)) {
  const legacyEntries = fs.readdirSync(legacyFeatureRoot);
  if (legacyEntries.length > 0) {
    ownershipViolations.push(
      "src/features must remain empty; capabilities belong under src/platform or src/modules/<module>",
    );
  }
}

const legacyLayoutsRoot = path.join(sourceRoot, "layouts");
if (fs.existsSync(legacyLayoutsRoot) && fs.readdirSync(legacyLayoutsRoot).length > 0) {
  ownershipViolations.push("src/layouts is legacy; shell-owned code belongs under src/shell");
}

for (const [moduleCode, relativeDirectory] of Object.entries(moduleDirectories)) {
  const directory = path.resolve(relativeDirectory);
  if (!fs.existsSync(directory)) {
    ownershipViolations.push(`${relativeDirectory}: registered module directory is missing`);
    continue;
  }
  if (!fs.existsSync(path.join(directory, "index.ts"))) {
    ownershipViolations.push(`${relativeDirectory}: module public index.ts is required`);
  }
  if (!fs.existsSync(path.join(directory, "moduleDefinition.tsx"))) {
    ownershipViolations.push(`${relativeDirectory}: moduleDefinition.tsx is required`);
  }
  if (!ownershipGroups.includes(moduleCode)) {
    ownershipViolations.push(`${relativeDirectory}: '${moduleCode}' is not a known ownership group`);
  }
}

const modulesRoot = path.join(sourceRoot, "modules");
if (fs.existsSync(modulesRoot)) {
  for (const entry of fs.readdirSync(modulesRoot, { withFileTypes: true })) {
    if (entry.isDirectory() && !Object.hasOwn(moduleDirectories, entry.name)) {
      ownershipViolations.push(
        `src/modules/${entry.name}: module is not declared in scripts/module-boundaries.mjs`,
      );
    }
  }
}

const graph = new Map(sourceFiles.map((filePath) => [filePath, []]));
const violations = [];
const moduleBoundaryViolations = [];
const appRouteViolations = [];
const formSafetyViolations = [];
const cacheSafetyViolations = [];
const directHttpViolations = [];
const compatibilityViolations = [];
const interactionBoundaryViolations = [];
const navigationSafetyViolations = [];
const codeQualityViolations = [];
const hardenedRuntimeBoundaryFiles = new Set([
  "lib/auth/SessionContext.tsx",
  "app/api/auth/realtime-token/route.ts",
  "lib/signalr/signalRService.ts",
  "platform/auth/profile/services/userProfileService.ts",
  "platform/tenants/tenantApi.ts",
  "platform/tenant-admins/tenantAdminApi.ts",
]);

const guardedNavigationBypassAllowlist = new Set([
  // Session/authentication failures and logout are forced security transitions.
  "lib/auth/SessionContext.tsx",
  // These public-auth flows are outside the protected ERP editing shell.
  "platform/auth/accept-invitation/AcceptInvitationPage.tsx",
  "platform/auth/EmailConfirmed.tsx",
  "platform/auth/register/Register.tsx",
  "platform/auth/ResetPassword.tsx",
  // Automatic entry/fallback redirects do not leave an editable child mounted.
  "platform/modules/SubmoduleEntryPage.tsx",
  "shared/components/auth/ForbiddenPage.tsx",
  "shared/components/feedback/routes/PageUnavailable.tsx",
  // The central unsaved-changes provider performs the guarded replay itself.
  "shared/contexts/UnsavedChangesContext.tsx",
]);

const appRoot = path.join(sourceRoot, "app");
const mainAppRoot = path.join(appRoot, "(main)");
const appPageFiles = sourceFiles.filter(
  (filePath) =>
    filePath.startsWith(`${appRoot}${path.sep}`) && path.basename(filePath) === "page.tsx",
);

const pagesByCanonicalRoute = new Map();
const protectedRouteOwners = new Map();
for (const pageFile of appPageFiles) {
  const route = canonicalAppRoute(pageFile);
  const existing = pagesByCanonicalRoute.get(route);
  if (existing) {
    appRouteViolations.push(
      `${path.relative(process.cwd(), existing)} and ${path.relative(process.cwd(), pageFile)} ` +
        `both resolve to '${route}' after route groups are removed`,
    );
  } else {
    pagesByCanonicalRoute.set(route, pageFile);
  }

  const source = fs.readFileSync(pageFile, "utf8");
  if (/^\s*["']use client["'];?/m.test(source)) {
    appRouteViolations.push(
      `${path.relative(process.cwd(), pageFile)}: App Router pages must remain thin server adapters; ` +
        "move client state, hooks, and presentation into the owning module/platform/shell capability",
    );
  }

  if (!pageFile.startsWith(`${mainAppRoot}${path.sep}`)) continue;
  const segments = normalizedSegments(pageFile, mainAppRoot).slice(0, -1);
  const owners = [
    ...new Set(
      segments
        .map((segment) => appRouteOwnerGroups[segment])
        .filter(Boolean),
    ),
  ];
  if (owners.length !== 1) {
    appRouteViolations.push(
      `${path.relative(process.cwd(), pageFile)}: protected page must declare exactly one route owner group; ` +
        `found ${owners.length ? owners.join(", ") : "none"}`,
    );
    continue;
  }

  const owner = owners[0];
  protectedRouteOwners.set(route, owner);
  if (segments.includes(appBusinessRouteGroup) && !Object.hasOwn(moduleDirectories, owner)) {
    appRouteViolations.push(
      `${path.relative(process.cwd(), pageFile)}: '${appBusinessRouteGroup}' may contain only registered business-module owners`,
    );
  }
}

for (const [route, expectedOwner] of Object.entries(documentedRouteOwnership)) {
  const pageFile = pagesByCanonicalRoute.get(route);
  if (!pageFile) {
    appRouteViolations.push(
      `${route}: documented Phase 13 ownership contract points to a missing App Router page`,
    );
    continue;
  }

  const actualOwner = protectedRouteOwners.get(route);
  if (!actualOwner) {
    appRouteViolations.push(
      `${path.relative(process.cwd(), pageFile)}: '${route}' is a documented Phase 13 ownership contract and must remain a protected owner-group route`,
    );
    continue;
  }

  if (actualOwner !== expectedOwner) {
    appRouteViolations.push(
      `${path.relative(process.cwd(), pageFile)}: '${route}' is owned by '${actualOwner}' but Phase 13 requires '${expectedOwner}'`,
    );
  }
}

if (fs.existsSync(mainAppRoot)) {
  const allowedMainRouteRoots = new Set([
    appBusinessRouteGroup,
    "(platform)",
    "(shell)",
    ...sharedMainRouteRoots,
  ]);
  for (const entry of fs.readdirSync(mainAppRoot, { withFileTypes: true })) {
    const directory = path.join(mainAppRoot, entry.name);
    if (
      entry.isDirectory() &&
      directoryContainsSourceFiles(directory) &&
      !allowedMainRouteRoots.has(entry.name)
    ) {
      appRouteViolations.push(
        `src/app/(main)/${entry.name}: protected route roots must be grouped by owner or use an approved shared URL prefix`,
      );
    }
  }
}

const forbiddenCompatibilityPatterns = [
  {
    pattern: /\bLEGACY_(?:ACCESS|REFRESH)_TOKEN_COOKIE\b/,
    message: "legacy authentication cookie identifiers are forbidden; only the canonical __Host cookie contract is supported",
  },
  {
    pattern: /\bmigrationPayload\b/,
    message: "authentication cookie migration payloads are forbidden",
  },
  {
    pattern: /\/api\/v1\/auth\/checkAuth\/CheckAuth/,
    message: "the removed checkAuth authentication fallback endpoint must not be used",
  },
  {
    pattern: /\b(?:fetchValidatedClaimsFromCheckAuth|decodeApiValidatedClaims)\b/,
    message: "client-side session reconstruction from JWT claims is forbidden; use the canonical backend session contract",
  },
  {
    pattern: /\bMyForm\.(?:Container|Header|Content|Footer)\b/,
    message: "removed MyForm compound compatibility members must not be restored",
  },
  {
    pattern: /\bBackwards? compatibility\b/i,
    message: "explicit backward-compatibility shims are not allowed in production source",
  },
  {
    pattern: /modules\/hr\/finance\/fiscal-years|modules\/hr\/appointments|shared\/reporting\/crystal-report-manager|modules\/hr\/basic-data\/geographical-information|modules\/hr\/basic-data\/organizational-structure\/company-geographic-scope|modules\/hr\/basic-data\/organizational-structure\/.*currenc/i,
    message: "imports must use the canonical bounded-context owner; removed legacy ownership paths are forbidden",
  },
];

for (const filePath of sourceFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(sourceRoot, filePath);
  const normalizedRelativePath = relativePath.split(path.sep).join("/");
  const isProductionSource = !/\.(?:test|spec)\.[^.]+$/.test(normalizedRelativePath);
  if (isProductionSource) {
    for (const { pattern, message } of forbiddenCompatibilityPatterns) {
      if (pattern.test(source)) {
        compatibilityViolations.push(`${relativePath}: ${message}`);
      }
    }
  }
  if (/\bas\s+unknown\s+as\b/.test(source)) {
    codeQualityViolations.push(
      `${relativePath}: chained 'as unknown as' casts are forbidden; validate/narrow the boundary or use a typed adapter`,
    );
  }
  if (/\/\/\s*@ts-(?:ignore|nocheck)\b/.test(source)) {
    codeQualityViolations.push(
      `${relativePath}: @ts-ignore/@ts-nocheck are forbidden; model or narrow the actual contract instead`,
    );
  }
  if (hardenedRuntimeBoundaryFiles.has(normalizedRelativePath)) {
    const trustedApiResponseGeneric = /\bapiService\s*\.\s*(?:get|post|put|patch)\s*<\s*(?!unknown\b|void\b)/;
    const trustedJsonCast = /\.json\s*\(\s*\)[^;\n]{0,32}\bas\s+(?!const\b)/;
    if (trustedApiResponseGeneric.test(source)) {
      codeQualityViolations.push(
        `${relativePath}: hardened auth/platform boundaries must receive unknown (or void) and runtime-parse successful API responses`,
      );
    }
    if (trustedJsonCast.test(source)) {
      codeQualityViolations.push(
        `${relativePath}: hardened auth/platform boundaries must not cast response.json(); parse/narrow unknown instead`,
      );
    }
  }
  if (filePath.endsWith(".tsx") && /\b(?:apiService|apiClient)\s*\.(?:get|getBlob|post|postBlob|put|patch|delete|request|logout)\s*\(/.test(source)) {
    directHttpViolations.push(`${relativePath}: presentation components must call an owning service, not apiService/apiClient directly`);
  }
  const isValidationSource = /(?:validation|schema)/i.test(relativePath);
  const transformedUndefinedUnion = /z\.union\s*\(\s*\[[\s\S]*?z\.undefined\s*\(\s*\)[\s\S]*?\]\s*\)\s*\.transform\s*\(/;
  if (isValidationSource && transformedUndefinedUnion.test(source)) {
    formSafetyViolations.push(
      `${relativePath}: use an explicitly optional inner schema from shared/validation/zodFormPrimitives instead of transforming a union with z.undefined()`,
    );
  }

  const manuallyProjectedFormErrors = /Object\.fromEntries\s*\(\s*Object\.entries\s*\([^)]*errors/i;
  if (source.includes("<MyForm") && manuallyProjectedFormErrors.test(source)) {
    formSafetyViolations.push(
      `${relativePath}: use toFormErrorMessages() so nested form errors remain visible`,
    );
  }

  if (
    normalizedRelativePath === "shared/config/queryClient.ts" &&
    /refetchOnMount\s*:\s*false/.test(source)
  ) {
    cacheSafetyViolations.push(
      `${relativePath}: the global query client must refetch stale data on mount; override individual genuinely static queries instead`,
    );
  }

  const isFeaturePage =
    filePath.endsWith("Page.tsx") &&
    (normalizedRelativePath.startsWith("modules/") || normalizedRelativePath.startsWith("platform/"));
  if (isFeaturePage) {
    const staticLocalInteractionImport = /^\s*import\s+(?!type\b)[^;]+?\s+from\s+["'](\.[^"']+)["'];?/gm;
    for (const match of source.matchAll(staticLocalInteractionImport)) {
      const specifier = match[1];
      const importedFileName = specifier.split("/").at(-1) ?? "";
      if (/(?:Form|Dialog)$/.test(importedFileName)) {
        interactionBoundaryViolations.push(
          `${relativePath}: interaction-only '${importedFileName}' must be loaded with next/dynamic and mounted only while active`,
        );
      }
    }

    if (
      /(?:from\s+["']pulltorefreshjs["']|import\s*\(\s*["']pulltorefreshjs["']\s*\))/.test(source) &&
      normalizedRelativePath !== "shell/bootstrap/MainClientBootstrap.tsx"
    ) {
      navigationSafetyViolations.push(
        `${relativePath}: pulltorefreshjs must remain isolated to MainClientBootstrap so mobile refresh policy stays centralized`,
      );
    }

    const usesClientRouterNavigation = /\brouter\.(?:push|replace|refresh)\s*\(/.test(source);
    if (
      usesClientRouterNavigation &&
      !guardedNavigationBypassAllowlist.has(normalizedRelativePath) &&
      !/\brequestDiscard\b/.test(source)
    ) {
      navigationSafetyViolations.push(
        `${relativePath}: protected client navigation must pass through the unsaved-changes guard; ` +
          "add requestDiscard or explicitly document a forced/system redirect in the architecture checker",
      );
    }
  }

  for (const specifier of collectImportSpecifiers(source)) {
    const target = resolveImport(filePath, specifier);
    if (!target) continue;
    graph.get(filePath).push(target);

    const fromLayer = layerOf(filePath);
    const targetLayer = layerOf(target);
    if (
      (fromLayer === "shared" && ["app", "shell", "platform", "modules"].includes(targetLayer)) ||
      (fromLayer === "platform" && ["app", "shell", "modules"].includes(targetLayer)) ||
      (fromLayer === "modules" && ["app", "shell"].includes(targetLayer)) ||
      (fromLayer === "shell" && ["app", "modules"].includes(targetLayer)) ||
      (fromLayer === "lib" && ["app", "shell", "platform", "modules", "shared"].includes(targetLayer)) ||
      (fromLayer === "config" && ["app", "shell", "platform", "modules", "shared", "lib"].includes(targetLayer))
    ) {
      violations.push(`${path.relative(process.cwd(), filePath)} -> ${path.relative(process.cwd(), target)}`);
    }

    const fromOwner = ownerOf(filePath);
    const targetOwner = ownerOf(target);
    if (fromLayer === "app" && targetLayer === "modules" && !isPublicApi(target)) {
      moduleBoundaryViolations.push(
        `${path.relative(process.cwd(), filePath)} -> ${path.relative(process.cwd(), target)} ` +
        "(app composition must import module capabilities through an index.ts public API)",
      );
    }
    if (fromLayer === "app" && targetLayer === "platform" && !isPublicApi(target)) {
      moduleBoundaryViolations.push(
        `${path.relative(process.cwd(), filePath)} -> ${path.relative(process.cwd(), target)} ` +
        "(app composition must import platform capabilities through an index.ts public API)",
      );
    }
    if (
      fromOwner &&
      targetOwner &&
      fromOwner !== targetOwner
    ) {
      if (!allowedOwnerDependencies[fromOwner]?.includes(targetOwner)) {
        moduleBoundaryViolations.push(
          `${path.relative(process.cwd(), filePath)} -> ${path.relative(process.cwd(), target)} ` +
          `(owner '${fromOwner}' may not depend on '${targetOwner}')`,
        );
      }

      if (targetOwner !== "shared" && !isPublicApi(target)) {
        moduleBoundaryViolations.push(
          `${path.relative(process.cwd(), filePath)} -> ${path.relative(process.cwd(), target)} ` +
          `(cross-owner imports must target a deliberate index.ts public API)`,
        );
      }
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

if (
  violations.length ||
  moduleBoundaryViolations.length ||
  appRouteViolations.length ||
  ownershipViolations.length ||
  cycles.size ||
  formSafetyViolations.length ||
  cacheSafetyViolations.length ||
    directHttpViolations.length ||
    compatibilityViolations.length ||
    interactionBoundaryViolations.length ||
    navigationSafetyViolations.length ||
    codeQualityViolations.length
) {
  if (violations.length) {
    console.error("Forbidden architecture dependencies:");
    for (const violation of violations) console.error(`  ${violation}`);
  }
  if (cycles.size) {
    console.error("Circular dependencies:");
    for (const cycle of cycles) console.error(`  ${cycle}`);
  }
  if (ownershipViolations.length) {
    console.error("Feature ownership violations:");
    for (const violation of ownershipViolations) console.error(`  ${violation}`);
  }
  if (moduleBoundaryViolations.length) {
    console.error("Module boundary violations:");
    for (const violation of moduleBoundaryViolations) console.error(`  ${violation}`);
  }
  if (appRouteViolations.length) {
    console.error("App Router ownership violations:");
    for (const violation of appRouteViolations) console.error(`  ${violation}`);
  }
  if (formSafetyViolations.length) {
    console.error("Unsafe form validation patterns:");
    for (const violation of formSafetyViolations) console.error(`  ${violation}`);
  }
  if (cacheSafetyViolations.length) {
    console.error("Unsafe query cache configuration:");
    for (const violation of cacheSafetyViolations) console.error(`  ${violation}`);
  }
  if (directHttpViolations.length) {
    console.error("Direct HTTP calls from TSX:");
    for (const violation of directHttpViolations) console.error(`  ${violation}`);
  }
  if (compatibilityViolations.length) {
    console.error("Forbidden compatibility shims:");
    for (const violation of compatibilityViolations) console.error(`  ${violation}`);
  }
  if (interactionBoundaryViolations.length) {
    console.error("Eager interaction-only feature imports:");
    for (const violation of interactionBoundaryViolations) console.error(`  ${violation}`);
  }
  if (navigationSafetyViolations.length) {
    console.error("Unsafe navigation/runtime patterns:");
    for (const violation of navigationSafetyViolations) console.error(`  ${violation}`);
  }
  if (codeQualityViolations.length) {
    console.error("Unsafe TypeScript escape hatches:");
    for (const violation of codeQualityViolations) console.error(`  ${violation}`);
  }
  process.exit(1);
}

console.log(
  "Architecture checks passed: target ownership, App Router ownership/collisions/thin adapters, public APIs, dependency direction, cycles, form validation safety, query cache consistency, lazy interaction boundaries, navigation/runtime safety, TypeScript escape-hatch protection, and compatibility-shim protection are clean.",
);
