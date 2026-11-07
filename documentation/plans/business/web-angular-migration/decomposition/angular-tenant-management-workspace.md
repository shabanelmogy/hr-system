# Super Admin Tenant Management — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A1 — Super Admin Tenant Management parity |
| Child Feature ID | angular-tenant-management-workspace |
| Child feature name | Super Admin Tenant Management parity |
| Owner | Platform Tenants; existing tenancy application remains authoritative |
| Depends on | angular-states-workspace Closed; angular-districts-workspace Verified/closure; existing role-home and shared form/collection foundations |
| Execution status | Closed |
| Runtime authorization | D42 complete current Next Super Admin parity; G0-G3 resolved below; Phase00 generation/check required before runtime; remaining G4 release-only PROD-019/028/RISK-020 |

## 1. Child boundary and outcome

Implement the existing /super-admin/tenants workflow: authoritative Grid/Cards,
search/sort/page, structured five-tab create/edit with subscription/capacity,
contact, module/submodule entitlements and notes. Activate its real Dashboard and
sidebar entry only with its real route. Existing dashboard summary is retained.

Requester amendment2026-11-06: Add Tenant becomes a full page at
/super-admin/tenants/new with the existing five-tab form, a live read-only draft
summary and a clearer responsive layout. Edit retains its dialog. This intentionally
adapts the source container under C-01; fields, validation and one atomic save are
unchanged. Reuse one feature form composition and shared controls in both surfaces.
Keep direct-link role/read-only guards and shared unsaved navigation protection.

No new business rule, permission catalog, tenant context bypass, database/schema,
API endpoint, native rewrite or engine. Tenant-admin management and operational
tools are siblings. Archive/restore/purge and includeArchived controls are API
capabilities absent from the current Next screen, Excluded from this parity slice.
They are not implemented as placeholders or silently treated as required UI.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.tenant-management | Web | /super-admin/tenants | Manage Tenant identity/subscription/capacity/entitlements | Server collection and structured aggregate editor | P-001 | C-01 dialog; embedded P-003 five-tab Signal Form; C-02 Grid/Cards; C-03 shared feedback; no domain tree | web-next/src/platform/tenants/TenantManagementPage.tsx; components/TenantManagementMultiView.tsx; components/TenantsDataGrid.tsx; components/TenantsCardView.tsx; tenantFormTabs.ts | Adapted | Grid/Cards/create/edit Detail Required; standalone view/Tree/Report/Import/Export/Chart Excluded | Initial/background/empty/error/forbidden; lookup failure; dirty/pending/field/duplicate/rowVersion conflict/uncertain | Online authoritative; no local persistence or queued writes | No generator in current Next Tenant editor; Excluded rather than invented | Existing API super_admin role only; no invented Tenants:*; read-only bars writes | EN/AR390/1440; tabs keyboard; first invalid tab then focus; shared errors/summary/scroll | Enforce known server-positive seat counts and maxAdmins<=maxUsers rather than permit rejected values |
| platform.tenant-management | Mobile | Existing native TenantManagementScreen | Retain current native behavior | Existing native aggregate screen | N/A | New native UI Excluded | mobile-react/src/platform/tenants/presentation/screens/TenantManagementScreen.tsx | Excluded | All new native capabilities Excluded | Retain current native states | Existing native policy unchanged | No new generator | Existing native global authority | Compact browser is Web scope | No native conversion or business change |

## 3. Closest existing reference

The exact source is Next TenantManagementPage, tenantValidation, tenantFormTabs,
entitlements, tenantApi/Schemas/PageQuery and TenantManagementMultiView. P-003
explicitly names this source in the Screen Pattern Catalog. Countries/States/
Districts provide current Angular lifetime/shared composition references only;
do not copy geography fields, lifecycle, Import/Report/Chart or their action grants.

## 4. Reuse and composition contract

Reuse MyDataGrid/CardList/PageHeader/DialogPanel/FormContainer/ContentTabs,
TextField/BooleanField/NumericField/DateField/ReferenceField and shared feedback,
FormCloseGuard/UnsavedChanges/createScopedRead. Five-tab identity/subscription/
contact/entitlements/notes composition stays feature-owned and split into small
components. The nested entitlement editor is domain-specific composition of shared
controls, not a second form system or JSON input. Shared owns accessibility,
validation reveal/focus and visual policies; extend only an evidenced reusable gap.
Consult PrimeNG MCP before changing a shared control. No schema renderer/CRUD base.

## 5. Screen and workspace contract

Grid/Cards share one controlled server reader and exact page/search/sort state;
default name ASC/page1/size10/includeArchived=false. Search covers name/identifier/
billingEmail; sort only name/identifier/createdOn. No extra lifecycle filter.
List displays identity, plan/status/enabled, admin/user capacity, companies and
total account usage, creation date; cards also show subscription dates. Shared
options/pager/record navigation/reset/loading/error/empty remain available.

Create uses a full routed page with shared PageHeader, SurfaceCard and FormContainer;
edit uses the shared DialogPanel. No stepper or extra business action is introduced.
Editor tabs: identity(identifier/name/isActive); subscription(planName/status/
start/end/maxAdmins/maxUsers); contact(billingEmail/contactName/contactPhone);
entitlements(moduleCode/submoduleCodes[]); notes. On invalid submit reveal the
first invalid tab and focus that field after it is mounted. Save remains enabled
for invalid drafts, with precise underneath-field feedback. Keep hidden tab data.

## 6. Typed transport and server criteria

Exact retained endpoints from web-next/src/config/api/tenants.ts:
GET /api/v1/tenants/getPage and /get/{id}; POST /create; PUT /update/{id}.
Entitlement catalog GET /api/v1/modules/tenant-entitlements has separate read
lifetime from accessible navigation modules; do not substitute /modules/accessible.

GET parameters pageNumber/pageSize1..200/columnName/operation/sortDirection/
searchValue/includeArchived, exact metadata consistency and bounded query parsing.
Tenant identity is a string, not a geography Int32. Response includes usage,
lifecycle metadata, concurrency rowVersion and nullable entitlement data; validate
untrusted responses and duplicate IDs/codes. Update requires the real rowVersion
from fresh GET detail. No synthetic revision or last-write-wins retry.

### Permission Action Matrix

| Action | Existing API | Exact authority | Client barrier |
| --- | --- | --- | --- |
| List/detail | GET tenants/getPage, get/id | super_admin role only | Route/sidebar/read and current actor; no invented resource permission |
| Entitlement choices | GET modules/tenant-entitlements | super_admin role only | Independent ready/error/forbidden snapshot; no accessible-catalog fallback |
| Create | POST tenants/create | super_admin role only | Read-only/pending/invalid/uncertain guards; no automatic retry |
| Edit | PUT tenants/update/id | super_admin role only | Active lifecycle, fresh detail+rowVersion, read-only and actor recheck |
| Dashboard link | Existing summary route to tenant route | super_admin role only | Real available destination; no reusing geography navigation token |
| Archive/restore/purge/import/report/export | Absent from current Next UI | Excluded in this slice | No buttons, fake grants or placeholder APIs |

## 7. Create, edit, view, and lifecycle contract

Identifier trimmed1..100 alphanumeric/hyphen with alphanumeric first character;
name1..200; plan100/email256/contactName200/phone32/notes2000. Status is exactly
free/trial/active/pastDue/suspended/expired/cancelled. Native Boolean switch for
isActive, numeric text controls with positive Int32 maxAdmins/maxUsers and
maxAdmins<=maxUsers, cannot lower below existing usage. API validation remains
authoritative. Correct the known Next maxUsers>=0 mismatch without changing API.

Date-only UI start/end both required as in the actual Next form; real calendar
dates, end>=start, transport UTC start00:00:00 and end23:59:59. Legacy nullable end
loads as empty and must be completed on save, matching current source behavior.
Optional text maps trim-empty to null. Do not clamp invalid numbers into defaults.

Entitlements are an interactive module/submodule selection. Create defaults from
isDefault catalog modules and their child codes; edit loads saved values. Null
server entitlements have source-default semantics; explicit empty array is retained.
Do not silently drop unavailable saved codes and save a changed grant set: surface
a catalog compatibility error until a valid authoritative selection is available.
No hard-coded module catalog or arbitrary JSON. No additional native UI changes.

## 8. UX states, permissions, offline, and mock data

Scoped page/detail/lookup state cancels and masks on actor replacement. Loading,
background read, lookup empty/forbidden/error/retry, dirty, pending and conflict
remain distinct. General failures use bounded public guidance, explicit server
field errors win, and known domain codes map only where supported. No browser
dialogs, hidden invalid tab, duplicated error store, direct UI HTTP, offline writes
or sample records masquerading as actual tenants. Mock generator Excluded by source.

## 9. Concurrency, transactions, and consistency

Real rowVersion required for update. Tenant.ConcurrencyConflict retains user draft
and reports a conflict; a fresh reload is explicit, never blind automatic replay.
Uncertain dispatched result locks replay and reconciles server reads. Successful
create/update refreshes the mounted list or returns the create page to a new list
reader. DashboardState is component-scoped with no retained cache and fetches its
summary on the next Dashboard route mount;
no invented module/session logout behavior. Server atomically creates Tenant,
DEFAULT company, entitlements and audit, and may notify contact phone; client never
duplicates those side effects. No hosted business writes for verification.

## 10. i18n, RTL, accessibility, and responsive behavior

Reuse core/platform-tenants resources EN/AR and existing module labels; catalog
generation only for evidenced gaps, matching publication stays PROD-019. Logical
layout, keyboard tabs/module switches/paging, first-invalid focus and summary error
links must work for hidden tabs. No component-local copies of shared visual shells.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Existing source/controller/policy/adapter traced | Frozen endpoints/role/date/seat/concurrency/entitlement contract; no API change | documentation/modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-api.md |
| 2 | Web | Verified | D42 and this contract; Phase00 check required | Full current Next Grid/Cards and five-tab create/edit; all required tests/browser | documentation/modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-web.md |
| 3 | Mobile | Verified | Web acceptance | Explicit retained native and compact-browser distinction | documentation/modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-mobile.md |
| 4 | Integrated live verification | Verified | Client complete | Fixture writes, authoritative hosted reads only; external limits recorded | documentation/modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-evidence.md |
| 5 | Documentation and closure | Verified | Phase06 Verified | Canonical books/manifests/education regenerated; next sibling only afterward | documentation/modules/platform/features/angular-tenant-management-workspace/angular-tenant-management-workspace-review.md |

**Next-step rule:** Tenant-admin and other Super Admin siblings remain Queued until
this feature's Required runtime verification, canonical documentation and education
are complete. Existing hosted-report release gates remain separate and are not
silently marked Verified by this Tenant client implementation.

## 12. Verification contract

Meaningful DTO/query/date/seat/entitlement/concurrency/actor/uncertain tests, native
Signal Forms and first-invalid tab/focus evidence, full npm run check. Browser
EN/AR/light/dark/390/1440 exercises actual shared Grid/Cards/options/page/search/
sort/reset, create/edit all five tabs, server errors, dirty/pending/conflict/uncertain
and denied role/read-only. Five-point creation/edit/view/list/mock audit records
mock Excluded and native unchanged. No real hosted Tenant writes or notifications.

## 13. Child exit gate

- [x] G0 actor/source/scope and G1 P-001/P-003 fixed; G2 API/shared/owner contracts
  and G3 bounded existing semantics plus concrete verification are resolved.
- [x] Phase00 books/request/review/current-only manifest generated and checked (484recipes; planning passes with two inherited unrelated migration warnings).
- [x] All Required runtime/tests/browser/source parity pass (747tests/135files, browser8/negative28/navigation24).
- [x] Phase06 records Verified with exact remaining external release boundaries.
- [x] Phase07 education/canonical closure complete;484recipe check/planning pass before next sibling activation.

Remaining G4 release-only catalog publication, hosted provider reporting and startup
budget retain PROD-019/028/025/RISK-020. These do not authorize API/schema changes or
silently waive a Tenant implementation defect. Tenant-admin and operational-tool
siblings and final comprehensive Super Admin review remain Required.
