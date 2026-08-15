# Email confirmation links

Email confirmation uses one public HTTPS URL for web and mobile:

```text
https://app.example.com/confirm-email?userId=...&code=...
```

- If the native app is installed and the domain association is valid, the OS opens the Expo Router `/confirm-email` screen.
- Otherwise, the same URL opens the Next.js confirmation page.
- Legacy web links under `/email-confirmation` redirect to `/confirm-email`.

## Required deployment settings

API:

```text
AppSettings__FrontendUrl=https://app.example.com
```

Mobile build:

```text
EXPO_PUBLIC_APP_LINK_HOST=app.example.com
```

Rebuild and reinstall the native app after changing the app-link host.

Next.js server:

```text
APP_LINK_ANDROID_PACKAGE=com.hrmanagementsystem.mobile
APP_LINK_ANDROID_SHA256_CERT_FINGERPRINTS=AA:BB:CC:...
APP_LINK_IOS_BUNDLE_ID=com.hrmanagementsystem.mobile
APP_LINK_APPLE_TEAM_ID=ABCDE12345
```

The web app serves the verification documents at:

- `/.well-known/assetlinks.json`
- `/.well-known/apple-app-site-association`

Both endpoints and the confirmation URL must be publicly reachable over HTTPS. Android certificate fingerprints can be obtained with `eas credentials -p android`. The Apple Team ID comes from the Apple Developer account.

## Development-only deep-link test

The custom scheme remains available for a development build:

```text
hrmanagement://confirm-email?userId=...&code=...
```

Email templates must still use the public HTTPS URL so that users without the native app retain the web fallback.
