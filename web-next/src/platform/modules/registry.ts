import type { NavigationConfig } from "@/shared/components/layout/navigation";
import type { ReactNode } from "react";
import type { LauncherTone } from "@/shared/components/layout/module-launcher";
import type { ErpModule } from "./types";

export interface FrontendNavigationEntry {
  titleKey: string;
  path: string;
  requiredPermissions?: readonly string[];
  requiredRoles?: readonly string[];
}

export interface FrontendNavigationSection {
  id: string;
  titleKey: string;
  entries: readonly FrontendNavigationEntry[];
}

export interface FrontendSubmoduleDefinition {
  code: string;
  name: string;
  icon?: ReactNode;
  tone?: LauncherTone;
  requiredPermissions: readonly string[];
  entryCandidates: readonly string[];
  navigation: readonly FrontendNavigationSection[];
  routePrefixes: readonly string[];
}

export interface FrontendModuleDefinition {
  navigation?: NavigationConfig;
  code: string;
  name: string;
  icon?: ReactNode;
  tone?: LauncherTone;
  accentColor?: string;
  requiredDependencies: readonly string[];
  optionalDependencies: readonly string[];
  translationNamespace?: string;
  loadTranslations?: (
    language: "en" | "ar",
  ) => Promise<Record<string, unknown>>;
  submodules: readonly FrontendSubmoduleDefinition[];
}

const definitions = new Map<string, FrontendModuleDefinition>();

const normalize = (value: string) => value.trim().toLowerCase();

export function registerFrontendModule(definition: FrontendModuleDefinition) {
  const code = normalize(definition.code);
  if (!code) throw new Error("Frontend module code is required.");
  const existing = definitions.get(code);
  if (existing && existing !== definition) {
    throw new Error(`Frontend module '${definition.code}' is already registered.`);
  }
  definitions.set(code, definition);
}

export function getFrontendModuleDefinition(code: string) {
  return definitions.get(normalize(code));
}

export function getFrontendModuleDefinitions() {
  return [...definitions.values()].sort((left, right) =>
    normalize(left.code).localeCompare(normalize(right.code)),
  );
}

/**
 * The server remains authoritative for purchased/enabled modules and user
 * permissions. The frontend registry only declares which of those capabilities
 * this build knows how to present.
 */
export function intersectAccessibleModulesWithFrontendRegistry(
  serverModules: readonly ErpModule[],
): ErpModule[] {
  return serverModules.flatMap((serverModule) => {
    const frontend = getFrontendModuleDefinition(serverModule.code);
    if (!frontend) return [];
    const knownSubmodules = new Set(
      frontend.submodules.map((submodule) => normalize(submodule.code)),
    );
    return [{
      ...serverModule,
      submodules: serverModule.submodules.filter((submodule) =>
        knownSubmodules.has(normalize(submodule.code)),
      ),
    }];
  });
}

export function getFrontendSubmoduleDefinition(moduleCode: string, submoduleCode: string) {
  return getFrontendModuleDefinition(moduleCode)?.submodules.find(
    (submodule) => normalize(submodule.code) === normalize(submoduleCode),
  );
}

export function validateFrontendModuleRegistry() {
  const routeOwners = new Map<string, string>();
  for (const definition of definitions.values()) {
    const submoduleCodes = new Set<string>();
    for (const submodule of definition.submodules) {
      const code = normalize(submodule.code);
      if (submoduleCodes.has(code)) throw new Error(`Duplicate submodule: ${definition.code}/${code}`);
      submoduleCodes.add(code);
      for (const prefix of submodule.routePrefixes) {
        const route = `/${prefix.trim().replace(/^\/+|\/+$/g, "")}`;
        const owner = `${definition.code}/${submodule.code}`;
        const previous = routeOwners.get(route);
        if (previous && previous !== owner) throw new Error(`Ambiguous module route ${route}: ${previous}, ${owner}`);
        routeOwners.set(route, owner);
      }
    }
  }
  const registered = new Set(definitions.keys());
  const missing: string[] = [];
  for (const definition of definitions.values()) {
    for (const dependency of definition.requiredDependencies) {
      if (!registered.has(normalize(dependency))) {
        missing.push(`${definition.code} -> ${dependency}`);
      }
    }
  }
  if (missing.length) {
    throw new Error(`Missing frontend module dependencies: ${missing.join(", ")}`);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (code: string, stack: string[]) => {
    if (visiting.has(code)) {
      const start = stack.indexOf(code);
      throw new Error(`Frontend module dependency cycle: ${[...stack.slice(start), code].join(" -> ")}`);
    }
    if (visited.has(code)) return;
    visiting.add(code);
    const definition = definitions.get(code);
    for (const dependency of definition?.requiredDependencies ?? []) {
      visit(normalize(dependency), [...stack, code]);
    }
    visiting.delete(code);
    visited.add(code);
  };
  for (const code of definitions.keys()) visit(code, []);
}

/** Test-only reset; production composition registers modules once at startup. */
export function resetFrontendModuleRegistryForTests() {
  definitions.clear();
}
