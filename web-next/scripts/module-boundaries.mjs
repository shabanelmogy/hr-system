/** Canonical dependency policy for the target modular frontend structure. */
export const allowedOwnerDependencies = Object.freeze({
  platform: Object.freeze(["shared"]),
  hr: Object.freeze(["accounting", "platform", "reporting", "shared"]),
  accounting: Object.freeze(["platform", "shared"]),
  crm: Object.freeze(["platform", "shared"]),
  "reference-data": Object.freeze(["platform", "reporting", "shared"]),
  reporting: Object.freeze(["platform", "shared"]),
  shell: Object.freeze(["platform", "shared"]),
  shared: Object.freeze([]),
});

export const ownershipGroups = Object.freeze([
  "platform",
  "hr",
  "accounting",
  "crm",
  "reference-data",
  "reporting",
  "shell",
  "shared",
]);

export const moduleDirectories = Object.freeze({
  hr: "src/modules/hr",
  accounting: "src/modules/accounting",
  crm: "src/modules/crm",
  "reference-data": "src/modules/reference-data",
  reporting: "src/modules/reporting",
});
