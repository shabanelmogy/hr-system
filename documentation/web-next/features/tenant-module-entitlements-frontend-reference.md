# Tenant module entitlements Next.js implementation profile

## 1. Feature boundary

`web-next/src/platform/modules` owns module definitions, entitlement resolution,
route requirements, and launcher/context-switcher composition. Generic visual
primitives remain in `web-next/src/shared/components/layout`.

## 2. Routes

The browser exposes /apps, /apps/[moduleCode], and
/apps/[moduleCode]/[submoduleCode]. Dynamic routes validate against the
accessible catalog before rendering or redirecting.

## 3. API client

moduleApi uses the existing shared API service and central API route
configuration. Query keys separate installed, tenant-entitlement, and
tenant-specific accessible catalog data. Tenant administration consumes only
the server-filtered /modules/tenant-entitlements catalog, so Global capabilities
such as reference-data:geography never appear as tenant choices.

## 4. Odoo-style launcher

The shared launcher renders a compact centered grid of themed rounded icons and
labels. It supports keyboard focus, RTL, responsive wrapping, dark mode, and
domain-neutral module data.

## 5. Presentation adapter

modulePresentation.tsx maps known stable codes to icons and semantic theme
tones. Unknown future modules and submodules receive a safe generic icon.

## 5.1 Top-bar context switching

The domain-neutral shared `ContextSwitcher` owns trigger/menu lifecycle,
selection, loading/disabled states, keyboard semantics, and compact/icon-only
responsive styling. `CompanyContextSwitcher` composes it without changing
company switching, cache invalidation, notifications, localized names, or the
single-company display. `ModuleContextSwitcher` uses the tenant-scoped
accessible catalog and `requiredModuleForPath` so direct HR URLs keep the
correct active application. Desktop shows module and company controls; mobile
uses an icon-only module control. The menu offers the applications overview and
only accessible modules, routed through the typed `appRoutes` helpers.

## 6. Submodule entry

SubmoduleEntryPage selects the first existing route allowed by RBAC. When a
licensed submodule has no client screen or no reachable screen for the user, it
shows a localized empty state instead of navigating to a missing route.

## 7. Route authorization

RouteAuthorizationGuard checks normal route policy plus module/submodule
membership from the accessible catalog. Loading fails closed and an API error
does not silently grant access.

## 8. Sidebar filtering

Existing sidebar navigation is filtered using the same accessible catalog so a
direct URL and visible navigation cannot disagree about commercial access.

## 9. Tenant editor

The super-admin tenant screen uses the shared MyForm, MyTextField, and MySelect
components. The domain-specific entitlement tree uses controlled checkboxes
inside that shared form shell. It does not infer assignability from the installed
catalog; the Platform API is authoritative.

When the current route belongs to a registered business module, the sidebar is
scoped to that module's permission-filtered navigation. For example,
/finance/ledger-setup/fiscal-years shows Accounting navigation rather than every entitled
module. The top-bar search remains cross-module.

## 10. Selection integrity

Pure helpers hydrate saved grants, build catalog defaults, and toggle one module
or submodule without mutating other entries. Choosing Accounting therefore
retains HR and all previously selected HR submodules.

Login scope selection is explicit and ordered: `credentials -> tenant ->
company -> module launcher -> module -> submodule`. The web client accepts and
renders non-empty tenant/company challenge lists, including a one-option list,
without preselecting the first option. It persists an authenticated session only
after the `SelectCompany` response; the parser still accepts a direct
authenticated response for rolling-deployment compatibility.

## 11. Localization and RTL

English and Arabic module labels, context-switcher labels, and empty states live
in the existing locale files. Layout uses logical alignment and MUI theme
direction.

## 12. Error and loading states

Routes reuse shared loading, error, and forbidden components. Tenant management
does not open an entitlement editor until both tenants and the installed
catalog have loaded successfully.

## 13. Verification

TypeScript type-check covers route and DTO integration. Vitest tests cover route
policies and the Accounting-selection regression. Architecture, lint, strict
type-check, and production build remain part of the final release gate.

## 14. Extension rule

Add future code-to-icon presentation in the feature adapter, not the shared
launcher. New module routes must be registered in route configuration and the
module-to-route guard mapping before they become reachable.
