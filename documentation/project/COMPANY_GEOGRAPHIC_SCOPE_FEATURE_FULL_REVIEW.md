# Company Geographic Scope Feature Full Review

Status: Canonical cross-platform reference for configuring the current company's operating geography.

Reviewed: 2026-08-25

## 1. Review Manifest

The feature preserves the global `Country -> State -> District` catalog and adds a company-owned selection layer. The API profile is [Company Geographic Scope API](../api/CompanyGeographicScope_API_Implementation_Profile.md), with applied [web](../web-next/features/company-geographic-scope-frontend-reference.md) and [mobile](../mobile-react/company-geographic-scope-mobile-reference.md) profiles.

## 2. Product Boundary

`CompanyCountry` means a Country in which the current company operates or may locate an address. It is not a private copy of Country data. `Company.RegistrationCountryId` separately identifies the company's legal country of registration. Employee nationality always reads every active global Country and must never be filtered by this feature.

Company and Branch location ownership is modeled through explicit `CompanyAddress`
and `BranchAddress` links. Each link records a purpose and whether it is the
primary location, so a company or branch can have multiple addresses without
putting ownership or default semantics on the shared Address row. A branch may
select any Country enabled for the company and then an optional State and
District belonging to that Country. Two branches may be in different States or
Countries. `DefaultCountryId` only pre-fills a new address form and is never the
legal registration country by implication.

## 3. Frozen Contract

The current company selects 1-100 distinct active Countries, exactly one selected
legal registration Country, and exactly one selected default operating Country.
Registration and default may be the same or different, but both must belong to the
operating selection. Scope is derived only from the authenticated actor; clients
never submit tenant or company identifiers. The read response is one aggregate
containing every active global Country with selection, registration, and default
flags.

## 4. Ownership and Isolation

`Country`, `State`, and `District` remain global. `CompanyCountry` is tenant/company scoped through `CompanyAuditableEntity`, EF global filters, and trusted `ICurrentActor`. A unique company-country link prevents duplicates and a filtered unique index permits at most one active default. `Company.RegistrationCountryId` is a restrictive FK to the same global catalog; the scope command updates it within the same serialized transaction.

## 5. Capability Decisions

This is a configuration form, not a collection feature. Web and mobile present the bounded aggregate through their shared selectable data tables for clearer search, paging, selection, and default-country assignment; this does not add Country CRUD or a second list endpoint. Cards, Chart, Report, Import, Export, notifications, and public lifecycle endpoints are excluded. Realtime is deferred until a second live consumer exists.

## 6. API Contract

`GET /api/v1/company-geographic-scope` reads the aggregate. `PUT /api/v1/company-geographic-scope` atomically replaces it using `{ "countryIds": [65], "registrationCountryId": 65, "defaultCountryId": 65 }`. Permissions are `CompanyGeographicScope:View` and `CompanyGeographicScope:Manage`.

## 7. Client Contract

Web uses the shared Grid, toolbar/search, footer pagination, form, state, permission, read-only, localization, and query-cache components. Mobile uses the shared selectable `AppDataTable`, search field, table pagination, form, and the same application guards. Each feature adapter owns only scope-specific columns, registration/default indicators, and event-to-form mapping. Selector order is Operating Countries, Country of Registration, then Default Operating Country. Removing a selected registration/default value clears the dependent field and exposes normal field validation. Both clients invalidate the aggregate query after save. Navigation visibility never replaces direct route and screen guards.

## 8. Lifecycle and Migration

Replacement activates selected historical links, soft-deletes removed links,
clears the previous default, sets the new default, and updates the Company's legal
registration Country inside the serialized command transaction. Before any
replacement, the command rejects a selection that would exclude a Country used
by an active Address in the current company. Address writes and scope updates
share the same company-scope lock, closing the concurrent write/removal race. The additive
migration adds a nullable restrictive Country FK and backfills it only from an
active default CompanyCountry. Companies without a defensible default remain null
until an authorized first save supplies one; the migration never guesses from
currency, timezone, address, or tenant name.

## 9. Risks and Deferred Work

The master catalog is Platform-owned and available only to `super_admin`; tenant administrators configure operating Countries, legal registration Country, and default operating Country through this feature. Standalone Address create/update/restore already enforce Company Geographic Scope and the full Country -> State -> District hierarchy server-side. Address/Branch owner-link commands are the next integration surface and must add purpose-specific rules without duplicating that shared integrity logic. Employee nationality must deliberately continue using the global Country lookup. An Address cannot be archived while an active CompanyAddress or BranchAddress link owns it.

SAP-style Work Location, branch/location target-population authorization, and
effective-dated operating/location assignments are Deferred until a real employee,
attendance, scheduling, or location-management workflow consumes them. Branch is
already independent from Address; no placeholder WorkLocation table or client route
is created by this change.

## 10. Handoff Rule

Future Branch or Address features must filter operating address choices by this aggregate, validate the selected hierarchy server-side, create explicit purpose-based owner links, and treat the default as convenience only. Future Company/legal-entity workflows use `RegistrationCountryId` for country-specific statutory behavior. Future Employee features must use the global active Country lookup for nationality. No consumer may infer that all branches share one location or that the registration, operating default, work, residence, payroll, and nationality countries are interchangeable.
