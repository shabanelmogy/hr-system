import type { AppRoute } from '@/src/core/constants/routes';
import type { ErpModule } from '../domain/models/module';

export interface MobileSubmoduleDefinition {
  code: string;
  entryCandidates: readonly AppRoute[];
  routePrefixes: readonly string[];
}

export interface MobileModuleDefinition {
  code: string;
  requiredDependencies: readonly string[];
  optionalDependencies: readonly string[];
  submodules: readonly MobileSubmoduleDefinition[];
}

const definitions = new Map<string, MobileModuleDefinition>();

const normalize = (value: string) => value.trim().toLowerCase();
const normalizeRoute = (value: string) => `/${value.trim().replace(/^\/+|\/+$/g, '')}`;

export function registerMobileModule(definition: MobileModuleDefinition): void {
  const code = normalize(definition.code);
  if (!code) throw new Error('Mobile module code is required.');
  const existing = definitions.get(code);
  if (existing && existing !== definition) {
    throw new Error(`Mobile module '${definition.code}' is already registered.`);
  }
  definitions.set(code, definition);
}

export function getMobileModuleDefinition(code: string): MobileModuleDefinition | undefined {
  return definitions.get(normalize(code));
}

export function getMobileModuleDefinitions(): readonly MobileModuleDefinition[] {
  return [...definitions.values()].sort((left, right) =>
    normalize(left.code).localeCompare(normalize(right.code)),
  );
}

export function getMobileSubmoduleDefinition(
  moduleCode: string,
  submoduleCode: string,
): MobileSubmoduleDefinition | undefined {
  return getMobileModuleDefinition(moduleCode)?.submodules.find(
    (submodule) => normalize(submodule.code) === normalize(submoduleCode),
  );
}

/**
 * The API is authoritative for installed/enabled modules and permissions.
 * The mobile registry only declares what this build safely knows how to present.
 */
export function intersectModulesWithMobileRegistry(serverModules: readonly ErpModule[]): ErpModule[] {
  return serverModules.flatMap((serverModule) => {
    const mobileDefinition = getMobileModuleDefinition(serverModule.code);
    if (!mobileDefinition) return [];
    const supportedSubmodules = new Set(
      mobileDefinition.submodules.map((submodule) => normalize(submodule.code)),
    );
    return [{
      ...serverModule,
      submodules: serverModule.submodules.filter((submodule) =>
        supportedSubmodules.has(normalize(submodule.code)),
      ),
    }];
  });
}

export function findMobileRouteOwner(pathname: string): {
  moduleCode: string;
  submoduleCode: string;
} | null {
  const normalizedPath = normalizeRoute(pathname);
  const matches = getMobileModuleDefinitions().flatMap((moduleDefinition) =>
    moduleDefinition.submodules.flatMap((submodule) =>
      submodule.routePrefixes
        .map(normalizeRoute)
        .filter((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))
        .map((prefix) => ({
          moduleCode: moduleDefinition.code,
          submoduleCode: submodule.code,
          prefix,
        })),
    ),
  ).sort((left, right) => right.prefix.length - left.prefix.length);

  const owner = matches[0];
  return owner ? { moduleCode: owner.moduleCode, submoduleCode: owner.submoduleCode } : null;
}

export function validateMobileModuleRegistry(): void {
  const routeOwners = new Map<string, string>();
  const registered = new Set(definitions.keys());
  const missingDependencies: string[] = [];

  for (const moduleDefinition of definitions.values()) {
    const submoduleCodes = new Set<string>();
    for (const submodule of moduleDefinition.submodules) {
      const submoduleCode = normalize(submodule.code);
      if (!submoduleCode) throw new Error(`Module '${moduleDefinition.code}' has an empty submodule code.`);
      if (submoduleCodes.has(submoduleCode)) {
        throw new Error(`Duplicate mobile submodule: ${moduleDefinition.code}/${submodule.code}`);
      }
      submoduleCodes.add(submoduleCode);

      if (submodule.entryCandidates.length === 0 || submodule.routePrefixes.length === 0) {
        throw new Error(
          `Mobile submodule '${moduleDefinition.code}/${submodule.code}' must declare at least one entry candidate and route prefix.`,
        );
      }

      for (const routePrefix of submodule.routePrefixes) {
        const prefix = normalizeRoute(routePrefix);
        const owner = `${normalize(moduleDefinition.code)}/${submoduleCode}`;
        const previousOwner = routeOwners.get(prefix);
        if (previousOwner && previousOwner !== owner) {
          throw new Error(`Ambiguous mobile module route ${prefix}: ${previousOwner}, ${owner}`);
        }
        routeOwners.set(prefix, owner);
      }
    }

    for (const dependency of moduleDefinition.requiredDependencies) {
      if (!registered.has(normalize(dependency))) {
        missingDependencies.push(`${moduleDefinition.code} -> ${dependency}`);
      }
    }
  }

  if (missingDependencies.length > 0) {
    throw new Error(`Missing mobile module dependencies: ${missingDependencies.join(', ')}`);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (code: string, stack: string[]): void => {
    if (visiting.has(code)) {
      const start = stack.indexOf(code);
      throw new Error(`Mobile module dependency cycle: ${[...stack.slice(start), code].join(' -> ')}`);
    }
    if (visited.has(code)) return;
    visiting.add(code);
    const moduleDefinition = definitions.get(code);
    for (const dependency of moduleDefinition?.requiredDependencies ?? []) {
      visit(normalize(dependency), [...stack, code]);
    }
    visiting.delete(code);
    visited.add(code);
  };
  for (const code of definitions.keys()) visit(code, []);
}

export function resetMobileModuleRegistryForTests(): void {
  definitions.clear();
}
