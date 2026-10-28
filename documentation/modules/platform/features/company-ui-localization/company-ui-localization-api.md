# Company UI localization — api

API implementation status: Implemented and focused tests passed 2026-10-17.
## 1. Ownership
Platform Application/Domain/Infrastructure/Presentation own the company-scoped API.
## 2. Scope
EN/AR default and catalog-registered overrides only; global file-backed localization is unchanged.
## 3. Domain
`CompanyLocalizationSettings` and child overrides provide one revision and exact placeholder policy.
## 4. Validation
Handlers validate client, strict catalog version, source, key, language, non-empty value and expected revision. Equal base/target text-query cultures are permitted.
## 5. Authorization
Controller uses exact View/Edit/Reset/SetDefault permissions. Runtime uses TenantMember and no admin permission.
## 6. Contracts
The scoped endpoints return actor-derived tenant/company. `client` is allowlisted to web/mobile; `catalogVersion` must equal the embedded client hash.
## 7. Querying
Scope correction: settings omit sources containing only system entries; text filters/search/paging/counts run after entry eligibility filtering. Application rejects direct system-source reads and system-key set/reset with Forbidden. Infrastructure independently denies system set/reset and suppresses previously stored system entries from both runtime clients. Embedded schema version 3 requires a valid scope on every entry; classification changes both catalog fingerprints. No DTO shape, schema, migration, permission, or route is added.

Texts are source-bounded, deterministic, filtered and server-paged. Runtime returns only sources for the requested client and only compatible catalog entries.
## 8. Persistence
Scoped EF filters, unique settings and override indexes, company lock and expected revision protect the aggregate.
## 9. Side effects
Changed writes add an audit event in the same transaction; no stamp invalidation, provider call or filesystem write occurs.
## 10. Verification
Settings, handler/store/controller tests and catalog generation/check cover aggregate, scope, fingerprint, client isolation and endpoint metadata. Migration `20261017035730_AddCompanyUiLocalization` exists and was applied to development as recorded in evidence.

Maintenance verification (2026-10-27): the embedded catalog now has 21 sources,
including the approved `web:platform-messages` namespace. The stale 20-source
assertion was corrected, and the regression test also requires a non-empty message
source whose entries all retain company scope. The focused localization suites
pass 19 tests; the complete Platform suite passes 337 tests with no failures or
skips. The subsequent full Release solution run passes all 1,125 tests in 12
assemblies, including real SQL integration tests. This is a test-contract
reconciliation only: API behavior, catalog contents,
wire contracts, client UI and database schema are unchanged. The generator check
remains the authority for shipped resource/fingerprint parity.
## 11. Evidence and closure
The scope-correction run completed all 12 API suites serially (1,034 passed, 0 failed), including 274 Platform tests. Applied migrations and 19 authenticated HTTP checks are recorded in evidence. Phase 06 is Verified for the authorized automatic scope; PROD-026 remains separate.
## 12. Reuse
`PlatformDbContext.ExecuteAtomicallyAsync`, actor scope filters and existing security audit owner are reused.
## 13. Localization/accessibility
API errors use Platform localization; no client text is stored outside validated EN/AR values.
## 14. Delivery
The embedded catalog is generated from shipped client resources and deployed with matching fingerprints.
## 15. Risks
Catalog/version deployment skew is fail-closed for runtime overrides and safely leaves static client strings in place.


## Settings workspace reconciliation — 2026-10-19

The requester supersedes the earlier independent Settings section: Administration now contains one Settings destination and its existing configuration workflows are actual shared tabs. Web /administration/settings uses FormTabs; Mobile /settings uses AppFormTabs and retains local device preferences. Child authority, services, edit forms, scopes, read-only and revision/conflict behavior remain owned by this feature. Error Logs viewers stay Administration siblings; retention remains a system-only tab. Existing direct child URLs remain compatible. No API/domain/schema change or migration. Current composition and acceptance are canonical in ../platform-settings/platform-settings-review.md and platform-settings-evidence.md; older dated navigation descriptions are historical.

System UI extension (2026-10-19): the catalog protocol is now version 3 and includes explicit nullable systemPermissions per registered entry; authority metadata participates in client fingerprints. Company/shared/system eligibility and actor-derived company contracts remain unchanged. The existing editor/controller and runtime registry support a separately authorized global mode/layer, documented by feature system-ui-localization; global responses never simulate company scope. Additional Web criteria use shared MyDataGrid.toolbarFilters, and native Table/Cards/forms retain their shared composition. New global scopes/labels are excluded from company customization. Publish matching API/Web/Mobile catalog artifacts together.
