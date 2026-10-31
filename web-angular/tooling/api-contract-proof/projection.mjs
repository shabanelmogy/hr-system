export const proofTags = ['Countries', 'EnvelopeAmendments', 'Files', 'FiscalYears'];

// Extract, without repairing, the observed operations and their local schema closure.
export function projectSpec(source) {
  if (!/^3\.[01]\./.test(source.openapi ?? '')) throw new Error('Unsupported observed OpenAPI version');
  const paths = {};
  for (const [path, item] of Object.entries(source.paths)) {
    const methods = Object.fromEntries(Object.entries(item).filter(([method, operation]) =>
      ['get', 'put', 'post', 'delete', 'patch', 'options', 'head', 'trace'].includes(method)
      && operation.tags?.some(tag => proofTags.includes(tag))));
    if (Object.keys(methods).length) {
      paths[path] = { ...methods };
      for (const key of ['parameters', 'summary', 'description', 'servers']) {
        if (key in item) paths[path][key] = item[key];
      }
    }
  }
  const components = {};
  const seen = new Set();
  function walk(value) {
    if (Array.isArray(value)) return value.forEach(walk);
    if (!value || typeof value !== 'object') return;
    if (value.$ref) {
      const match = /^#\/components\/([^/]+)\/([^/]+)$/.exec(value.$ref);
      if (!match) throw new Error(`Non-local component reference is outside this proof: ${value.$ref}`);
      if (!seen.has(value.$ref)) {
        seen.add(value.$ref);
        const [, group, encodedName] = match;
        const name = encodedName.replaceAll('~1', '/').replaceAll('~0', '~');
        const target = source.components?.[group]?.[name];
        if (!target) throw new Error(`Missing observed component ${value.$ref}`);
        (components[group] ??= {})[name] = target;
        walk(target);
      }
    }
    Object.values(value).forEach(walk);
  }
  walk(paths);
  // Preserve actual security declarations rather than adding Cookie/CSRF metadata.
  if (source.components?.securitySchemes) components.securitySchemes = source.components.securitySchemes;
  return { openapi: source.openapi, info: source.info, ...(source.servers && { servers: source.servers }),
    paths, components, ...(source.security && { security: source.security }) };
}

export function stableJson(value) {
  function ordered(item) {
    if (Array.isArray(item)) return item.map(ordered);
    if (!item || typeof item !== 'object') return item;
    return Object.fromEntries(Object.keys(item).sort().map(key => [key, ordered(item[key])]));
  }
  return JSON.stringify(ordered(value), null, 2) + '\n';
}
