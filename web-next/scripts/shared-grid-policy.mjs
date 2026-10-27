import ts from "typescript";

/** Library grids are implementation details of the shared MyDataGrid boundary. */
export function collectSharedGridViolations(source, relativePath) {
  if (relativePath.replaceAll("\\", "/").startsWith("shared/components/data-grid/")) return [];
  const file = ts.createSourceFile(relativePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const violations = [];
  const rawNames = new Set(["DataGrid", "DataGridPro", "DataGridPremium"]);
  const add = () => violations.push(`${relativePath}: use shared MyDataGrid; raw library grids and ClientDataGrid are shared implementation details`);
  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const sourceName = node.moduleSpecifier.text;
      const clause = node.importClause;
      if (!clause || clause.isTypeOnly) return;
      if (/^@mui\/x-data-grid(?:-pro|-premium)?(?:\/|$)/.test(sourceName)) {
        const bindings = clause.namedBindings;
        if (clause.name || (bindings && ts.isNamespaceImport(bindings))) add();
        if (bindings && ts.isNamedImports(bindings) && bindings.elements.some((item) => !item.isTypeOnly && rawNames.has((item.propertyName ?? item.name).text))) add();
      }
      const bindings = clause.namedBindings;
      if (clause.name && /(?:^|\/)ClientDataGrid$/.test(sourceName)) add();
      if (sourceName.includes("components/data-grid") && bindings && ts.isNamedImports(bindings)
        && bindings.elements.some((item) => !item.isTypeOnly && (item.propertyName ?? item.name).text === "ClientDataGrid")) add();
    }
    if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)
      && /^@mui\/x-data-grid(?:-pro|-premium)?(?:\/|$)/.test(node.moduleSpecifier.text)) {
      if (!node.exportClause || (ts.isNamedExports(node.exportClause)
        && node.exportClause.elements.some((item) => !item.isTypeOnly && rawNames.has((item.propertyName ?? item.name).text)))) add();
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword
      || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
      const target = node.arguments[0];
      if (target && ts.isStringLiteralLike(target) && /^@mui\/x-data-grid(?:-pro|-premium)?(?:\/|$)/.test(target.text)) add();
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return [...new Set(violations)];
}
