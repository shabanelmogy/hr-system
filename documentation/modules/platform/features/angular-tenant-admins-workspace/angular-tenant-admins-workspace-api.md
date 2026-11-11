# Tenant Administrators — retained API applied profile

## 1. Ownership

Platform identity/tenancy administration is authoritative. D42/S4-A2 freezes this existing-source parity slice; no API/domain/schema/native/dependency rewrite.

## 2. Current verified source

Current Next TenantAdminManagementPage/TenantAdminForm/AdminCard and API controller/contracts/adapter were traced. Angular implements the complete unpaged Cards/create/edit/delete workflow, eight draft fields, fresh detail, complete Tenant choices, native validation, default repair and role-guarded entry. Phase06 is Verified2026-11-06 within the authorized Angular client scope. Current report and receipt: TENANT_ADMINS_WORKSPACE_2026-11-06.md and verification/TENANT_ADMINS_WORKSPACE_2026-11-06.json. No API/domain/schema/native rewrite.

## 3. Data contracts

String user/Tenant IDs, first/last/username/email, disabled/locked, defaultTenantId, Tenant membership chips, companyIds and lifecycle snapshot. Existing empty membership/default snapshots can display; valid nonempty membership/default required on save. No rowVersion in this API.

## 4. Business rules

API role super_admin only; readOnly bars commands. Unique email/username, selected active-enabled Tenants, default belongs to selection, administrator seat limit. Required source fields and known min8 password; edit blank password omitted, create omits isDisabled. Server owns Identity policy and atomic assignment/session effects.

## 5. Platform capability decisions

Web Cards/create/edit/delete Required; Grid/Table/search/paging/standalone Detail/Chart/Tree/Report/Import/Export/restore/includeArchived/mock generator Excluded by current source. Native existing behavior retained; new native work Excluded.


2026-11-09: shared Angular multi-selection presentation is corrected in
[MULTISELECT_PRESENTATION_2026-11-09.md](MULTISELECT_PRESENTATION_2026-11-09.md).
API/schema/native runtime changes are Excluded for this client-only correction.

## 6. Transport

GET tenantAdmins/getAll/get/id, POST create201+DTO, PUT update/id200+DTO, DELETE delete/id204. Assignment lookup uses tenants/getAll through the owning Tenant service/public lookup contract; no first-page truncation. Exact HTTPS+credentials+CSRF for writes, finite timeout and unknown-response validation.

## 7. Shared composition

Reuse CardList/PageHeader/SurfaceCard/StatusBadge/RowActions/DialogPanel/FormContainer and shared fields/confirmation/dirty guards/scoped reads. CardList.showFooter=false supports the actual unpaged source. Generic layout=fit/minCardWidth320 matches the Next auto-fit320px card arrangement without altering existing defaults. MultiReferenceField uses installed PrimeNG MultiSelect, FormFieldControl and bounded Reactive Forms compatibility; no engine. MCP usage metadata validation passes; browser separately proves actual combobox help/error/invalid/required/readOnly/focus. The sparse central preset registers MultiSelect/Chip/IconField themes. Removing the local display:block rule restores native vendor chip/dropdown alignment with observed geometry red/green proof. Body-attached panels wait for exit before scripted reopen. Shared Angular headers/fields/cards/actions and contained scrolling follow requester-approved reuse/layout rules; no duplicate MUI shell is introduced. Domain components own no HTTP.

## 8. States and lifetime

Separate actor-scoped list/detail/Tenant choices; mask/cancel on authority change. Initial/background/empty/error/retry/403, dirty/pending and uncertain distinct. No automatic dispatched replay. Invalid submit remains enabled with under-field errors and first-invalid focus. Unavailable saved membership is never silently deleted.

## 9. Consistency and effects

Delete archives and revokes affected sessions; no restore UI in source. Update reassigns Tenant/company access and may reset password/revoke sessions within API transaction. No invented client side effect or optimistic concurrency guarantee. Fresh detail before edit; explicit confirmation for delete.

## 10. Localization and accessibility

Core/platform-tenants EN/AR; logical RTL, keyboard dialog/multiselect, accessible labels/descriptions/invalid state and error links. New bounded messages authored canonically then generated; PROD-019 controls publication.390/1440/light/dark browser acceptance required.

## 11. Implementation preflight

Current version2 contract and D42 establish G0-G3; only external G4 publication/reporting/startup scopes remain. Initial books/request/current-only manifest and registered Phase00 must pass generation/check/planning before runtime.

## 12. Verification

Phase06 Verified2026-11-06 for the exact authorized Angular client contract: full npm run check passes772tests/142files,30architecture,4configuration plus format/lint/catalog/tokens/fonts/types/build. Positive browser8 and negative32EN/AR/mode/width cases pass. Current Next source rendered8same-viewport reference cases pass; representative source/Angular captures reviewed. Regressions: Tenant Management1, States1, Districts1. Hosted read-only acceptance verifies admin collection200with1record, fresh detail200, complete Tenant lookup200with1record and owned logout204; businessWrites0. Independent source review and follow-up found no unresolved P1/P2. No hosted account creation/password reset/archive, native device or real report acceptance claimed. Initial578.42kB warning remains RISK-020. Portable report/JSON and source hashes registered in the manifest.

## 13. Operations

No database migration because domain/schema unchanged. Existing PROD-019, PROD-028/025 and RISK-020 retain exact release scopes. Passwords never logged or persisted by client. No commit/push/merge/publication.

## 14. Education

Phase07 Arabic customer education completed after the Phase06 Verified decision: documentation/plans/business/web-angular-migration/education/angular-tenant-admins-workspace.md. Describes Cards, all fields, selected/default Tenant behavior, password omission, disabled/locked distinctions, confirmed archive and error/retry/dirty/pending/uncertain recovery. Registered existing guide, no future placeholder.

## 15. Handoff

Tenant Administrators is Closed within the authorized Angular client contract. Tenant Management and States/Districts retain their existing accepted scopes. System audit trail is the next preflight; error logs/settings/system UI texts/advanced tools and the final whole-Super-Admin audit remain Required. Parent goal Active. No commit/push/merge/deployment or hosted business write. Existing PROD-019/028/025 and RISK-020 keep their exact external scopes.

## Current tenant workspace organization — 2026-11-08

The approved Angular workspace keeps the Tenant list directly under its one
Tenant Management navigation destination, without extra outer tabs. The separate
administrator sidebar entry is omitted; its existing global route remains
compatible, and the temporary /tenants/administrators URL redirects there.
Add/Edit use the same full-page editor; Administrators is a tab inside the Tenant
details card. Tenant Profile combines identity, billing/contact and full-width
Notes in one field grid without internal sections; only Profile, Subscription,
Applications and Administrators remain as tabs. Existing saved-tenant membership filtering,
scoped export and preselected administrator creation use the existing services.
An unsaved tenant requires its first save. Tenant overview matches details height
with internal scrolling; shared tabs own consistent panel insets.

No API/domain/schema change: current Tenant/TenantAdmin endpoints, rowVersion,
authorization and account-wide administrator archive semantics are retained.
Only canonical bilingual UI resources are regenerated; no hosted write.

Current source and verification: [tenant tabs and full-page edit](../angular-tenant-management-workspace/TENANT_TABS_AND_EDIT_2026-11-08.md).
