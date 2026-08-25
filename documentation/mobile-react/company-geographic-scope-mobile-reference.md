# Company Geographic Scope Expo Implementation Profile

## 1. Feature Inventory

The feature owner is `src/features/basic-data/company-geographic-scope`; the thin route is `app/(main)/basic-data/organizational-structure/geographic-scope.tsx`.

## 2. Route and Navigation

`ROUTES.basicData.companyGeographicScope` is the single typed path. The route uses `RouteGuard`, Organizational Structure navigation derives visibility from route access, and breadcrumbs/header translations describe Operating Countries.

## 3. Access Contract

View requires `CompanyGeographicScope:View`. Mutation requires `CompanyGeographicScope:Manage` and writable application state. Screen guards remain in place even when navigation hides the item.

## 4. Runtime Validation

The feature API treats network data as unknown and parses it with Zod before exposing typed data. PUT sends only selected Country IDs and the selected default.

## 5. Query Ownership

Stable feature query keys own GET and PUT. Successful save invalidates the aggregate query and resets the form from the server response.

## 6. Form Contract

The Zod/RHF form requires 1-100 distinct positive IDs and a default within the selection. The shared multi-select writes `countryIds`; the shared single-select writes `defaultCountryId` and exposes only the selected operating Countries. Removing the current default from the multi-select clears it and exposes validation instead of silently choosing a different Country.

## 7. Screen Composition

The screen composes `AppScreen`, `AppCard`, `AppForm`, shared `AppMultiSelectField` and `AppSelectField`, shared `AppTextField` search, `AppMultiView`, `AppDataTable`, feature-owned operating-country cards, `AppStateView`, and `AppButton`. A single localized selector-section title explains the form; the route-owned app header/breadcrumb supplies page identity, so neither the screen nor its views duplicate it. Table and Card modes display only selected Countries and share the same complete GET aggregate, local search, default-status indicators, and client pagination. The empty state distinguishes an unconfigured selection from a search that filters a non-empty selection to zero rows. This local search/sort/page slicing is truthful and does not pretend that a server page is the complete catalog. The table uses five rows by default and Cards use three; switching modes resets the local page and applies that mode's page size.

## 8. Responsive and Direction Rules

Styles are colocated, token-based, and use shared RTL/localization direction. The table scrolls horizontally for bilingual names/codes; Cards present the same names, ISO codes, and a read-only default-country indicator. Selection/default changes are available only through accessible shared selectors. Both modes use shared local pagination on narrow phones and tablets. The save/update footer has token-based vertical separation from the content above it.

## 9. Loading, Error, and Empty States

Loading, retryable error, permission-denied, and empty global-catalog states are explicit. Save feedback uses shared toast/error handling.

## 10. Mutation and Read-only Rules

Save is disabled while busy, when clean, without Manage permission, or in read-only mode. Read-only attempted actions use the shared notification behavior.

## 11. Reuse Boundary

Do not add local table, pagination, search field, selector, card, state, button, toast, authorization, or API-client primitives. Controlled multi-row selection is an optional domain-neutral `AppDataTable.rowSelection` capability; the feature owns only Country columns, localized labels, default-country action, and event-to-form mapping. Keep private schemas/hooks inside the feature and export only the screen through the Basic Data public API.

## 12. Localization

Paired EN/AR basic-data and navigation dictionaries contain every literal key. Country labels use the current language; generic Refresh belongs to the common dictionary.

## 13. Capability Matrix

The configuration form is Required and uses selectable Table and Card presentations with client pagination. This does not create a Country collection-management API or CRUD surface. Chart, Report, Import, Export, bulk lifecycle actions, and lifecycle actions are Excluded.

## 14. Verification

Focused tests cover shared row-selection toggling plus localized-name/ISO search, ID normalization, and select-before-default behavior. The complete check covers typecheck, lint, architecture, translation parity/usage, route access, APIs, screens, shared components, and existing feature suites.

## 15. Consumer and Handoff Rules

Branch address screens use selected operating Countries, then derive State/District from the branch's own Country. Different branches may use different States or Countries. `DefaultCountryId` is only an initial value. Employee nationality always uses the complete active global Country catalog.

Country/State/District master screens belong to Platform navigation and require the
`super_admin` role. Tenant Basic Data navigation exposes only this operating-scope
configuration, never global catalog mutations.
