# System Error Logs managed reports — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | web-angular-migration |
| Authorized slice | S4-A4c — System Error Logs managed reports |
| Child Feature ID | angular-system-error-log-reports |
| Child feature name | System Error Logs managed RPT/PDF |
| Owner | Reporting templates/rendering; Platform owns diagnostic data and redaction |
| Depends on | angular-system-log-collection-consistency Closed; existing managed Crystal pipeline |
| Execution status | Closed — bounded Phase06 Verified and Phase07 completed |
| Runtime authorization | Authorized S4-A4c integration after532recipe preflight, verified source adapter and root contract review: Platform-owned data, explicit provider binding, combined source/report grants, Reporting CHECK migration and existing shared Angular viewer; hosted/provider release acceptance remains PROD-031 |
| Status evidence | ROADMAP.md; prior child verification/acceptance-2026-11-06.json |

## 1. Child boundary and outcome

Expose the existing managed RPT/PDF viewer inside System Error Logs for an authorized
Super Admin. Reuse the report/template lifecycle, upload/download, contract inspection
and preview transport. Extend approved source support rather than adding another report engine.
The requester explicitly confirmed RPT/PDF and necessary API extension.
No fabricated RPT or generated fake PDF is acceptable. Local contract/permission/client
verification and real external Crystal rendering are reported independently.
Settings, Language/Translation, Health/Swagger/Hangfire and general export acceptance are successors.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.system-error-logs.report | Web | /super-admin/error-logs Report view | Preview/download a managed report of permitted error summaries | Existing collection with embedded report | P-001 | Existing GlobalReportView criteria/viewer and template manager | web-angular/src/app/modules/reference-data/geographical-information/states/pages/states-page/states-page.ts | Adapted | Grid/Cards/Detail retained; Report Required; Tree/Import/Chart Excluded; existing Export retained | Existing loading/empty/error/forbidden; no template means honest empty state; no dirty business form | Online authoritative | Synthetic redacted rows; no fabricated RPT | super_admin and SystemErrorLogs:View and global report action grants | EN/AR,390/1440, internal scroll, shared keyboard controls | System logs are global and never tenant-consumable |
| platform.system-error-logs.report | Mobile | Existing tools | Retain current native workflow | No new native report UI | N/A | No new form | mobile-react/src/platform/tools/error-logs | Excluded | Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded from this child | Existing behavior retained | Existing policy | Existing fixtures | Existing grants | No device acceptance inferred | Angular-only requested extension; existing API clients remain compatible |

## 3. Closest existing reference

Reuse States GlobalReportView composition, Reporting public API, Global Template Manager
upload/download/version/inspection, CrystalReportDataSource and ManagedCrystalReportContractRegistry.
Source reviewed paths are registered by Phase00. Error data must come from a narrow
Platform.Contracts adapter; Reporting never accesses PlatformDbContext or private entities.
The geographic public SQL View catalog cannot be repurposed as arbitrary diagnostic access.

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Header/view selection | shared PageHeader; ErrorLogReadState | Reuse | Add report only when combined grants allow it |
| Managed report UI | modules/reporting/global-reports/components/global-report-view | Extend typed entity/source support | Same report catalog, preview, feedback and RPT actions |
| Template lifecycle | Reporting global Crystal handlers/stores | Extend reviewed source | Same identity/version/inspection/publication rules |
| Data source | Platform ErrorLogStore filtering/redacted projections | Extend owner Contracts | Bounded summary read with exact filter semantics |
| Query filters | ColumnFilterSet and ErrorLogColumnFilters | Reuse | Identical applied criteria and server-side filtering |
| Data binding | Source catalog and provider registry | Source-owned fixed provider | Explicit binding mode; do not masquerade a provider as a database View |

## 5. Screen and workspace contract

Report is a third view alongside Grid/Cards. Preserve search, date/user/source/status
and column criteria through owner state. The shared report component owns loading,
empty catalog, preview failure/retry, PDF download and RPT upload/download controls.
Global Report Manager remains standalone as last requested. Register System Error Logs
in its approved source choices with the same source-specific grants.
No new error-log CRUD, import, chart or arbitrary SQL selector.

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Entity/source | system-error-logs; module platform; global scope; fixed provider binding |
| Existing routes | Existing global-crystal-reports catalog/template/version/preview routes; same DTO envelopes |
| Dataset | ReportData: Id string, OccurredOnUtc datetime, Source/Severity/Summary required strings; UserName/Service/Action/CorrelationId/Client/Browser nullable strings; StatusCode nullable int32; DurationMs nullable invariant string preserving long range |
| Filters | Existing ErrorLogFilterRequest semantics, including bounded columnFilters; reject malformed/unknown filters before database work |
| Limits | At most5000report rows, overflow probe5001; existing runtime XML/upload/preview size and timeout caps |
| Redaction | Same list/export-safe summary data; exclude diagnosticDetails, stack traces, tenant/company ids, IP and raw request payloads |
| Cross-module | Platform.Contracts typed read interface/records; Platform implements; Reporting consumes only Contracts |
| Scope | Global super_admin only; tenant catalog/role access must never expose this entity |
| Schema | Existing global report entity CHECK constraint requires explicit migration; no business tables/columns; live apply remains separately evidenced |
| Errors | Existing unsupported/filter-invalid/forbidden/too-large/not-found/stale-contract/report-provider errors |

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| super_admin | SystemErrorLogs | Read summary data | Managed data source | SystemErrorLogs:View | global | Read allowed | Combined source and report policy | Excluded | Report | التقرير | Tenant and missing source grant denied |
| super_admin | GlobalCrystalReports | Catalog/preview | Existing global catalog/preview | GlobalCrystalReports:View | global | Read allowed | GlobalReportView and direct handler | Excluded | Report | التقرير | Missing report grant denied |
| super_admin | GlobalCrystalReports | Download RPT | Existing template download | GlobalCrystalReports:Download | global | Existing read-only rules retained | Shared RPT menu and direct policy | Excluded | Download template | تنزيل القالب | Missing action grant denied |
| super_admin | GlobalCrystalReports | Create/upload/publish | Existing managed lifecycle | Existing independent Create/Upload/Publish actions | global | Writes follow existing read-only guard | Existing manager and direct policies | Excluded | Manage template | إدارة القالب | Each action tested independently |

Actual permission constants are authoritative; reconcile exact strings during Phase00.
Do not create an ErrorLogs:Edit permission for a read-only diagnostic source.

## 7. Create, edit, view, and lifecycle contract

No diagnostic mutation. Template create/upload/validate/publish/download retains the
current report/version identity, concurrency and file cleanup rules. Source binding
may be a fixed provider only when the catalog explicitly declares it. Geography
continues requiring verified schema-bound database Views. No bypass of inspection.

## 8. UX states, permissions, offline, and mock data

Missing template is empty, missing source/report grants is forbidden, oversized data
asks the user to narrow filters, provider failure remains a retryable report error.
Session/permission changes cancel and clear stale report and files through existing shared state.
Mock data is synthetic safe summaries for tests only. No diagnostic writes or fake RPT.

## 9. Concurrency, transactions, and consistency

Retain existing template unit-of-work, identity locks, immutable versions and fingerprints.
Add the source atomically to contracts/provider registrations/allowlists. Fingerprint
change requires coordinated ERP and Crystal provider deployment. No new queue or engine.
Hosted migration/provider/template/render acceptance must have one stable central note.

## 10. i18n, RTL, accessibility, and responsive behavior

Reuse owner/core labels and shared reporting translations; add new source label through
the existing localization authority/generator. Verify EN/AR light/dark390/1440 and no
outer scroll; shared viewer remains keyboard accessible. No manual directional CSS.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | Current source/ownership/permission/artifact review | Typed owner adapter, safe data, lifecycle/security tests, migration evidence and solution gates | Feature API profile |
| 2 | Web | Verified | API contract frozen | Typed shared report integration and full Angular gate/browser proofs | Feature Web profile |
| 3 | Mobile | Verified | Angular-only scope | Verify retained API compatibility; new native UI Excluded | Feature Mobile profile |
| 4 | Integrated live verification | Verified | API and Web pass | Local real query proof; real RPT/provider external acceptance identified explicitly | Feature receipt |
| 5 | Documentation and closure | Closed | Phase06 decision | Canonical books/manifest/generation; education only after Verified | Feature books |

## 12. Verification contract

**Next-step rule:** finish this child before Settings; source-only preflight is not runtime acceptance.

Test no source permission, non-super-admin, tenant denial, unknown/invalid filters,
safe output columns,5000overflow, scope/session changes, source binding mode and
geography View regression. Run required full API and Angular gates. Verify actual
UI catalog/empty/error/selection/criteria and RPT actions with truthful synthetic
boundaries; do not claim a fake document as a Crystal integration pass.
Arabic education Required after exact Phase06 Verified. API-host migration/provider/
real-template constraints remain explicit release evidence.

## 13. Child exit gate

- [x] Phase00 ownership/contracts/matrices and current-only evidence pass.
- [x] API and Angular implementation verified; native boundary retained.
- [x] Actual integration evidence and external provider limits separated.
- [x] Canonical documents and Arabic education close this child before Settings.

Bounded local implementation Verified; external real RPT/provider deployment and PDF acceptance remains PROD-031. Final receipt records actual schema/SQL proof independently.
