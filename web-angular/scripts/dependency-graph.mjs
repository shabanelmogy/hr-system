import path from 'node:path';
import ts from 'typescript';
import { inspectDependency } from './architecture-rules.mjs';

/** Static value imports/re-exports form eager edges; lazy imports still obey ownership. */
export function inspectProject(sources, compilerOptions = {}, root = process.cwd()) {
  const files = new Map([...sources].map(([file, source]) => [file.replaceAll('\\', '/'), source]));
  const absolute = file => path.resolve(root, file);
  const relative = file => path.relative(root, file).replaceAll('\\', '/');
  const host = {
    ...ts.sys,
    fileExists: file => files.has(relative(file)) || ts.sys.fileExists(file),
    readFile: file => files.get(relative(file)) ?? ts.sys.readFile(file),
  };
  const graph = new Map();
  const violations = [];
  for (const [file, source] of files) {
    if (file.endsWith('.spec.ts')) continue;
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    const edges = new Set();
    function reference(node, specifier, eager) {
      const resolved = ts.resolveModuleName(specifier, absolute(file), compilerOptions, host).resolvedModule;
      if (!resolved) {
        if (specifier.startsWith('.')) violations.push(`${file}: unresolved local import ${specifier}`);
        return;
      }
      const target = relative(resolved.resolvedFileName);
      if (!files.has(target)) return;
      const normalizedSpecifier = path.posix.relative(path.posix.dirname(file), target);
      const local = normalizedSpecifier.startsWith('.') ? normalizedSpecifier : './' + normalizedSpecifier;
      for (const reason of inspectDependency(file, local)) violations.push(`${file}: ${reason} (${specifier})`);
      if (eager) edges.add(target);
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const bindings = node.importClause?.namedBindings ?? node.exportClause;
        const onlyTypes = node.isTypeOnly || node.importClause?.isTypeOnly ||
          (bindings && ts.isNamedImports(bindings) && !node.importClause?.name && bindings.elements.length > 0 && bindings.elements.every(item => item.isTypeOnly)) ||
          (bindings && ts.isNamedExports(bindings) && bindings.elements.length > 0 && bindings.elements.every(item => item.isTypeOnly));
        reference(node, node.moduleSpecifier.text, !onlyTypes);
      }
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(tree) === 'require') && node.arguments[0] && ts.isStringLiteral(node.arguments[0]))
        reference(node, node.arguments[0].text, node.expression.kind !== ts.SyntaxKind.ImportKeyword);
      ts.forEachChild(node, visit);
    }
    visit(tree);
    graph.set(file, edges);
  }
  const indices = new Map(), low = new Map(), active = new Set(), stack = [];
  let index = 0;
  function visit(file) {
    indices.set(file, index); low.set(file, index++); active.add(file); stack.push(file);
    for (const target of graph.get(file) ?? []) {
      if (!indices.has(target)) { visit(target); low.set(file, Math.min(low.get(file), low.get(target))); }
      else if (active.has(target)) low.set(file, Math.min(low.get(file), indices.get(target)));
    }
    if (low.get(file) !== indices.get(file)) return;
    const group = []; let target;
    do { target = stack.pop(); active.delete(target); group.push(target); } while (target !== file);
    if (group.length > 1 || graph.get(file)?.has(file)) violations.push('circular value dependency: ' + group.sort().join(', '));
  }
  for (const file of graph.keys()) if (!indices.has(file)) visit(file);
  return [...new Set(violations)];
}
