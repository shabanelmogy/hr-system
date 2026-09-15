/** Canonical dependency policy for the modular mobile frontend. */
export const allowedOwnerDependencies = Object.freeze({
  core: Object.freeze([]),
  shared: Object.freeze(['core']),
  platform: Object.freeze(['core', 'shared']),
  shell: Object.freeze(['core', 'shared', 'platform', 'hr', 'accounting']),
  hr: Object.freeze(['core', 'shared', 'platform']),
  accounting: Object.freeze(['core', 'shared', 'platform']),
  app: Object.freeze(['core', 'shared', 'platform', 'shell', 'hr', 'accounting']),
});

export const moduleDirectories = Object.freeze({
  hr: 'src/modules/hr',
  accounting: 'src/modules/accounting',
});

export const ownershipGroups = Object.freeze([
  'core',
  'shared',
  'platform',
  'shell',
  'hr',
  'accounting',
  'app',
]);
