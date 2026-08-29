# Company Geographic Scope Next.js Implementation Profile

## 1. Feature Inventory

The owner is `src/features/basic-data/organizational-structure/company-geographic-scope`; the thin App Router adapter is `src/app/(main)/basic-data/(organizational-structure)/organizational-structure/geographic-scope/page.tsx`.

## 2. Route and Access

The public path is `/basic-data/organizational-structure/geographic-scope`. Route access requires `CompanyGeographicScope:View`; save additionally requires `CompanyGeographicScope:Manage` and a writable application state.

## 3. Runtime Contract

The service calls the shared API route directly through the existing client and returns the aggregate response. PUT sends only `countryIds`, `registrationCountryId`, and `defaultCountryId`; no scope identifiers are client-controlled.

## 4. Query Ownership

Feature-owned React Query keys wrap GET and PUT. Successful mutation invalidates the aggregate key and replaces form state from the saved response.

## 5. Form Contract

React Hook Form and Zod require at least one distinct Country plus registration and default Countries contained in the selection. Shared `MySelect` controls write `countryIds`, `registrationCountryId`, and `defaultCountryId`. Selector order is Operating Countries, Country of Registration, then Default Operating Country. Both single-selects remain disabled until an operating country is selected and expose only the current operating selection. Removing the current registration or default Country clears that field and exposes its field-level validation message.

## 6. Screen Composition

The responsive configuration screen composes a shared `PageHeader` multi-view switcher, three shared `MySelect` controls, `MyDataGrid`, `DataGridToolbar`, `SearchBar`, `CardViewHeader`, `EntityCard`, page/card states, buttons, and alerts. The selectors own the editable aggregate selection; Grid and Card adapters only present the selected subset and its compact legal-registration/default-operating indicators. They do not duplicate the Countries collection Grid or its archive, lifecycle, server-search, or permission logic.

The complete active Country catalog is already returned by the aggregate GET. The selectors use that catalog locally, while Grid and Cards display only the selected subset. Search, sorting, and Grid pagination over that subset are client-side. Grid and Cards share one local search term; Cards add localized client-side name ordering and intentionally do not paginate because the displayed aggregate selection is already fully loaded. The shared Grid footer remains responsible for Grid page size and navigation.

## 7. Permission and Read-only Behavior

Navigation visibility is derived from route access, while the page also guards direct entry. Users with View but without Manage can inspect the disabled selectors and selected/default indicators. Missing Manage permission, read-only mode, and an in-flight save disable both selector controls; saving remains separately guarded with explicit feedback.

## 8. Localization and Direction

English and Arabic namespaces contain labels, validation, feedback, and explanatory copy. Country display names follow the active language. Layout relies on shared logical-direction behavior.

## 9. Error and Empty States

Load errors expose retry. Save failures use the shared API error path. Grid and Cards distinguish an empty selected set from an empty local-search result, and the existing form validation prevents saving an empty selection.

## 10. Navigation Integration

The Basic Data navigation adds an Organizational Structure group and an Operating Countries item using the canonical route and permission policy.

The tenant Basic Data navigation does not expose Country/State/District master
management. That global catalog is reused under `/super-admin/geography/*` and is
guarded by the `super_admin` role in addition to action permissions.

## 11. Reusable Components

Do not build feature-local select, Grid, pagination, toolbar, search, button, card, alert, query-client, authorization, or read-only primitives. Reuse `MySelect`, `MyDataGrid`, and their shared behavior. A feature adapter may own only entity-specific columns and translation between shared component events and the feature contract. Extend shared components only when the behavior is genuinely cross-feature.

## 12. Capability Matrix

Configuration is Required and is presented through selectable Grid and Card views. This is not a collection-management Grid and adds no Country CRUD endpoint. Chart, Report, Import, Export, bulk lifecycle actions, lifecycle controls, and realtime notifications remain Excluded or Deferred by the shared manifest.

## 13. Integration Rules

Branch/Address forms may consume this query to constrain operating-location Countries. Their State/District queries follow the branch's chosen Country, not the company default or registration Country. Company statutory forms use the registration Country. Employee nationality forms must keep using the global Country lookup.

## 14. Verification and Handoff

Verification covers local search by both localized names and ISO codes, removing a current registration/default through the multi-select, restricted special-country options, view-only behavior, and the exact aggregate PUT payload. Type checking and targeted linting must cover the feature adapter plus the shared components it composes.
