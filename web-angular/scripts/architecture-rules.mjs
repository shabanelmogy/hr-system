import ts from 'typescript';

export function inspectTemplate(template, relative = 'src/app/shared/ui/template.html') {
  // Test hosts deliberately exercise native inputs and projected fixture content.
  if (/\.spec(?:\.[^/]+)?\.html$/.test(relative)) return [];
  const violations = [];
  if (/\[erpCollection(?:Cell|ColumnHeader|ColumnFooter)\]=["'][^"']*columns\(\)\[/.test(template))
    violations.push(
      'collection templates bind by stable column key; use the shared collectionColumn pipe',
    );
  if (/<select\b|<input\b[^>]*\btype=["'](?:radio|checkbox|date|time|number)["']/.test(template))
    violations.push('native widget bypass; use a shared PrimeNG control');
  if (/<button\b(?![^>]*\bpButton\b)/.test(template))
    violations.push('native button bypass; use shared action or PrimeNG directive');
  if (
    !relative.startsWith('src/app/shared/ui/') &&
    /<p-(?:table|paginator|checkbox|select|dialog|button)\b|<table\b|\bpButton(?:Label|Icon)?\b/.test(
      template,
    )
  )
    violations.push('shared collection/control bypass');
  if (
    !relative.startsWith('src/app/shared/ui/') &&
    /<(?:form|input|select|textarea)\b|\bpInputText\b/.test(template)
  )
    violations.push('shared form/field bypass');
  return violations;
}

export function inspectSource(relative, source) {
  if (relative.endsWith('license.generated.ts')) return [];
  const tree = ts.createSourceFile(relative, source, ts.ScriptTarget.Latest, true);
  const violations = new Set();
  const test = relative.endsWith('.spec.ts');
  const shared = relative.startsWith('src/app/shared/ui/');
  const theme = relative.startsWith('src/theme/');
  const transportOwner =
    relative.endsWith('-service.ts') || relative.startsWith('src/app/shared/transport/');
  const componentNames = new Set();
  const coreNamespaces = new Set();
  let applicationComponents = 0;
  for (const statement of tree.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text !== '@angular/core'
    )
      continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamespaceImport(bindings)) coreNamespaces.add(bindings.name.text);
    if (bindings && ts.isNamedImports(bindings)) {
      for (const binding of bindings.elements) {
        if ((binding.propertyName ?? binding.name).text === 'Component')
          componentNames.add(binding.name.text);
      }
    }
  }
  function checkModule(name) {
    if (!test && relative.startsWith('src/app/shell/') && /^(?:\.\.\/)+modules\//.test(name))
      violations.add('business module composition belongs in the app root, not Shell');
    if (/(?:web-next|mobile-react|react-i18next|next\/)/.test(name))
      violations.add('cross-app runtime dependency');
    if (name.startsWith('chart.js') && !test && !shared)
      violations.add('shared chart engine bypass');
    if (
      name.startsWith('primeng/') &&
      !name.startsWith('primeng/types/') &&
      !test &&
      !shared &&
      !(theme && name === 'primeng/config')
    )
      violations.add('shared PrimeNG control bypass');
    if (
      !test &&
      !shared &&
      /shared\/ui\//.test(name) &&
      !/shared\/ui\/(?:public-api|charts\/public-api|feedback\/notifications\.public-api)$/.test(
        name,
      )
    )
      violations.add('shared internals import; use the public API');
  }
  function visit(node) {
    if (!test && !transportOwner && ts.isCallExpression(node)) {
      const call = node.expression;
      if (
        (ts.isIdentifier(call) && call.text === 'fetch') ||
        (ts.isPropertyAccessExpression(call) &&
          call.name.text === 'fetch' &&
          ts.isIdentifier(call.expression) &&
          ['window', 'globalThis'].includes(call.expression.text))
      )
        violations.add('HTTP belongs in a data service');
    }
    if (ts.isDecorator(node) && ts.isCallExpression(node.expression)) {
      const call = node.expression;
      const name = call.expression;
      const isComponent =
        (ts.isIdentifier(name) && componentNames.has(name.text)) ||
        (ts.isPropertyAccessExpression(name) &&
          ts.isIdentifier(name.expression) &&
          coreNamespaces.has(name.expression.text) &&
          name.name.text === 'Component');
      const metadata = call.arguments[0];
      if (isComponent && !test) {
        applicationComponents++;
        const parts = relative.split('/');
        const fileName = parts.at(-1)?.replace(/\.ts$/, '');
        if (parts.at(-2) !== fileName)
          violations.add(
            'component folder required; colocate component resources in a matching folder',
          );
      }
      if (isComponent && metadata && ts.isObjectLiteralExpression(metadata)) {
        for (const property of metadata.properties) {
          if (!ts.isPropertyAssignment(property)) continue;
          const key = property.name;
          const propertyName = ts.isIdentifier(key) || ts.isStringLiteral(key) ? key.text : null;
          if (propertyName === 'template')
            violations.add('inline component template; use a colocated HTML templateUrl');
          if (propertyName === 'styles')
            violations.add('inline component styles; use colocated SCSS styleUrl/styleUrls');
        }
      }
    }
    if (!test && (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node))) {
      for (const violation of inspectTemplate(node.text)) violations.add(violation);
    }
    if (
      !test &&
      !relative.startsWith('src/app/composition/') &&
      ts.isPropertyAssignment(node) &&
      node.name.getText(tree) === 'providers' &&
      /\bModuleCatalogState\b/.test(node.initializer.getText(tree))
    )
      violations.add('module catalog provider belongs in authenticated composition');
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      checkModule(node.moduleSpecifier.text);
    if (
      !test &&
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier.text === '@angular/common/http'
    ) {
      const bindings = node.importClause?.namedBindings;
      if (
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.some((item) => (item.propertyName ?? item.name).text === 'HttpClient') &&
        !relative.endsWith('-service.ts') &&
        !relative.startsWith('src/app/shared/transport/')
      )
        violations.add('HTTP belongs in a data service');
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        node.expression.getText(tree) === 'require') &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      checkModule(node.arguments[0].text);
    if (!test && node.kind === ts.SyntaxKind.AnyKeyword) violations.add('untyped any');
    if (!test && ts.isIdentifier(node) && ['localStorage', 'sessionStorage'].includes(node.text))
      violations.add('undeclared browser storage');
    if (
      !test &&
      !shared &&
      (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node)) &&
      /(?:\bpButton(?:Label|Icon)?\b|<p-(?:button|table|paginator|checkbox|select|dialog)\b|<table\b)/.test(
        node.text,
      )
    )
      violations.add('shared template control bypass');
    if (
      !test &&
      !shared &&
      (ts.isNoSubstitutionTemplateLiteral(node) || ts.isStringLiteral(node)) &&
      /<(?:form|input|select|textarea)\b|\bpInputText\b/.test(node.text)
    )
      violations.add('shared form/field bypass');
    ts.forEachChild(node, visit);
  }
  visit(tree);
  if (applicationComponents > 1)
    violations.add(
      'one application component per file; give each component its own matching folder',
    );
  if (!test && /inject\(HttpClient\)/.test(source) && !relative.endsWith('-service.ts'))
    violations.add('HTTP belongs in a data service');
  return [...violations];
}
