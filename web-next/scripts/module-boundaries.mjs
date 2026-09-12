/** Canonical dependency policy for the target modular frontend structure. */
export const allowedOwnerDependencies = Object.freeze({
  platform: Object.freeze(["shared"]),
  hr: Object.freeze(["platform", "shared"]),
  accounting: Object.freeze(["platform", "shared"]),
  shell: Object.freeze(["platform", "shared"]),
  shared: Object.freeze([]),
});

export const ownershipGroups = Object.freeze([
  "platform",
  "hr",
  "accounting",
  "shell",
  "shared",
]);

export const moduleDirectories = Object.freeze({
  hr: "src/modules/hr",
  accounting: "src/modules/accounting",
});
