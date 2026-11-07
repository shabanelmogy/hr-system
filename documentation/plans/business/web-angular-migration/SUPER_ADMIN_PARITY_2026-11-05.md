# Super Admin Angular parity — implementation sequence

**Goal:** Finish global geography States and Districts, then all currently
implemented Super Admin journeys, matching current web-next behavior and layout.
**Architecture:** Separate owner-scoped Angular features compose existing shared
controls and native Signal Forms. Existing versioned API and grants remain the
authority. No CRUD/Form Engine or blanket data-entry model is introduced.
**Tech stack:** Angular22.2.3, PrimeNG22.1.4, TypeScript6, existing dependencies.
**Spec:** D42, PLAN.md and each feature's version2 execution contract.

## Authority and user scope

Requester2026-11-05 explicitly narrowed the first work to States and Districts;
remaining screens match web-next. Company Basic Data, Address Types and HR
organizational structure are outside this request. A final comprehensive review
of all completed Super Admin components is explicitly Required. No dependency
upgrades, commits, pushes, API/domain/schema redesign or production write approval.

The prior Countries hosted-report gate stays Deferred under PROD-028. It is not
claimed complete to advance implementation. New features use exact source/API
contracts; remaining external release gates cannot change business meaning.

## Verified source inventory and ordered deliverables

| Order | Workflow | Current source entry | Required outcome | State |
| --- | --- | --- | --- | --- |
| 1 | States | web-next/src/modules/reference-data/geographical-information/states/pages/StatesPage.tsx | Grid/Cards/Chart/Report/Import; Country lookup; create/edit/view; archive/restore/bulk; exact filters/paging/grants | Closed |
| 2 | Districts | web-next/src/modules/reference-data/geographical-information/districts/pages/DistrictsPage.tsx | Same source views, State-only parent selection, State-name report filters and native domain rules | Closed |
| 3 | Super Admin navigation/routes | web-next/src/shell/components/sidebar/configs/superAdminConfig.tsx; web-next/src/lib/auth/route-access.ts | Canonical routes/deep links and exact role/action denial; retain gated dependencies honestly | Queued |
| 4 | Tenant dashboard and management | web-next/src/platform/tenants/TenantDashboardPage.tsx; TenantManagementPage.tsx | Existing KPIs, subscription/capacity/entitlement, Grid/Cards, structured create/edit | Closed client |
| 5 | Tenant admins | web-next/src/platform/tenant-admins/TenantAdminManagementPage.tsx | Create/edit/delete, assignments/default tenant, disabled/locked state | Closed client |
| 6 | System audit trail | web-next/src/platform/audit-trail/pages/AuditTrailPage.tsx | Authoritative cursor/filter/detail; local changes sort/filter and shared controls | Closed client |
| 7 | System error logs and settings | web-next/src/platform/error-logs/pages/ErrorLogsPage.tsx; ErrorLogSettingsPage.tsx | Grid/Cards/details/copy/export/settings with separate exact grants | Closed client; managed reports Active successor |
| 8 | System UI texts | web-next/src/app/(main)/super-admin/(platform)/ui-texts/page.tsx | Follow actual redirect to administration settings system-ui-texts; shared SQL resource editor | Queued |
| 9 | Advanced operational tools | web-next/src/platform/advanced-tools/ | Health, embedded Swagger and Hangfire with existing protected transports and grants | Queued |
| 10 | Comprehensive final review | Every completed owner/route above | Field/action/permission/view matrix, EN/AR RTL compact/wide keyboard, real APIs where authorized, scoped review and full quality gates | Queued |

## Task method and acceptance

- [x] Inspect current Next route allowlist and distinguish actual pages from redirects.
- [x] User resolves Basic Data meaning: States and Districts only, then remaining Super Admin.
- [x] Freeze States version2 Screen/Workflow Contract, Phase00 books and existing-only manifest (468recipe check and planning pass).
- [x] Implement States typed DTO/query/validators/service first; meaningful invalid-response, permission and uncertain-mutation tests. Current partial checkpoint: angular-states-workspace/STATE_FOUNDATION_2026-11-05.md.
- [x] Implement one owner-scoped read/editor/lifecycle/import state and focused component folders. Shared controls own visual shells and errors.

The complete States client is Verified/Closed;637tests/112files,8full and14negative
browser cases,8Import/24Shell regressions and actual hosted reads pass. See
angular-states-workspace/STATES_WORKSPACE_2026-11-06.md and its portable receipt.
- [x] Compose all five States views and Country dependency; run full Angular check and same-viewport source comparisons.
- [x] Reconcile docs/evidence and close States before activating Districts; repeat per workflow.
- [ ] Execute final complete audit after all workflows, repair verified differences, rerun gates and report unresolved hosted/release constraints precisely.

No feature is accepted because its menu entry, DTOs or generic shell exists. The
reference's actual data-entry, editing, viewing, list/filter and mock-data journeys
must work, and every Required view is verified independently. Never copy Countries
fields or optional capabilities into States/Districts merely for consistency.

Districts2026-11-06: complete client Phase06 Verified,701tests/125files,8full/14negative browser cases and1States regression. All five views, four-field State-parent form, lifecycle and ambiguity-safe import; typed StateAr/StateEn report extension. Canonical report/receipt under angular-districts-workspace. Districts docs/education are Closed; Tenant Management client is Verified747tests/135files, browser8/negative28, navigation24; full-page Add Tenant is requester-approved, education complete and final documentation closure is current Active step; later Super Admin remains Required.


Current2026-11-06: Tenant Administrators client/education Closed under S4-A2. Full772tests/142files; browser8positive/32negative/8current Next reference; Tenant/States/Districts1each; actual hosted collection/detail/lookup200and owned logout204with no business writes. Current report/receipt in angular-tenant-admins-workspace. S4-A3 System Audit Trail is now Verified/Closed on full844tests/158files, Angular8+32/Next8, four owner regressions, hosted GET-only proof and Arabic education. S4-A4 System Error Logs and Settings is sole Active source preflight; no runtime before its Phase00. Other operational siblings and final complete review remain Required.

Current2026-11-06: Error/Audit consistency S4-A4b Closed with portable evidence. S4-A4c managed Error Reports is Active; first safe-source adapter implemented, full Report View pending. Settings combines system+appearance, Language/Translation is separate under Administration. Health/API docs/Hangfire and profile/password route parity must be reconciled before final comprehensive review. No whole-Super-Admin completion claim.
