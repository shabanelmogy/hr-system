import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { permissions } from "./permissions";

const backendPermissionSourcePaths = [
  new URL(
    "../../../../api/Modules/HR/ErpSystem.Modules.HR.Application/Common/Consts/Permissions.cs",
    import.meta.url,
  ),
  new URL(
    "../../../../api/Modules/Platform/ErpSystem.Modules.Platform.Contracts/OfflineOperations/OfflineOperationsContracts.cs",
    import.meta.url,
  ),
];

type ConstantDefinition = {
  qualifiedName: string;
  source: string;
  literal?: string;
  reference?: string;
};

function parseStringConstants(source: string, sourceName: string) {
  const classMatches = [
    ...source.matchAll(
      /\b(?:public\s+)?(?:static\s+)?(?:sealed\s+)?(?:partial\s+)?class\s+(\w+)\b/g,
    ),
  ];
  const definitions: ConstantDefinition[] = [];
  const declarationPattern =
    /public\s+const\s+string\s+(\w+)\s*=\s*(?:"([^"]+)"|((?:\w+\.)+\w+))\s*;/g;

  for (const [index, classMatch] of classMatches.entries()) {
    const className = classMatch[1];
    const classStart = classMatch.index ?? 0;
    const classEnd = classMatches[index + 1]?.index ?? source.length;
    const classBody = source.slice(classStart, classEnd);
    for (const declaration of classBody.matchAll(declarationPattern)) {
      const name = declaration[1];
      const literal = declaration[2];
      const reference = declaration[3];
      definitions.push({
        qualifiedName: `${className}.${name}`,
        source: sourceName,
        ...(literal === undefined ? { reference } : { literal }),
      });
    }
  }

  return definitions;
}

function resolveConstants(definitions: ConstantDefinition[]) {
  const byName = new Map<string, ConstantDefinition>();
  for (const definition of definitions) {
    if (byName.has(definition.qualifiedName)) {
      throw new Error(`Duplicate backend constant declaration: ${definition.qualifiedName}`);
    }
    byName.set(definition.qualifiedName, definition);
  }

  const resolving = new Set<string>();
  const resolve = (qualifiedName: string, referencedBy?: ConstantDefinition): string => {
    const definition = byName.get(qualifiedName);
    if (!definition) {
      const owner = referencedBy
        ? ` referenced by ${referencedBy.qualifiedName} in ${referencedBy.source}`
        : "";
      throw new Error(`Unable to resolve backend constant reference: ${qualifiedName}${owner}`);
    }
    if (definition.literal !== undefined) return definition.literal;
    if (!definition.reference) {
      throw new Error(`Backend constant has no literal or reference: ${qualifiedName}`);
    }
    if (resolving.has(qualifiedName)) {
      throw new Error(`Circular backend constant reference: ${qualifiedName}`);
    }
    resolving.add(qualifiedName);
    try {
      return resolve(definition.reference, definition);
    } finally {
      resolving.delete(qualifiedName);
    }
  };

  return { byName, resolve };
}

describe("permission constants", () => {
  it("stays in exact parity with the backend constants", async () => {
    const sources = await Promise.all(
      backendPermissionSourcePaths.map(async (path) => ({
        path: path.pathname,
        source: await readFile(path, "utf8"),
      })),
    );
    const definitions = sources.flatMap(({ path, source }) =>
      parseStringConstants(source, path),
    );
    const { byName, resolve } = resolveConstants(definitions);
    const permissionDefinitions = [...byName.values()].filter(
      ({ qualifiedName }) => qualifiedName.startsWith("Permissions."),
    );
    const backendPermissions = Object.fromEntries(
      permissionDefinitions.map(({ qualifiedName }) => [
        qualifiedName.slice("Permissions.".length),
        resolve(qualifiedName),
      ]),
    );

    expect(backendPermissions).not.toEqual({});
    expect(permissions).toEqual(backendPermissions);
  });
});
