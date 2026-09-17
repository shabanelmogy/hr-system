let licenseRegistration: Promise<void> | null = null;

/**
 * Registers the Syncfusion license only when a Syncfusion-backed viewer is
 * actually requested. Keeping the import dynamic prevents ej2-base from
 * becoming part of the protected application bootstrap.
 */
export function ensureSyncfusionLicense(): Promise<void> {
  if (!licenseRegistration) {
    licenseRegistration = import("@syncfusion/ej2-base").then(({ registerLicense }) => {
      const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;
      if (licenseKey && !licenseKey.startsWith("replace-")) {
        registerLicense(licenseKey);
      }
    });
  }

  return licenseRegistration;
}
