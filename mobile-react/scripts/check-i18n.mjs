import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';

const projectRoot = process.cwd();
const sourceRoots = ['app', 'src'];
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const visibleAttributes = new Set([
  'accessibilityHint', 'accessibilityLabel', 'alt', 'cancelLabel', 'description',
  'emptyLabel', 'emptyMessage', 'errorMessage', 'helperText', 'hint', 'label',
  'message', 'placeholder', 'subtitle', 'text', 'title', 'tooltip', 'value',
]);
const visibleCollectionAttributes = new Set(['actions', 'options', 'tabs', 'views']);
const visibleObjectProperties = new Set([
  'accessibilityHint', 'accessibilityLabel', 'description', 'hint', 'label', 'message',
  'placeholder', 'subtitle', 'text', 'title', 'tooltip',
]);
const technicalLiteralAllowlist = new Map([
  // Language controls intentionally use the language's conventional abbreviation.
  ['src/shell/onboarding/presentation/components/LanguageSelector.tsx', new Set(['EN', 'ع'])],
  // Currency codes and date-format masks are data-format identifiers, not prose.
  ['src/modules/hr/recruitment/presentation/components/JobOfferFormModal.tsx', new Set(['EGP'])],
]);
const translationModules = new Map();
const violations = [];

runSelfTests();
const catalogs = await loadCatalogs();
checkLocaleParity(catalogs.en, catalogs.ar);

for (const sourceRoot of sourceRoots) {
  for (const file of await walk(path.join(projectRoot, sourceRoot))) {
    const relativeFile = normalize(path.relative(projectRoot, file));
    if (isExcludedSource(relativeFile)) continue;
    const source = await readFile(file, 'utf8');
    inspectSource(source, relativeFile, catalogs);
  }
}

const uniqueViolations = [...new Set(violations)];
if (uniqueViolations.length > 0) {
  console.error('Mobile localization check failed:\n');
  for (const violation of uniqueViolations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log('Mobile localization and EN/AR catalog checks passed.');
}

async function walk(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolutePath));
    else if (sourceExtensions.has(path.extname(entry.name))) files.push(absolutePath);
  }
  return files;
}

function isExcludedSource(file) {
  return file.includes('/__tests__/') || /\.(test|spec)\.[jt]sx?$/.test(file) ||
    file.startsWith('src/core/localization/translations/');
}

function inspectSource(source, fileName, catalogs) {
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, scriptKind(fileName));

  const inspectLiteral = (node, context) => {
    if (!isAlphabeticText(node.text) || isTechnicalLiteralAllowed(fileName, node.text)) return;
    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
    violations.push(`${fileName}:${line}: hardcoded visible ${context}: ${JSON.stringify(node.text)}`);
  };

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const text = node.text.trim();
      if (isAlphabeticText(text) && !isTechnicalLiteralAllowed(fileName, text)) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
        violations.push(`${fileName}:${line}: hardcoded JSX text: ${JSON.stringify(text)}`);
      }
    }

    if (ts.isJsxAttribute(node) && node.initializer && visibleAttributes.has(node.name.getText(sourceFile))) {
      if (ts.isStringLiteralLike(node.initializer)) inspectLiteral(node.initializer, 'JSX attribute');
      else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        visitVisibleExpression(node.initializer.expression, inspectLiteral, sourceFile);
      }
    }

    if (ts.isJsxAttribute(node) && node.initializer && visibleCollectionAttributes.has(node.name.getText(sourceFile))) {
      if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        visitVisibleCollection(node.initializer.expression, inspectLiteral, sourceFile);
      }
    }

    if (ts.isCallExpression(node) && isTranslationCall(node)) {
      const first = node.arguments[0];
      if (first && ts.isStringLiteralLike(first)) {
        for (const locale of ['en', 'ar']) {
          if (!hasTranslationKey(catalogs[locale], first.text)) {
            const line = sourceFile.getLineAndCharacterOfPosition(first.getStart(sourceFile)).line + 1;
            violations.push(`${fileName}:${line}: missing ${locale.toUpperCase()} translation key ${JSON.stringify(first.text)}`);
          }
        }
      }

      const fallback = node.arguments[1];
      if (fallback && ts.isStringLiteralLike(fallback)) inspectLiteral(fallback, 'translation fallback');
      if (fallback && ts.isObjectLiteralExpression(fallback)) {
        for (const property of fallback.properties) {
          if (
            ts.isPropertyAssignment(property) && property.name.getText(sourceFile).replaceAll(/["']/g, '') === 'defaultValue' &&
            ts.isStringLiteralLike(property.initializer)
          ) inspectLiteral(property.initializer, 'translation fallback');
        }
      }
    }

    if (
      ts.isJsxExpression(node) && node.expression &&
      (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
    ) {
      visitVisibleExpression(node.expression, inspectLiteral, sourceFile);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
}

function visitVisibleExpression(expression, inspectLiteral, sourceFile) {
  const visitValue = (node) => {
    if (ts.isCallExpression(node) && isTranslationCall(node)) return;
    if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      inspectLiteral(node, 'JSX expression');
      return;
    }
    if (ts.isConditionalExpression(node)) {
      visitValue(node.whenTrue);
      visitValue(node.whenFalse);
      return;
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      visitValue(node.left);
      visitValue(node.right);
      return;
    }
    if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.BarBarToken || node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
    ) {
      const leftHasTranslation = containsTranslationCall(node.left);
      const rightHasTranslation = containsTranslationCall(node.right);
      if (leftHasTranslation && !rightHasTranslation) visitValue(node.right);
      else if (rightHasTranslation && !leftHasTranslation) visitValue(node.left);
      else if (leftHasTranslation || rightHasTranslation) {
        visitValue(node.left);
        visitValue(node.right);
      }
      return;
    }
    if (ts.isTemplateExpression(node)) {
      if (isAlphabeticText(node.head.text)) {
        inspectLiteral({ text: node.head.text, getStart: () => node.getStart(sourceFile) }, 'JSX template');
      }
      for (const span of node.templateSpans) {
        if (isAlphabeticText(span.literal.text)) {
          inspectLiteral({ text: span.literal.text, getStart: () => span.literal.getStart(sourceFile) }, 'JSX template');
        }
      }
    }
  };
  visitValue(expression);
}

function visitVisibleCollection(expression, inspectLiteral, sourceFile) {
  if (ts.isArrayLiteralExpression(expression)) {
    for (const element of expression.elements) {
      if (ts.isObjectLiteralExpression(element)) visitVisibleCollection(element, inspectLiteral, sourceFile);
    }
    return;
  }
  if (!ts.isObjectLiteralExpression(expression)) return;
  for (const property of expression.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = propertyName(property.name);
    if (name && visibleObjectProperties.has(name)) {
      visitVisibleExpression(property.initializer, inspectLiteral, sourceFile);
    }
  }
}

function isTranslationCall(node) {
  const expression = node.expression;
  return (ts.isIdentifier(expression) && expression.text === 't') ||
    (ts.isPropertyAccessExpression(expression) && expression.name.text === 't');
}

function containsTranslationCall(node) {
  if (ts.isCallExpression(node) && isTranslationCall(node)) return true;
  let found = false;
  ts.forEachChild(node, (child) => {
    if (!found && containsTranslationCall(child)) found = true;
  });
  return found;
}

function isTechnicalLiteralAllowed(fileName, value) {
  return technicalLiteralAllowlist.get(fileName)?.has(value) ?? false;
}

function isAlphabeticText(value) {
  return /\p{L}/u.test(value);
}

function scriptKind(fileName) {
  return fileName.endsWith('.tsx') || fileName.endsWith('.jsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

async function loadCatalogs() {
  const directory = path.join(projectRoot, 'src/core/localization/translations');
  const files = await readdir(directory);
  for (const file of files.filter((name) => /^(en|ar)(?:-[\w-]+)?\.ts$/.test(name))) {
    const source = await readFile(path.join(directory, file), 'utf8');
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    for (const statement of sourceFile.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer) {
          translationModules.set(declaration.name.text, unwrapExpression(declaration.initializer));
        }
      }
    }
  }

  return {
    en: flattenCatalog('en'),
    ar: flattenCatalog('ar'),
  };
}

function flattenCatalog(locale) {
  const root = translationModules.get(locale);
  assert(root && ts.isObjectLiteralExpression(root), `${locale} catalog must be a static object literal`);
  const keys = new Set();
  flattenObject(root, '', keys, new Set());
  return keys;
}

function flattenObject(object, prefix, keys, resolving) {
  for (const property of object.properties) {
    if (ts.isSpreadAssignment(property)) {
      const expression = unwrapExpression(property.expression);
      if (ts.isIdentifier(expression)) {
        assert(!resolving.has(expression.text), `cyclic translation spread ${expression.text}`);
        const spread = translationModules.get(expression.text);
        assert(spread && ts.isObjectLiteralExpression(spread), `unknown translation spread ${expression.text}`);
        const next = new Set(resolving);
        next.add(expression.text);
        flattenObject(spread, prefix, keys, next);
      }
      continue;
    }
    if (!ts.isPropertyAssignment(property)) continue;
    const name = propertyName(property.name);
    if (!name) continue;
    const key = prefix ? `${prefix}.${name}` : name;
    const value = unwrapExpression(property.initializer);
    if (ts.isObjectLiteralExpression(value)) flattenObject(value, key, keys, resolving);
    else keys.add(key);
  }
}

function checkLocaleParity(en, ar) {
  const pluralSuffix = /_(zero|one|two|few|many|other)$/;
  const enGroups = new Set([...en].map((key) => key.replace(pluralSuffix, '')));
  const arGroups = new Set([...ar].map((key) => key.replace(pluralSuffix, '')));
  for (const key of enGroups) if (!arGroups.has(key)) violations.push(`ar catalog is missing ${JSON.stringify(key)}`);
  for (const key of arGroups) if (!enGroups.has(key)) violations.push(`en catalog is missing ${JSON.stringify(key)}`);
}

function hasTranslationKey(catalog, key) {
  return catalog.has(key) || ['zero', 'one', 'two', 'few', 'many', 'other'].some((suffix) => catalog.has(`${key}_${suffix}`));
}

function propertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function unwrapExpression(expression) {
  while (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isTypeAssertionExpression(expression)
  ) expression = expression.expression;
  return expression;
}

function runSelfTests() {
  const test = ts.createSourceFile('self-test.tsx', '<AppText>Visible</AppText><AppText>{ready ? `Done` : t(\'feedback.loading\')}</AppText>', ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  assert.equal(test.statements.length, 1, 'TypeScript must parse JSX localization checks');
  assert.equal(isTranslationCall(ts.createSourceFile('self-test.ts', "t('common.retry')", ts.ScriptTarget.Latest, true).statements[0].expression), true);
  const visibleLabels = [];
  const options = ts.createSourceFile(
    'self-test.tsx',
    '<Control options={[{ label: "Visible option", value: "opaque-id", icon: "technical-icon" }]} />',
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const jsx = options.statements[0].expression;
  const attribute = jsx.attributes.properties[0];
  visitVisibleCollection(attribute.initializer.expression, (node) => visibleLabels.push(node.text), options);
  assert.deepEqual(visibleLabels, ['Visible option'], 'visible option labels are checked without scanning values or icons');

  const fallbackSource = ts.createSourceFile(
    'self-test.tsx',
    "const a = t('label.key') || 'Visible OR fallback'; const b = t('label.key') ?? 'Visible null fallback'; const c = t('label.key') ? t('other.key') : 'Visible conditional fallback';",
    ts.ScriptTarget.Latest,
    true,
  );
  const fallbackLiterals = [];
  for (const statement of fallbackSource.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const expression = declaration.initializer;
      if (expression) visitVisibleExpression(expression, (node) => fallbackLiterals.push(node.text), fallbackSource);
    }
  }
  assert.deepEqual(
    fallbackLiterals,
    ['Visible OR fallback', 'Visible null fallback', 'Visible conditional fallback'],
    'visible fallbacks around translation calls are checked for OR, nullish-coalescing, and conditional expressions',
  );

  const ordinaryLogic = ts.createSourceFile('self-test.ts', 'const ready = enabled || isCached;', ts.ScriptTarget.Latest, true);
  const ordinaryLiterals = [];
  visitVisibleExpression(ordinaryLogic.statements[0].declarationList.declarations[0].initializer, (node) => ordinaryLiterals.push(node.text), ordinaryLogic);
  assert.deepEqual(ordinaryLiterals, [], 'normal logical expressions without translations are left alone');
}

function normalize(value) {
  return value.replaceAll(path.sep, '/');
}
