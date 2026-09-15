# Tenant module entitlements Expo implementation profile

## 1. Feature boundary

src/platform/modules owns schemas, API calls, queries, launchers, and submodule
entry behavior. Route files remain thin adapters.

## 2. Expo Router layout

Routes are /apps, /apps/[moduleCode], and
/apps/[moduleCode]/[submoduleCode]. The protected drawer declares apps as a
first-class destination; the existing role-aware root remains the login target.

## 3. Runtime validation

Zod validates module and submodule responses, including the optional isDefault
compatibility field, before data reaches screens.

## 4. Query ownership

React Query maintains separate installed, tenant-entitlement, and accessible
catalog caches. Tenant administration reads the dedicated server-filtered
tenant-entitlement catalog without intersecting it with the mobile screen
registry. The accessible cache is short-lived because grants and role
permissions can change.

## 5. Odoo-style launcher

ModuleLauncherScreen uses shared AppScreen, AppCard, AppText, AppIcon, and
state components to render compact icon tiles with semantic theme colors and a
responsive wrapped layout. Every tile keeps its icon box fixed and top-aligned
while the label can wrap below it; primary module glyphs are slightly larger
than submodule glyphs without changing the tile geometry.

## 6. Module route

The module route passes only the stable code. The screen resolves current data
from its own query, avoiding parent/child timing where an undefined module could
be mistaken for the full application launcher.

## 7. Submodule entry

SubmoduleEntryScreen redirects to the first mobile route allowed by RBAC and
shows a localized empty state when no screen is currently available.

## 8. Route guard

RouteGuard intersects route policy with the accessible module catalog. Module
and submodule URLs are denied when the subscription does not include the
requested capability.

## 9. Drawer behavior

The application launcher is a first-class drawer destination. Existing business
destinations remain filtered through RBAC and entitlement requirements.

## 10. Tenant editor

TenantFormModal reuses the existing full-screen AppForm and AppSwitchField
controls for module and submodule selection. Global capabilities such as
reference-data:geography are absent because the Platform API never returns them
from /modules/tenant-entitlements.

## 11. Selection integrity

Pure entitlement helpers update a single module without replacing the rest of
the list. The regression test proves that selecting Accounting preserves HR and
its submodules.

Login scope selection is explicit and ordered: `credentials -> tenant ->
company -> module launcher -> module -> submodule`. The mobile parser and
selection screens accept every non-empty tenant/company challenge, including a
one-option list, and never preselect the first option. Session credentials are
stored only after `SelectCompany` succeeds; direct authenticated responses
remain parseable for rolling-deployment compatibility.

## 12. Defaults and compatibility

New tenant defaults come from isDefault; older API responses fall back to HR as
the default. A saved empty list remains intentionally empty and is never
mistaken for a missing response.

## 13. Localization and theming

English and Arabic keys cover launchers and empty states. The screen consumes
theme spacing, radius, colors, and shared icons instead of introducing a second
design system.

## 14. Verification

TypeScript type-check and focused Jest suites cover the changed routes, RBAC,
and entitlement selection. Full lint, architecture, and Jest checks are release
gates.

## 15. Extension rule

Future module definitions arrive from the API and display with generic
presentation automatically. Add specific icons and entry candidates locally
only when real business screens exist; never create fake Accounting, POS, CRM,
or Inventory features.
