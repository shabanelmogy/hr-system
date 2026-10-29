import ts from 'typescript';

export function inspectTemplate(template) {
  const violations=[];
  if (/<select\b|<input\b[^>]*\btype=["'](?:radio|checkbox|date|time|number)["']/.test(template)) violations.push('native widget bypass; use a shared PrimeNG control');
  if (/<button\b(?![^>]*\bpButton\b)/.test(template)) violations.push('native button bypass; use shared action or PrimeNG directive');
  return violations;
}

export function inspectSource(relative, source) {
  if (relative.endsWith('license.generated.ts')) return [];
  const tree = ts.createSourceFile(relative, source, ts.ScriptTarget.Latest, true);
  const violations = new Set();
  const test = relative.endsWith('.spec.ts');
  const shared = relative.startsWith('src/app/shared/ui/');
  const theme = relative.startsWith('src/theme/');
  function checkModule(name) {
    if (!test && relative.startsWith('src/app/shell/') && /^(?:\.\.\/)+modules\//.test(name)) violations.add('business module composition belongs in the app root, not Shell');
    if (/(?:web-next|mobile-react|react-i18next|next\/)/.test(name)) violations.add('cross-app runtime dependency');
    if (name.startsWith('primeng/') && !name.startsWith('primeng/types/') && !test && !shared && !(theme && name === 'primeng/config')) violations.add('shared PrimeNG control bypass');
    if (!test && !shared && /shared\/ui\//.test(name) && !/shared\/ui\/public-api$/.test(name)) violations.add('shared internals import; use the public API');
  }
  function visit(node) {
    if (!test && (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node))) {
      for(const violation of inspectTemplate(node.text)) violations.add(violation);
    }
    if (!test && !relative.startsWith('src/app/composition/') && ts.isPropertyAssignment(node) && node.name.getText(tree) === 'providers' && /\bModuleCatalogState\b/.test(node.initializer.getText(tree))) violations.add('module catalog provider belongs in authenticated composition');
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) checkModule(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(tree) === 'require') && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) checkModule(node.arguments[0].text);
    if (!test && node.kind === ts.SyntaxKind.AnyKeyword) violations.add('untyped any');
    if (!test && ts.isIdentifier(node) && ['localStorage', 'sessionStorage'].includes(node.text)) violations.add('undeclared browser storage');
    if (!test && !shared && (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node)) && /(?:\bpButton(?:Label|Icon)?\b|<p-(?:button|table|select|dialog)\b)/.test(node.text)) violations.add('shared template control bypass');
    if (!test && !shared && (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node)) && /<(?:form|input|select|textarea)\b|\bpInputText\b/.test(node.text)) violations.add('shared form/field bypass');
    ts.forEachChild(node, visit);
  }
  visit(tree);
  if (!test && /inject\(HttpClient\)/.test(source) && !relative.endsWith('-service.ts')) violations.add('HTTP belongs in a data service');
  return [...violations];
}
