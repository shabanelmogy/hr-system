import path from 'node:path';

function normalizeSource(sourceRoot, source) {
  return path.posix.normalize(`${sourceRoot}/${source}`.replaceAll('\\', '/'));
}

function collectSources(map) {
  if (!map || typeof map !== 'object' || map.version !== 3) {
    throw new Error('Android bundle policy requires a version 3 source map.');
  }

  if (Object.hasOwn(map, 'sections')) {
    if (!Array.isArray(map.sections) || map.sections.length === 0) {
      throw new Error('Android bundle source-map sections must not be empty.');
    }
    return map.sections.flatMap((section) => collectSources(section?.map));
  }

  if (
    !Array.isArray(map.sources) || map.sources.length === 0 ||
    !map.sources.every((source) => typeof source === 'string' && source.length > 0) ||
    (map.sourceRoot !== undefined && typeof map.sourceRoot !== 'string')
  ) {
    throw new Error('Android bundle source map must contain valid source paths.');
  }

  return map.sources.map((source) => normalizeSource(map.sourceRoot ?? '', source));
}

export function assertAndroidBundlePolicy(map) {
  const sources = [...new Set(collectSources(map))];
  const hasApplication = sources.some((source) =>
    /(?:^|\/)mobile-react\/(?:src|app)\//.test(source) || /^\/(?:src|app)\//.test(source));
  const hasNativeRuntime = sources.some((source) => /(?:^|\/)node_modules\/react-native\//.test(source));
  if (!hasApplication || !hasNativeRuntime) {
    throw new Error('Android bundle source map must include application and React Native sources.');
  }

  // Expo SDK57 intentionally embeds this Metro module loader, not the CLI's tooling schemas.
  const isMetroLoader = (source) => /(?:^|\/)@expo\/cli\/build\/metro-require\/require\.js$/.test(source);
  // RISK-013/RISK-014: audited tooling and legacy validation must stay outside native runtime.
  const forbidden = sources.filter((source) =>
    (/(?:^|\/)@expo\/cli(?:\/|$)/.test(source) && !isMetroLoader(source)) ||
    /(?:^|\/)node_modules\/zod\/(?:src\/)?(?:v3|lib)(?:\/|$)/.test(source) ||
    /(?:^|\/)node_modules\/deepmerge(?:\/|$)/.test(source));
  if (forbidden.length > 0) {
    throw new Error(`Android runtime includes a prohibited dependency: ${forbidden.join(', ')}`);
  }

  return {sourceCount: sources.length, metroLoaderCount: sources.filter(isMetroLoader).length};
}
