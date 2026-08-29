# Company Geographic Scope Feature Full Review

Status: Canonical cross-platform reference for configuring the current company's operating geography.

Reviewed: 2026-08-25

## 1. Review Manifest

The feature preserves the global `Country -> State -> District` catalog and adds a company-owned selection layer. The API profile is [Company Geographic Scope API](../api/CompanyGeographicScope_API_Implementation_Profile.md), with applied [web](../web-next/features/company-geographic-scope-frontend-reference.md) and [mobile](../mobile-react/company-geographic-scope-mobile-reference.md) profiles.

## 2. Product Boundary

`CompanyCountry` means a Country in which the current company operates or may locate an address. It is not a private copy of Country data. Employee nationality always reads every active global Country and must never be filtered by this feature.

Company and Branch location ownership is modeled through explicit `CompanyAddress`
and `BranchAddress` links. Each link records a purpose and whether it is the
primary location, so a company or branch can have multiple addresses without
putting ownership or default semantics on the shared Address row. A branch may
select any Country enabled for the company and then an optional State and
District belonging to that Country. Two branches may be in different States or
Countries. `DefaultCountryId` only pre-fills a new address form.

## 3. Frozen Contract

The current company selects 1-100 distinct active Countries and exactly one selected default. Scope is derived only from the authenticated actor; clients never submit tenant or company identifiers. The read response is one aggregate containing every active global Country with selection/default flags.

## 4. Ownership and Isolation

`Country`, `State`, and `District` remain global. `CompanyCountry` is tenant/company scoped through `CompanyAuditableEntity`, EF global filters, and trusted `ICurrentActor`. A unique company-country link prevents duplicates and a filtered unique index permits at most one active default.

## 5. Capability Decisions

This is a configuration form, not a collection feature. Web and mobile present the bounded aggregate through their shared selectable data tables for clearer search, paging, selection, and default-country assignment; this does not add Country CRUD or a second list endpoint. Cards, Chart, Report, Import, Export, notifications, and public lifecycle endpoints are excluded. Realtime is deferred until a second live consumer exists.

## 6. API Contract

`GET /api/v1/company-geographic-scope` reads the aggregate. `PUT /api/v1/company-geographic-scope` atomically replaces it using `{ "countryIds": [65], "defaultCountryId": 65 }`. Permissions are `CompanyGeographicScope:View` and `CompanyGeographicScope:Manage`.

## 7. Client Contract

Web uses the shared Grid, toolbar/search, footer pagination, form, state, permission, read-only, localization, and query-cache components. Mobile uses the shared selectable `AppDataTable`, search field, table pagination, form, and the same application guards. Each feature adapter owns only scope-specific columns, default-country action, and event-to-form mapping. Both invalidate the aggregate query after save. Navigation visibility never replaces direct route and screen guards.

## 8. Lifecycle and Migration

Replacement activates selected historical links, soft-deletes removed links, clears the previous default, then sets the new default inside the serialized command transaction. The current checkout contains CompanyCountries in the initial schema; a dedicated additive backfill/permission migration must be reviewed before applying this feature to an existing production database.

## 9. Risks and Deferred Work

The master catalog is Platform-owned and available only to `super_admin`; tenant administrators configure operating Countries through this feature. Address/Branch owner-link commands are the next integration surface and must consume Company Geographic Scope plus validate the full Country -> State -> District hierarchy server-side. Employee nationality must deliberately continue using the global Country lookup. An Address cannot be archived while an active CompanyAddress or BranchAddress link owns it.

## 10. Handoff Rule

Future Branch or Address features must filter operating address choices by this aggregate, validate the selected hierarchy server-side, create explicit purpose-based owner links, and treat the default as convenience only. Future Employee features must use the global active Country lookup for nationality. No consumer may infer that all branches share one location.
