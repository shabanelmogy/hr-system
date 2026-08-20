# Mobile Architecture

## Guiding Rules

- Keep Expo Router files thin. A route imports a feature screen or composes a layout.
- A business feature owns its screens, queries, mutations, schemas, and business UI.
- `shared` contains only domain-neutral UI primitives.
- Use React Query for server state and small React contexts only for app-wide preferences or session state.
- Use React Hook Form with Zod through `zodResolver` for forms.
- Store access and refresh tokens through `secureSession`, never AsyncStorage.
- Keep query keys and API endpoint constants with the feature that owns them.

## Layout Selection

| Screen type | Navigation/layout |
| --- | --- |
| Login, registration, recovery | Auth Stack inside `AuthLayout` |
| Dashboard and frequently used top-level screens | Main Tabs inside `MainLayout` |
| Large module such as Basic Data, Employees, or Recruitment | Dedicated module Drawer |
| Create/edit/detail workflow | Stack screens inside the owning module |
| Short focused action | Modal presentation from the owning Stack |

The Basic Data module is the reference implementation. Its Drawer is permanent on large screens and overlays content on phones. A future Employees or Recruitment module should own a similar layout file, while reusing only `ModuleDrawerContent`.

Do not put every screen in the bottom tabs. Tabs are for a small number of frequent destinations; module navigation belongs to the module.

## Routes

`src/core/constants/routes.ts` mirrors the routes currently present under `app`. For a dynamic route, add a typed builder beside the constants only after creating the route file.

Constants follow ownership instead of one global dumping folder:

- App-wide routes, storage keys, pagination defaults, and timeouts live in `src/core/constants`.
- API endpoints and internal navigator screen names live in the feature that owns them, such as `features/auth/constants` and `features/basic-data/constants`.

Current route ownership:

- `/` and `/settings`: Main Tabs.
- `/basic-data`: Basic Data Drawer.
- `/basic-data/geographical-information`: Basic Data Drawer.
- `/basic-data/organizational-structure`: Basic Data Drawer.
- `/modal`: Main Stack modal.

## Localization And RTL

- English and Arabic resources live under `src/core/localization/translations`.
- `LocalizationProvider` persists the selected language and updates i18next immediately.
- The React tree receives `direction`, while shared text controls set `textAlign` and `writingDirection`.
- Do not call `I18nManager.forceRTL` or reload the application for an in-app language change.
- Use logical styles such as `marginStart` and `marginEnd`. Directional icons must select the correct icon for RTL.

This gives immediate application-level RTL changes. Native operating-system surfaces and native back gestures still follow the device language and platform conventions.

## Theme

`AppThemeProvider` supports `system`, `light`, and `dark` modes and persists the preference. Use semantic colors from `theme.colors`; do not hardcode page colors. Navigation, status bar, shared fields, cards, and feedback states consume the same theme.

For the full styling contract, including token ownership, colocated `StyleSheet.create`, RTL, responsive/safe-area, accessibility, and review guidance, see [MOBILE_STYLE_GUIDE.md](MOBILE_STYLE_GUIDE.md).

## API And Session

- Configure the backend with `EXPO_PUBLIC_API_URL`.
- Use the Axios-backed `apiService` for JSON and multipart requests; it adds the access token, timeout, cancellation support, Problem Details parsing, and one coordinated refresh attempt.
- The Axios client owns transport behavior. Authentication endpoints, contracts, response parsing, and token rotation remain owned by the authentication feature.
- React Query controls caching and server retries. Mutations do not retry automatically.
- On Android/iOS, `secureSession` uses Expo SecureStore. The web development target keeps tokens in memory only.
- A one-company login stores the returned access/refresh pair immediately. A multi-company login keeps only the short-lived selection response until the user chooses a company.
- Authentication and company changes clear React Query caches so data from one company cannot appear in another company context.
- For a physical device, run the API on a LAN binding such as `dotnet run --urls http://0.0.0.0:5293` and use the machine LAN address in `.env`.

## Adding A Feature Module

1. Add the feature under `src/features/<feature>`.
2. Add its Expo Router group under `app/(main)/<feature>`.
3. Create a feature-owned Drawer layout only when the feature has several navigation areas.
4. Reuse `ModuleDrawerContent` for the drawer heading and dashboard action.
5. Add only the new physical paths to `ROUTES`.
6. Add English and Arabic keys together.
7. Run `npm run check` and verify phone, tablet, LTR, RTL, light, and dark states.
