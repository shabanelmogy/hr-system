# HR Management Mobile

Expo SDK 54 application for the HR Management System.

## Commands

```bash
npm install
npm run start
npm run android
npm run ios
npm run web
npm run check
```

Create `.env` from `.env.example` and set `EXPO_PUBLIC_API_URL` to an address reachable by the target device. Never place secrets in `EXPO_PUBLIC_*` variables.

## Structure

- `app`: Expo Router route files and layout composition only.
- `src/core`: API, environment, localization, providers, query, secure storage, and theme.
- `src/features`: business-owned screens, hooks, API calls, schemas, and components.
- `src/layouts`: application, authentication, and reusable module layout shells.
- `src/shared`: domain-neutral UI and utility code only.

Navigation paths are centralized in `src/core/constants/routes.ts`. Add a constant only when its physical Expo Router route exists.

See `docs/MOBILE_ARCHITECTURE.md` before adding a new feature or layout.
