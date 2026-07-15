# Frontend Architecture Reference

Status: Applied to `web-next`.

This document is the architecture baseline for future frontend work. It covers ownership, dependency direction, routing, naming, and scalability. It does not define authentication behavior, API implementation, UI design, or performance policy.

## Review Summary

The review found no Critical issues.

High-priority issues that were fixed:

- Circular dependencies between shared component barrels and child components.
- Feature and shared components depending on layout internals.
- A shared notification service importing country-specific feature code.
- An overly broad shared component barrel hiding ownership boundaries.

Medium-priority issues that were addressed:

- Inconsistent feature page ownership.
- Mixed directory casing and naming conventions.
- Fragmented component prop types.
- Missing automated dependency-direction checks.
- Untyped application routes.
- Unused legacy barrels and route definitions.

Low-priority cleanup that was addressed:

- Removed the unused `src/shared/index.js` barrel.
- Moved global-presence dashboard ownership from `home` to geographical information.
- Replaced layout-owned content wrapping with a shared layout utility.

## Target Structure

```text
src/
  app/                         # Next.js App Router only; thin route adapters
  features/                    # Business capabilities and feature-owned UI
    <feature>/
      pages/                   # Route-level feature components
      components/              # Feature-specific UI
      hooks/                   # Feature-specific hooks
      services/                # Feature-specific API/service logic
      types/                   # Feature-specific types
      utils/                   # Feature-specific helpers
      index.ts                 # Deliberate public feature API
  layouts/                     # Application shells and shell-owned UI
  shared/
    components/                # Domain-neutral reusable UI
    contexts/                  # Cross-cutting React contexts
    hooks/                     # Domain-neutral hooks
    services/                  # Domain-neutral services
    utils/                     # Domain-neutral helpers
  lib/                         # Application infrastructure and integrations
  config/                      # Route, API, and environment configuration
  theme/                       # Theme and design-system integration
  types/                       # Global declarations only
```

## Dependency Direction

Allowed direction:

```text
app -> features, layouts, shared, lib, config, theme
layouts -> feature public APIs, shared, lib, config, theme
features -> shared, lib, config, theme, same-feature modules
shared -> lib, config, theme
lib -> config and infrastructure dependencies
config -> external/configuration dependencies only
```

Rules:

1. `src/app` contains route adapters, metadata, loading, error, and not-found boundaries. Business UI belongs in `src/features`.
2. `src/features` must never import from `src/app` or `src/layouts`.
3. `src/shared` must never import a feature, layout, or route module.
4. Cross-feature and layout-to-feature imports are allowed only through the target feature's deliberate `index.ts` public API.
5. Shared services must remain domain-neutral. Feature registration belongs to the feature that owns it.
6. Do not create imports through a broad root barrel when a domain barrel or direct module import is clearer.
7. New code must not introduce circular dependencies.

## Feature Ownership

- A page component belongs in the feature that owns the business capability.
- Components, hooks, types, services, and utilities used by one feature stay inside that feature.
- Move code to `shared` only when it is reusable across multiple features and contains no business-specific knowledge.
- Dashboard sections belong to the feature represented by their data, not automatically to `home`.
- Reports stay with the domain that owns their data unless they are truly cross-domain reporting infrastructure.

Current examples:

- Geographical pages live under `src/features/basic-data/geographical-information`.
- Global presence is owned by geographical information.
- Home dashboard composition lives under `src/features/home`.
- File listing and media preview live under `src/features/file-manager`.
- Notification API access, query state, realtime handling, and UI live under `src/features/notifications`.
- User-profile API access and query hooks live under `src/features/auth/profile`.
- Cross-domain report viewers and report API access live under `src/features/reporting`; domain report pages remain with their owning domain feature.
- Generic SignalR connection infrastructure lives under `src/lib/signalr`.
- Reusable content wrapping and sidebar context live under `src/shared`.

## App Router Rules

- Keep route groups organizational, for example `(main)`, `(auth)`, `(analytics)`, `(security)`, and `(platform)`.
- Route groups must not change public URLs unless the URL change is explicitly required.
- Keep `page.tsx` files thin and import a feature page component.
- Use `loading.tsx`, `error.tsx`, and `not-found.tsx` at the nearest meaningful route boundary.
- Do not duplicate route-level business logic in App Router adapters.
- Keep application routes centralized in `src/config/routes.ts` and use typed routes.

## Naming Rules

- Use lowercase kebab-case for directories: `global-presence`, `file-manager`, `media-viewer`.
- Use PascalCase for React components: `CountriesPage.tsx`, `ContentWrapper.tsx`.
- Name route-level feature components with the `Page` suffix.
- Name hooks with the `use` prefix and camelCase: `useCountryQueries.ts`.
- Name types by domain concept, not generic abbreviations.
- Avoid `My` prefixes for new reusable components. Existing names may be migrated incrementally.
- Use `index.ts` only as a deliberate public API, not as a universal export barrel.

## Required Checks

Before completing a structural change, run:

```powershell
npm.cmd run check:architecture
npm.cmd run type-check
npm.cmd run type-check:strict
npm.cmd run lint -- --quiet
npm.cmd test -- --run
npm.cmd run build
```

`check:architecture` is implemented in `scripts/check-architecture.mjs` and checks dependency direction and import cycles. Any new exception must be justified in code review and reflected here.

## Future Change Checklist

- [ ] Identify the owning feature before creating files.
- [ ] Keep the App Router adapter thin.
- [ ] Keep feature code independent from layouts and routes.
- [ ] Confirm shared code has no feature-specific imports.
- [ ] Use the established lowercase directory and PascalCase component naming.
- [ ] Add or update a feature `index.ts` only when a public cross-feature API is needed.
- [ ] Run the architecture, type, lint, test, and build checks.
