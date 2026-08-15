const androidPackage =
  process.env.APP_LINK_ANDROID_PACKAGE?.trim() ||
  "com.hrmanagementsystem.mobile";

function getCertificateFingerprints(): string[] {
  return (process.env.APP_LINK_ANDROID_SHA256_CERT_FINGERPRINTS ?? "")
    .split(",")
    .map((fingerprint) => fingerprint.trim())
    .filter(Boolean);
}

export const dynamic = "force-dynamic";

export function GET() {
  const fingerprints = getCertificateFingerprints();
  const body = fingerprints.length === 0
    ? []
    : [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: androidPackage,
            sha256_cert_fingerprints: fingerprints
          }
        }
      ];

  return Response.json(body, {
    headers: {
      "Cache-Control": "public, max-age=3600"
    }
  });
}
