# Tenant Administrators — authorized implementation request

Implement the exact S4-A2 contract at documentation/plans/business/web-angular-migration/decomposition/angular-tenant-admins-workspace.md. No second product-design approval
is needed for requester-authorized D42 existing source parity. Phase00 gate still
applies. Web Cards/create/edit/delete and eight-field Signal Form are Required;
native is retained and new native work Excluded. No API/schema/dependencies.

## Existing-System Relationship Review

| Need | Owner and decision |
| --- | --- |
| Account and Tenant access | Existing Platform Identity/Tenancy APIs; reuse |
| Tenant choices | Existing Tenant Management service getAll projection; extend public lookup, do not duplicate DTO |
| Forms/collections | Existing Shared APIs; extend footer exposure, generic MultiReferenceField |
| Navigation | Composition root actual role-guarded /super-admin/tenant-admins route/sidebar |
| Other platforms | Next is current reference, locale source only; native retained |

## Business Rules Matrix

| Rule | Primary owner | Outcome/error | Required test |
| --- | --- | --- | --- |
| Unique username/email | Existing server | TenantAdmin.DuplicateUserName/DuplicateEmail; field mapping | exact title and explicit field precedence |
| Membership/default/seat | Existing server plus native form | InvalidTenants/AdminSeatLimitReached; default membership validation | missing/unavailable/default repair/seat feedback |
| Password | Identity; form known minimum8 | required create/omit blank edit/known Identity errors | create/update exact payload and errors |
| Current authority | API role; auth state | denied/readOnly/current actor | direct state and route barriers/cancellation |
| Delete | API archive |204; shared confirmation | pending/rejected/uncertain/status/refresh |

## Edge Cases & Validation Matrix

| Category | Decision and checks |
| --- | --- |
| Empty/malformed | unknown DTOs, duplicate IDs, empty/nullable lifecycle, missing fields fail safely; valid empty list stays empty |
| Duplicate | known email/username codes map beneath own input; raw details hidden |
| Relationships | complete Tenant lookup, multiple selection/default repair, unavailable saved IDs retained until explicit correction |
| Lifecycle | active list/detail; Delete archives, restore/filter Excluded; disabled/locked chips |
| Permissions | super_admin only; no invented grants; readOnly, stale actor and403 no retry bypass |
| Concurrency | no API rowVersion; fresh detail, no invented last-write guarantee; uncertain dispatch locks replay |
| Network | exact status/identity/CSRF, timeout, cancelled actor effects, explicit retry |
| Files/import/report | Excluded because source has none |
| Offline/mock | no queued writes/storage; mock generator Excluded; fixtures test-only |
| Side effects | server only assigns roles/company memberships and revokes sessions; no actual host mutations |
| I18n/a11y | EN/AR/modes/390/1440; multiselect keyboard, summaries/focus, dirty/pending, nooverflow |

## Impact Matrix

| Area | Decision |
| --- | --- |
| API/schema/database | Reuse unchanged; migration N/A |
| Angular Platform | Add focused TenantAdmins owner; extend owning Tenant lookup API |
| Shared | Reuse existing shells; generic Multiple-reference control and footer passthrough only |
| Next/native | No runtime rewrite; canonical localization additions only |
| Documentation | Initial applied books and current-only manifest; extend with real runtime and verification |

G0-G3 resolved by current source. Remaining G4 release-only existing PROD-019/028/025/
RISK-020. Run full Angular quality gates and required browser journeys; Phase06
Verified before education. No automatic commit/push/merge/hosted account write.
