# Super Admin Tenant Administrators — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

Current authorized Angular organization (2026-11-08): remove the standalone
sidebar destination; Add/Edit Tenant exposes the existing administrator workspace
as a scoped tab inside Tenant details. The Tenant list has no extra outer tabs.
Preserve the existing global administrator URL for compatibility, account-wide
operations and unassigned accounts. Display/count/export respect the supplied
saved Tenant ID in the embedded workspace; existing multi-tenant account edits
and account-wide archive confirmation remain unchanged. Current canonical source
and verification: [tenant editor refinement](../../../../modules/platform/features/angular-tenant-management-workspace/TENANT_TABS_AND_EDIT_2026-11-08.md).

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A2 — Super Admin Tenant Administrators parity |
| Child Feature ID | angular-tenant-admins-workspace |
| Child feature name | Super Admin Tenant Administrators parity |
| Owner | Platform identity/tenancy administration |
| Depends on | angular-tenant-management-workspace Verified client and education; shared controls/forms/collections |
| Execution status | Closed within authorized Angular client contract2026-11-06 |
| Runtime authorization | D42 complete current Next Super Admin parity; G0-G3 resolved below; Phase00 generation/check required before runtime; remaining G4 release-only PROD-019/028/025/RISK-020 |

## 1. Child boundary and outcome

Implement /super-admin/tenant-admins matching the current Next page: cards with
name/email/username, active/disabled/locked status and assigned Tenant/default chips;
create/edit modal with firstName/lastName/userName/email/password/tenantIds/
defaultTenantId/isDisabled (disabled switch edit only), plus confirmed Delete.
Delete calls the existing archive endpoint; do not invent permanent deletion.
Use role-only super_admin and preserve read-only write barriers.

Grid/search/sort/paging, standalone Detail, Chart/Tree/Report/Import/Export,
restore/includeArchived UI and mock generator are Excluded by the actual Next
screen. No new API/domain/schema/dependency/native rewrite. Follow-up operational
screens remain separate coherent features.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.tenant-admins | Web | /super-admin/tenant-admins | Manage global administrator accounts and Tenant access | Complete server collection and aggregate form | P-001 | C-01 shared dialog; C-02 Cards only; shared multi-reference for memberships | web-next/src/platform/tenant-admins/TenantAdminManagementPage.tsx; tenantAdminApi.ts; tenantAdminApiSchemas.ts | Adapted | Cards/create/edit/delete Required; Grid/Table/standalone Detail/Tree/Report/Import/Export/Chart Excluded | Loading/error/retry/empty/403; lookup loading/error/403; dirty/pending/field/duplicate/seat/uncertain | Online authoritative; no queued writes | Excluded because source has none | Existing super_admin role only; read-only blocks writes | EN/AR390/1440/light/dark; modal focus/labels/errors; keyboard multi-select; contained scroll | Fresh detail before edit; validate known API min8 password and active assignments; no rowVersion invented |
| platform.tenant-admins | Mobile | Existing native TenantAdminManagementScreen | Retain current native behavior | Existing native cards/forms | N/A | New native work Excluded | mobile-react/src/platform/tenant-admins | Excluded | All new native surfaces Excluded | Retained current native states | Retained policy | No new generator | Existing native authority | Compact Web is not native acceptance | No native conversion or domain change |

## 3. Closest existing reference

Actual Next TenantAdminManagementPage/AdminCard/TenantAdminForm/toForm are the
parity reference, including complete getAll collection and default-tenant repair
to first selected when current default is removed. Angular Tenant Management
provides current service/state/form/close/dirty/shared composition discipline only;
do not copy its subscription fields, rowVersion or Grid/pager.

## 4. Reuse and composition contract

Reuse PageHeader/CardList/SurfaceCard/StatusBadge/RowActions/DialogPanel/FormContainer/
TextField/BooleanField/ReferenceField/ConfirmationDialog/FormCloseGuard/scoped read.
CardList exposes the existing CollectionFrame.showFooter option for unpaged lists;
no extra collection shell. No existing shared multiple reference input exists:
add a generic MultiReferenceField using PrimeNG MultiSelect, current ReferenceOption
IDs, FormFieldControl error/touch/readOnly and the existing field chrome. Consult
PrimeNG MCP metadata/example and validate final usage; use installed22.1.4 APIs.
Feature states own HTTP lifetimes/commands; small form identity/access groups and
card components own domain presentation only. No engine, parallel form registry,
feature-local multiselect or direct HTTP in visual components.

## 5. Screen and workspace contract

Shared header, create action and responsive complete Cards. getAll retains server
firstName/lastName order; no local search/sort/filter/paging or fake page requests.
Unpaged CollectionSource contains every returned record and hides footer/toolbar.
Disabled takes precedence over locked, then active. Assigned Tenant chips mark the
default with a translated label. Shared edit/delete actions recheck current actor,
readOnly and record membership. Form reuses one Signal Form with first-invalid
focus and summary, persistent draft and shared dirty/pending close protection.

## 6. Typed transport and server criteria

GET /api/v1/tenantAdmins/getAll and /get/{id}; POST /create (201+DTO), PUT /update/{id}
(200+DTO), DELETE /delete/{id} (204). GET /api/v1/tenants/getAll supplies independent
assignment options through the owning Tenant Management service/public lookup API.
Do not replace it with the first200rows of a page or duplicate Tenant DTO/service.
No list query parameters. Validate unknown bodies, string IDs, booleans, lifecycle,
duplicate identities and nested assignments/company IDs; retain existing empty
default/assignment snapshots for display and require valid assignments on save.
Fresh detail must match requested ID and active lifecycle before editing.

### Permission Action Matrix

| Action | Exact existing authority | Client barrier |
| --- | --- | --- |
| List/detail/Tenant choices | super_admin role on controllers | Route/nav/state actor scope; 403 masks stale data |
| Create/update | super_admin role only | readOnly/current actor/pending/valid assignments/uncertain guard |
| Delete/archive | super_admin role only | current record, shared explicit confirmation, pending/uncertain guard |
| Restore/includeArchived/paging/report/import | Excluded by source screen | No placeholder buttons or invented grants |

ProblemDetails.title is the exact domain/Identity code. Map only allow-listed codes
to public translated guidance; explicit known field errors win. Known TenantAdmin
codes: NotFound/DuplicateEmail/DuplicateUserName/InvalidTenants/AdminSeatLimitReached.
Known Identity password/duplicate/invalid-username codes map to corresponding
fields; never render raw detail, unknown title or arbitrary error.message.

## 7. Create, edit, view, and lifecycle contract

Required trimmed first/last/username/email. Email/username max256 from Identity
schema; email syntax check. Create requires password; edit leaves it blank and
omits it to preserve password, accepts explicit replacement. Match source trim
before submission. Known server minimum8 from identity registration; server remains
authority for remaining password policy and uniqueness. Never log/persist passwords.
Create has no isDisabled API field; update sends it explicitly. No unlock action.

At least one assigned Tenant; default must belong to selection. Selecting/removing
Tenant IDs maintains default as current valid or first selected (source behavior).
Only active enabled Tenants can be assigned by the API; display saved unavailable
IDs without silently deleting them, explain and require explicit removal/replacement.
Seat limits remain server authoritative; map AdminSeatLimitReached to tenantIds.

## 8. UX states, permissions, offline, and mock data

Separate list and choices snapshots, actor-scoped cancellation and synchronous
masking. List/detail/lookup errors allow explicit retry; authoritative403 cannot
be bypassed with retry. Save stays enabled for invalid input and reveals specific
under-field feedback. Dirty close/navigation use shared consent. Pending forbids
close/replay; uncertain dispatched writes retain draft, lock replay and reconcile
reads only after explicit close. No native browser feedback or offline storage.

## 9. Concurrency, transactions, and consistency

Existing TenantAdmin requests have no rowVersion; do not invent optimistic locking
or claim protection the server lacks. Create/update transaction, role assignment,
company access and session/security-stamp revocation are API-owned. Update and
archive revoke affected account sessions; client does not duplicate these effects.
Delete is archive, success refreshes current list. No hosted business writes in
verification. Successful operations invalidate draft before navigation/acceptance.

## 10. i18n, RTL, accessibility, and responsive behavior

Reuse core/platform-tenants EN/AR captions; new messages authored in both canonical
Next locale files then generate catalog. Publication remains PROD-019. Shared
logical layout, labels/help/aria-invalid, validation-summary links, first invalid
focus, modal keyboard and MultiSelect selected chips/clear/filter/readonly must
work at390/1440 in both modes. Native UI remains unchanged.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing controller/contracts/adapter inspected | Frozen source authority/semantics; no API change | documentation/modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-api.md |
| 2 | Web | Verified | D42/current contract; Phase00 generation/check before runtime | All Required cards/form/actions and full gates/browser | documentation/modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-web.md |
| 3 | Mobile | Verified retained-source boundary | Web verified | Explicit retained-native contract | documentation/modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-mobile.md |
| 4 | Integrated live verification | Verified read-only/client scope | Client ready | Fixture commands and actual read-only hosted surface; precise limits | documentation/modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-evidence.md |
| 5 | Documentation and closure | Closed | Phase06 Verified | Education/manifest/generated books and parent handoff | documentation/modules/platform/features/angular-tenant-admins-workspace/angular-tenant-admins-workspace-review.md |

## 12. Verification contract

**Next-step rule:** audit/error/settings/advanced-tool siblings stay Queued until
this feature's required runtime, Phase06 verification, education and canonical
documentation closure are complete. Source references do not authorize skipping
any Required behavior or claiming hosted mutation/native acceptance.

DTO/membership/default parsing; create/edit/password omission/identity error mapping;
CSRF/exact status/id validation; actor/readOnly/cancel/pending/uncertain lifetimes;
shared multi-select readOnly/invalid/selection retention; unpaged Cards default
compatibility; full Angular check. Browser EN/AR/modes/widths covers Cards/status/
assignment/default chips/create/edit/delete, all8fields, validation focus, selected
default repair, dirty/pending/uncertain, duplicates/seat/lookup/403 and nooverflow.
Actual hosted reads only; no password reset/archive/create on real users. Five-point
UI audit marks native retained and mock generator Excluded.

## 13. Child exit gate

- [x] G0 source/actor/scope, G1 P-001/C-01 Cards/dialog, G2 API/shared/owner contract
  and G3 checks/no schema change resolved from current source.
- [x] Phase00 initial books/request/review/current-only manifest generated/checked (492recipes and planning pass with two inherited warnings).
- [x] All Required client/tests/browser/source review pass.
- [x] Phase06 Verified with exact hosted/native/release limits.
- [x] Phase07 education and canonical closure before next sibling.

Remaining G4 release-only PROD-019/028/025/RISK-020 are external and do not waive a
TenantAdmin defect or authorize new API/native/schema changes. Audit/error logs,
settings/operational tools and final whole-Super-Admin review remain Required.

Current acceptance: TENANT_ADMINS_WORKSPACE_2026-11-06.md and its registered portable JSON. Full772test gate, positive8/negative32/reference8, three owner regressions and hosted read-only evidence. Parent objective Active.
