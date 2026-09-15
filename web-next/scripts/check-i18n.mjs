import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = path.resolve("src");
const localeRoot = path.resolve("src/locales");
const visibleAttributes = new Set([
  "label", "title", "placeholder", "helperText", "description", "aria-label", "ariaLabel",
  "confirmLabel", "cancelLabel", "emptyMessage", "loadingMessage", "errorMessage", "noRowsLabel",
  "noResultsLabel", "caption", "tooltip", "subTitle", "itemsLabel", "searchPlaceholder", "buttonText",
  "primaryText", "secondaryText", "message", "text",
]);
const violations = [];
const missingKeys = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(filePath);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !/(?:\.test|\.spec)\./i.test(entry.name)) inspect(filePath);
  }
}

function isTechnical(value) {
  const normalized = decodeEntities(value).trim();
  if (!normalized) return true;
  if (/^(?:https?:\/\/|mailto:|NEXT_PUBLIC_)/i.test(normalized)) return true;
  if (/^(?:[+-]?\d+(?:\.\d+)?|[+-]\d+s?|x|v)$/i.test(normalized)) return true;
  if (/^·?\s*[A-Z]{2,8}-$/i.test(normalized)) return true;
  if (/^[A-Z]{2,4}(?:\s*,\s*[A-Z]{2,4})+(?:\.\.\.)?$/i.test(normalized)) return true;
  if (/^[A-Z]{3}\s*(?:,|\.\.\.)\s*(?:USD|EUR|GBP|SAR|AED|EGP)$/i.test(normalized)) return true;
  if (/^[A-Z]{3}(?:\.|-|_)?\.\.\.$/i.test(normalized)) return true;
  if (/^(?:N\/A|NA)$/i.test(normalized)) return true;
  if (!/[A-Za-z\u0600-\u06ff]/.test(normalized)) return true;
  return false;
}

function decodeEntities(value) { return value.replace(/&(quot|apos|amp|lt|gt|#34|#39);/gi, ""); }
function isStringLiteralLike(node) { return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node); }
function isTranslationCall(node) { return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "t"; }

function inspect(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const file = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
  function visit(node) {
    if (ts.isJsxText(node)) {
      if (!isInStyleOrScript(node) && !isTechnical(node.getText(file))) add(node, "visible JSX text", node.getText(file).trim());
    } else if (ts.isJsxAttribute(node) && visibleAttributes.has(node.name.text)) {
      const initializer = node.initializer;
      if (initializer && ts.isStringLiteral(initializer) && !isTechnical(initializer.text)) add(node, `${node.name.text} attribute`, initializer.text);
      else if (initializer && ts.isJsxExpression(initializer) && initializer.expression) inspectExpression(initializer.expression, node.name.text);
    } else if (ts.isJsxExpression(node) && node.expression && !isInStyleOrScript(node) && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
      inspectExpression(node.expression, "JSX expression");
    }
    if (ts.isCallExpression(node) && isTranslationCall(node)) {
      const first = node.arguments[0];
      if (first && isStringLiteralLike(first)) checkTranslationKey(first.text, filePath, first);
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.BarBarToken && isTranslationCall(node.left)) {
      add(node, "translation fallback", node.getText(file));
    }
    ts.forEachChild(node, visit);
  }
  function inspectExpression(expression, kind) {
    if (isStringLiteralLike(expression)) { if (!isTechnical(expression.text)) add(expression, kind, expression.text); return; }
    if (ts.isTemplateExpression(expression)) {
      if (!isTechnical(expression.head.text)) add(expression, kind, expression.head.text);
      for (const span of expression.templateSpans) if (!isTechnical(span.literal.text)) add(span.literal, kind, span.literal.text);
      return;
    }
    if (ts.isParenthesizedExpression(expression)) return inspectExpression(expression.expression, kind);
    if (ts.isConditionalExpression(expression)) {
      inspectExpression(expression.whenTrue, kind); inspectExpression(expression.whenFalse, kind); return;
    }
    if (ts.isBinaryExpression(expression) && [ts.SyntaxKind.PlusToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.QuestionQuestionToken].includes(expression.operatorToken.kind)) {
      inspectExpression(expression.left, kind); inspectExpression(expression.right, kind); return;
    }
    if (ts.isArrayLiteralExpression(expression)) {
      expression.elements.forEach((element) => inspectExpression(element, kind));
    }
  }
  function isInStyleOrScript(node) {
    let current = node.parent;
    while (current) {
      if (ts.isJsxElement(current)) {
        const tagName = current.openingElement.tagName.getText(file).toLowerCase();
        if (tagName === "style" || tagName === "script") return true;
      }
      current = current.parent;
    }
    return false;
  }
  visit(file);
}

function add(node, kind, value) {
  const { line } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
  violations.push(`${path.relative(process.cwd(), node.getSourceFile().fileName)}:${line + 1}: ${kind}: ${JSON.stringify(value)}`);
}

function flatten(value, prefix = "") {
  const result = new Map();
  if (!value || typeof value !== "object" || Array.isArray(value)) return result;
  for (const [key, child] of Object.entries(value)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      for (const [nestedKey, nestedValue] of flatten(child, full)) result.set(nestedKey, nestedValue);
    } else result.set(full, child);
  }
  return result;
}

function normalizeKey(key) { return key.replace(/_(?:zero|one|two|few|many|other)$/g, ""); }
const catalogs = {
  en: flatten(JSON.parse(fs.readFileSync(path.join(localeRoot, "en/translation.json"), "utf8"))),
  ar: flatten(JSON.parse(fs.readFileSync(path.join(localeRoot, "ar/translation.json"), "utf8"))),
};
const enKeys = new Set([...catalogs.en.keys()].map(normalizeKey));
const arKeys = new Set([...catalogs.ar.keys()].map(normalizeKey));
for (const key of [...enKeys].filter((item) => !arKeys.has(item))) missingKeys.push(`missing in ar: ${key}`);
for (const key of [...arKeys].filter((item) => !enKeys.has(item))) missingKeys.push(`missing in en: ${key}`);
for (const [key, value] of catalogs.ar) {
  if (value === "النص") missingKeys.push(`ar catalog placeholder: ${key}`);
}
for (const [key, value] of catalogs.en) {
  if (typeof value === "string" && /Placeholder$/.test(value) && !/placeholder/i.test(key)) {
    missingKeys.push(`en catalog placeholder: ${key}`);
  }
}
function checkTranslationKey(key, filePath, node) {
  const normalized = normalizeKey(key);
  if (!enKeys.has(normalized) || !arKeys.has(normalized)) {
    const { line } = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
    missingKeys.push(`${path.relative(process.cwd(), filePath)}:${line + 1}: ${key}`);
  }
}

walk(root);
const allFailures = [...violations.map((item) => `literal: ${item}`), ...missingKeys.map((item) => `catalog: ${item}`)];
if (allFailures.length) {
  console.error(`i18n checks found ${allFailures.length} violations:`);
  allFailures.forEach((item) => console.error(`  ${item}`));
  process.exit(1);
}
console.log("i18n checks passed: source literals, locale parity, and static translation keys are clean.");
