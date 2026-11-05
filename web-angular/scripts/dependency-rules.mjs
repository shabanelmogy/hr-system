import path from 'node:path';
import { inspectDependency as inspectOwnerDependency } from './architecture-rules.mjs';
import ts from 'typescript';

export function sourceImports(source, file = 'source.ts') {
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const imports = [];
  const add = (node, kind) => {
    if (node && ts.isStringLiteralLike(node)) imports.push({ name: node.text, kind });
  };
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const onlyTypes =
        clause?.isTypeOnly ||
        (!clause?.name &&
          bindings &&
          ts.isNamedImports(bindings) &&
          bindings.elements.length > 0 &&
          bindings.elements.every((item) => item.isTypeOnly));
      add(node.moduleSpecifier, onlyTypes ? 'type' : 'static');
    }
    if (ts.isExportDeclaration(node)) {
      const bindings = node.exportClause;
      const onlyTypes =
        node.isTypeOnly ||
        (bindings &&
          ts.isNamedExports(bindings) &&
          bindings.elements.length > 0 &&
          bindings.elements.every((item) => item.isTypeOnly));
      add(node.moduleSpecifier, onlyTypes ? 'type' : 'static');
    }
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
      add(node.argument.literal, 'type');
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword)
      add(node.arguments[0], 'dynamic');
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return imports;
}

function owner(file) {
  const parts = file.split('/');
  if (parts[2] === 'platform') return parts.slice(0, 4).join('/');
  if (parts[2] === 'modules') {
    const boundary = parts.findIndex(
      (part, index) =>
        index >= 4 &&
        ['pages', 'components', 'services', 'state', 'types', 'validation', 'utils'].includes(part),
    );
    return parts.slice(0, boundary < 0 ? -1 : boundary).join('/');
  }
  return null;
}

export function inspectDependency(source, target) {
  const result = [];
  if (source.endsWith('.spec.ts') || source.startsWith('src/app/dev/')) return result;
  const publicEntry = /(?:^|\/)(?:public-api|[^/]+[.-]public-api)\.ts$/.test(target);
  const sourceOwner = owner(source),
    targetOwner = owner(target);
  const composition =
    source === 'src/app/app.routes.ts' ||
    source === 'src/app/app.routes.production.ts' ||
    source.startsWith('src/app/composition/');
  const ownerFacade =
    /(?:^|\/)(?:public-api|[^/]+[.-]public-api)\.ts$/.test(source) &&
    target.startsWith(source.slice(0, source.lastIndexOf('/') + 1));
  if (sourceOwner && targetOwner && sourceOwner !== targetOwner && !publicEntry && !ownerFacade)
    result.push('cross-owner internals import; use the target public API');
  if (source.startsWith('src/app/shared/') && target.startsWith('src/app/modules/'))
    result.push('shared code cannot depend on business features');
  if (
    source.startsWith('src/app/shared/') &&
    target.startsWith('src/app/platform/') &&
    !(
      target === 'src/app/platform/localization/public-api.ts' &&
      source.startsWith('src/app/shared/ui/')
    )
  )
    result.push(
      'shared dependency on Platform is restricted to the reviewed UI localization adapter',
    );
  if (source.startsWith('src/app/shell/') && target.startsWith('src/app/modules/') && !composition)
    result.push('business composition belongs in the application composition owner');
  return result;
}

export function staticDependencyCycles(edges) {
  const graph = new Map();
  for (const { source, target, kind } of edges) {
    if (kind !== 'static') continue;
    const targets = graph.get(source) ?? new Set();
    targets.add(target);
    graph.set(source, targets);
  }
  let sequence = 0;
  const indices = new Map(),
    low = new Map(),
    stack = [],
    active = new Set(),
    cycles = [];
  function visit(node) {
    indices.set(node, sequence);
    low.set(node, sequence++);
    stack.push(node);
    active.add(node);
    for (const target of graph.get(node) ?? []) {
      if (!indices.has(target)) {
        visit(target);
        low.set(node, Math.min(low.get(node), low.get(target)));
      } else if (active.has(target)) low.set(node, Math.min(low.get(node), indices.get(target)));
    }
    if (low.get(node) === indices.get(node)) {
      const group = [];
      let member;
      do {
        member = stack.pop();
        active.delete(member);
        group.push(member);
      } while (member !== node);
      if (group.length > 1 || graph.get(node)?.has(node)) cycles.push(group.sort());
    }
  }
  for (const node of graph.keys()) if (!indices.has(node)) visit(node);
  return cycles;
}

export function inspectProject(sources, compilerOptions = {}, root = process.cwd()) {
  const files = new Map([...sources].map(([file, source]) => [file.replaceAll('\\', '/'), source]));
  const relative = (file) => path.relative(root, file).replaceAll('\\', '/');
  const host = {
    ...ts.sys,
    fileExists: (file) => files.has(relative(file)) || ts.sys.fileExists(file),
    readFile: (file) => files.get(relative(file)) ?? ts.sys.readFile(file),
  };
  const violations = [],
    edges = [];
  for (const [file, source] of files) {
    if (file.endsWith('.spec.ts') || file.includes('.generated.')) continue;
    for (const item of sourceImports(source, file)) {
      const resolved = ts.resolveModuleName(
        item.name,
        path.resolve(root, file),
        compilerOptions,
        host,
      ).resolvedModule;
      if (!resolved) {
        if (item.name.startsWith('.'))
          violations.push(file + ': unresolved local import ' + item.name);
        continue;
      }
      const target = relative(resolved.resolvedFileName);
      if (!files.has(target)) continue;
      edges.push({ source: file, target, kind: item.kind });
      const local = path.posix.relative(path.posix.dirname(file), target);
      const specifier = local.startsWith('.') ? local : './' + local;
      const findings = [
        ...inspectDependency(file, target),
        ...inspectOwnerDependency(file, specifier),
      ];
      violations.push(...findings.map((reason) => file + ' -> ' + target + ': ' + reason));
    }
  }
  for (const cycle of staticDependencyCycles(edges))
    violations.push('circular value dependency: ' + cycle.join(' -> '));
  return [...new Set(violations)];
}
