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

/**
 * App Router route groups are ownership markers only; Next.js removes them from
 * the public URL. Every protected page must sit beneath exactly one of these
 * owner groups so filesystem routing cannot drift away from source ownership.
 */
export const appRouteOwnerGroups = Object.freeze({
  "(platform)": "platform",
  "(shell)": "shell",
  "(hr)": "hr",
  "(accounting)": "accounting",
  "(crm)": "crm",
  "(reference-data)": "reference-data",
  "(reporting)": "reporting",
});

/** Structural group for standalone business-module route prefixes. */
export const appBusinessRouteGroup = "(modules)";

/**
 * These public URL prefixes intentionally contain routes from more than one
 * owner. They stay concrete once and place owner groups below the shared prefix.
 */
export const sharedMainRouteRoots = Object.freeze([
  "administration",
  "basic-data",
  "super-admin",
]);
