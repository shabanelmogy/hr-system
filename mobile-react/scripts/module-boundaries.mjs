/** Canonical dependency policy for the modular mobile frontend. */
export const allowedOwnerDependencies = Object.freeze({
  core: Object.freeze([]),
  shared: Object.freeze(['core']),
  platform: Object.freeze(['core', 'shared']),
  shell: Object.freeze(['core', 'shared', 'platform', 'hr', 'accounting', 'crm', 'referenceData']),
  hr: Object.freeze(['core', 'shared', 'platform', 'accounting', 'referenceData']),
  accounting: Object.freeze(['core', 'shared', 'platform']),
  crm: Object.freeze(['core', 'shared', 'platform']),
  referenceData: Object.freeze(['core', 'shared', 'platform']),
  app: Object.freeze(['core', 'shared', 'platform', 'shell', 'hr', 'accounting', 'crm', 'referenceData']),
});

export const moduleDirectories = Object.freeze({
  hr: 'src/modules/hr',
  accounting: 'src/modules/accounting',
  crm: 'src/modules/crm',
  referenceData: 'src/modules/reference-data',
});

export const ownershipGroups = Object.freeze([
  'core',
  'shared',
  'platform',
  'shell',
  'hr',
  'accounting',
  'crm',
  'referenceData',
  'app',
]);
