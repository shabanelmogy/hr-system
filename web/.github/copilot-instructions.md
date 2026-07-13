The repository is a Vite + React (JSX/TS) HR management frontend. Use these concise guidelines to be productive.

Key commands
- dev: `npm run dev` — runs Vite dev server (https://localhost:5173 with local certs under `./.cert`).
- build: `npm run build` — production build via Vite.
- type checks: `npm run type-check` (or `type-check:strict`).
- lint: `npm run lint`.

Big-picture architecture
- Frontend-only SPA using Vite + React 19. Entry is `src/main.jsx` which wires React Query, i18n, MUI date adapter and Google OAuth.
- Route tree: `src/routes/routes.jsx` composes lazy-loaded feature pages and centralizes protected routes. Use `appRoutes` (in `src/routes/appRoutes.ts`) and `appPermissions` (in `src/constants/appPermissions.ts`) when adding routes.
- Feature folders under `src/features/*` are domain modules (e.g., `employee`, `basicData`, `communication`). Each exposes pages, components, hooks and services.
- Shared components and utilities live under `src/shared/*` (common UI like `EmptyState`, `MultiViewHeader`, and error helpers in `src/shared/utils`).

Patterns and conventions
- Path alias `@` -> `src` (see `tsconfig.json`); prefer imports like `@/features/employee`.
- TanStack Query is used for remote data (client default options set in `main.jsx`). Mutations and queries follow patterns in `src/shared/services` and feature `services` folders.
- Error handling: use utilities in `src/shared/utils` (eg. `extractErrorMessage`, `isValidationError`) to normalize API errors and populate form errors.
- Protected routes use a lazy-loaded `ProtectedRoute` component under `src/shared/components/auth/protectedRoute`. Use `requiredPermissions` prop to enforce permissions.
- Local dev server uses HTTPS and local certs; `vite.config.js` reads `./.cert/*` files. If certs are missing, run without https or recreate certs with `mkcert` (dev dependency).

Integration points & external deps
- REST APIs: code expects a backend API (not included). Look for API services under features like `src/features/employee/services` and shared `services` for axios usage and auth token handling.
- SignalR: `@microsoft/signalr` used for real-time features (e.g., messaging, notifications). Search `signalr` usages when editing real-time modules.
- PWA: configured via `vite-plugin-pwa` in `vite.config.js` (service worker under `dev-dist/`).

How to edit safely
- Follow path alias imports and existing feature/service patterns. Copy patterns from neighboring feature folders when adding new pages (e.g., `features/basicData/states` has a `README.md` with examples).
- For new routes: add constants to `src/routes/appRoutes.ts`, then add lazy route imports in `src/routes/routes.jsx` following the Suspense + MyLoadingIndicator pattern.
- Use `extractValidationErrors` to map API validation responses to form errors and `useForm` from react-hook-form with `@hookform/resolvers` where applicable.

Files to read first (examples)
- `src/main.jsx` — app bootstrapping and QueryClient defaults.
- `src/routes/routes.jsx` & `src/routes/appRoutes.ts` — routing and permission patterns.
- `src/shared/utils/README.md` — error handling helpers and examples.
- `src/shared/components/common/feedback/README.md` — Empty/NoResults components and usage examples.

When proposing changes
- Provide exact file paths and minimal diffs. Keep changes consistent with existing patterns (lazy-loading, Suspense fallbacks, protected route wrappers).
- Run `npm run dev` to validate dev server start and open https://localhost:5173. Run `npm run build` to verify production bundling.

Open questions for reviewers
- Confirm preferred coding style for new TypeScript files (project uses loose `tsconfig` but enforces certain checks). Ask before turning on stricter compiler flags.
- Where to add end-to-end tests, if any—there is currently no test runner configured.

If something is unclear, ask for the specific feature area (route, service, or UI component) and I'll point to concrete files and examples.
