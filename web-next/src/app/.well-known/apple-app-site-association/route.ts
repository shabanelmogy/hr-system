const iosBundleId =
  process.env.APP_LINK_IOS_BUNDLE_ID?.trim() ||
  "com.hrmanagementsystem.mobile";

export const dynamic = "force-dynamic";

export function GET() {
  const teamId = process.env.APP_LINK_APPLE_TEAM_ID?.trim();
  const appId = teamId ? `${teamId}.${iosBundleId}` : null;

  return Response.json(
    {
      applinks: {
        apps: [],
        details: appId
          ? [
              {
                appID: appId,
                paths: ["/confirm-email", "/accept-invitation"]
              }
            ]
          : []
      }
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600"
      }
    }
  );
}
