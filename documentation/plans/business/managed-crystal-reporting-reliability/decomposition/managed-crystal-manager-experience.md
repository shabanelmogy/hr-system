# Managed Crystal Report Manager Experience — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `managed-crystal-reporting-reliability` |
| Authorized slice | `Slice 1 — Managed Crystal Reporting Reliability` |
| Child Feature ID | `managed-crystal-manager-experience` |
| Child feature name | Managed Crystal Report Manager Experience |
| Owner | Reporting API and Web Reporting module |
| Depends on | `managed-crystal-contract-registry` and `managed-crystal-template-validation` Verified/Closed |
| Execution status | `Active` |
| Status evidence | `documentation/plans/business/managed-crystal-reporting-reliability/IMPLEMENTATION-ROADMAP.md` Phase 3 |

## 1. Child boundary and outcome

Business workflow owned by this child: make the existing Web Report Manager use the
canonical managed-entity registry, display the complete template-validation
lifecycle, let an authorized administrator revalidate immutable stored versions,
and guide the administrator from a deterministic incompatibility to either
revalidation or a corrected new version without weakening validation.

Independent acceptance outcome: an administrator can select, filter and create by
a supported entity instead of typing an arbitrary key; create/import/upload results
show `Pending`, `Valid`, `Invalid`, or `NeedsRevalidation` with actionable localized
feedback; an existing stored version can be revalidated idempotently against the
current contract; and only a current-valid version can be published. Existing
archive, download, grants, row-version conflict and read-only rules remain intact.

Explicitly outside this child: creating a designer-produced `.rpt`, proving an
actual Fiscal Years PDF, changing the Fiscal Year context, Mobile administration,
runtime capacity/packaging, and security/dependency hardening. Real `.rpt`/PDF
acceptance remains Deferred to Phase 4 under `RISK-008`; security stays Phase 6.

## 2. UI Pattern Gate (mandatory before implementation)

**Next-step rule:** API work is the only active runtime stage after Phase 00
passes. Web remains queued until API evidence is Verified; Mobile disposition,
integrated verification and closure follow in order.

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `managed-crystal-manager` | Web | `/administration/crystal-reports` | Administer managed templates and lifecycle | Server-paged collection plus report/version detail workflow | P-001 | P-001 collection with shared form-dialog composition; existing detail tabs retained as feature composition | `web-next/src/modules/reporting/crystal-report-manager/CrystalReportManagerPage.tsx`; `web-next/src/modules/reference-data/geographical-information/countries/pages/CountriesPage.tsx` | Adapted | Grid Required; Table Excluded; Cards Excluded; Tree Excluded; Detail Required; Report Excluded in this child; Import Required; Export Excluded; Chart Excluded | Shared loading/empty/error/retry; forbidden route/control removal plus direct guards; invalid/stale action guidance; shared dirty protection in create form; 409 reload feedback | Online authoritative; offline mutation Excluded | N/A — file bytes, entity contracts, validation and concurrency cannot be authoritative mock data | Existing exact Crystal report permissions; authenticated tenant/company; entity selection never supplies scope | Toolbar stacks on small widths; dialog scroll stays internal; EN/AR and LTR/RTL; keyboard-accessible file/entity fields, tabs and actions; first invalid field focus | P-001 has immutable versions and publish/revalidate actions rather than ordinary edit/restore |
| `managed-crystal-manager` | Mobile | No administration route | Administration is intentionally Web-only | N/A | P-001 disposition | N/A | `mobile-react/src/platform/reporting/presentation/ManagedCrystalReportView.tsx` inspected as consumer boundary only | Excluded | Grid Excluded; Table Excluded; Cards Excluded; Tree Excluded; Detail Excluded; Report Excluded in this child; Import Excluded; Export Excluded; Chart Excluded | No hidden or placeholder manager UI | N/A | N/A | No Mobile admin permission surface is introduced | N/A | Mobile report consumption remains owned by Phase 4, not silently added here |

No Candidate pattern remains. Web is Required/Adapted from active P-001; Mobile
administration is explicitly Excluded by the product plan.

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Existing Crystal manager | `web-next/src/modules/reporting/crystal-report-manager/CrystalReportManagerPage.tsx` and its create/import/detail dialogs | Route, server paging, permissions, archive/download/import/grant/publish journeys and concurrency feedback | Free-text entity entry becomes API-backed selection; validation lifecycle and revalidation become first-class |
| P-001 Countries Web | `web-next/src/modules/reference-data/geographical-information/countries/pages/CountriesPage.tsx` | Shared page/header/grid/filter/feedback discipline and query ownership expectations | No cards/chart/report/import parity is copied; only the manager's required Grid/Detail/Import surfaces apply |
| Shared form system | `web-next/src/shared/components/form/MyForm.tsx` and `web-next/src/shared/components/form/layout/` | `react-hook-form`, Zod, `noValidate`, field errors, invalid-field focus and shared dialog layout | File selection and supported-entity options are manager-owned typed inputs |
| Validation lifecycle | `api/Modules/Reporting/ErpSystem.Modules.Reporting.Domain/Analytics/CrystalReports/Entities/CrystalReportVersion.cs` | Named `Valid`, `Invalid`, `NeedsRevalidation` transitions and immutable source identity | This child exposes an authorized revalidation command; it does not overwrite source bytes |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Page and grid | `ContentWrapper`, `PageHeader`, `MyDataGrid` | Reuse | Preserve server paging and shared feedback; add entity selector and validation summary columns/chips |
| Form shell | `MyForm`, `FormContainer`, `FormHeader`, `FormContent`, `FormFooter` | Reuse | Replace the raw create dialog form and browser constraints; Zod owns validation and field errors |
| Entity field | `MySelect` | Reuse | Options come only from `supported-entities`; localized labels remain Web resources keyed by canonical entity key |
| File field | Existing shared file input/control if compatible | Reuse or generic extension | Accept one `.rpt`, keep file-size/extension hint and map API errors without local business validation |
| Confirmation and transient feedback | `ConfirmationDialog`, shared feedback/toasts | Reuse | Revalidation is non-destructive and needs no confirmation; archive keeps confirmation; failures remain visible/actionable |
| Detail/history | Existing `CrystalReportDetailDialog` | Feature-specific composition | Keep tabs and grants UI; add validation evidence, reason, current/stale indication and revalidate action |
| API ownership | `crystal-report-manager/services.ts` | Extend | It remains the only feature layer calling `apiService`; add strict parsers for supported entities, all states and revalidate response |
| Server contract source | `IManagedCrystalReportContractSource` backed by embedded registry | Generic extension | Expose safe entity metadata required by clients; never duplicate the supported-key list in controller/UI |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Grid | Required | Existing server-paged `MyDataGrid`; entity/status/search toolbar; lifecycle summary visible | Search, select supported entity, filter status, refresh, open detail, download, archive |
| Tree/Hierarchy | Excluded | No hierarchy exists | None |
| Detail/View | Required | Existing tabbed detail; overview, immutable versions and grants | Read entity/report identity, inspect state/evidence/reason, download, publish, revalidate, upload version, edit grants |
| Create/Edit | Required | Shared create form dialog; source versions are append-only so Edit means add-version/grants/lifecycle actions | Select supported entity, choose `.rpt`, optional description, create; upload corrected version |
| Report/Import/Export/Chart | Import Required; Report Deferred to Phase 4; Export/Chart Excluded | Existing deployment-source dialog enriched with entity/compatibility state | Filter sources, see reason, import an eligible source |
| Validation recovery | Required | Version row action and actionable state message | Revalidate stored immutable bytes or upload a corrected version; publish only after current-valid |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Typed request/response | `SupportedCrystalReportEntityResponse(entityKey, scope, filters, contractSchemaVersion, contractFingerprint)`; `RevalidateCrystalReportVersionCommand(reportId, versionId)` returns `CrystalReportVersionResponse`; version response accepts all four lifecycle states and existing validation evidence fields. |
| Canonical routes | Add `GET /api/v1/crystal-reports/supported-entities`; add `POST /api/v1/crystal-reports/{id}/versions/{versionId}/revalidate`; preserve all existing manager routes. |
| Server search/filter/sort | Existing server search/status/entity filter remains authoritative. Entity filtering uses a supported key selected from API metadata; server still validates direct calls. |
| Paging/limits | Existing `page`/`pageSize` (maximum 50), upload and runtime bounds remain unchanged. Supported-entity result is the bounded canonical registry. |
| Domain errors / ProblemDetails | Revalidation maps missing/forbidden to not-found semantics already used by version operations; unavailable source, source hash mismatch, unsupported entity, schema mismatch, parameter mismatch and inspector unavailable keep stable Reporting errors. Deterministic invalid revalidation persists `Invalid` plus safe reason; transient inspector/storage failures do not overwrite previous evidence. |
| Permission and tenant/company scope | Supported metadata requires `CrystalReports:View`; create control still requires `CrystalReports:Create`. Revalidation requires `CrystalReports:Upload` plus report Upload ACL unless the existing access-management bypass applies. Tenant/company are server-derived. |
| Cross-module contract | N/A — metadata is Reporting-owned and does not call business providers. Fiscal Years remains only one supported entity and does not become a selected/current Fiscal Year dependency. |
| Persistence/schema/migration | No new table/column/migration. Revalidation updates only the four allowed validation-evidence properties on an existing immutable `CrystalReportVersion`. |

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Report viewer/admin | Entity registry | List supported entities | `GET /api/v1/crystal-reports/supported-entities` | `CrystalReports:View` | Safe global contract metadata; no tenant data | Read-only allowed | Selector/filter load only after route permission; API remains authority | Excluded | Supported entity | الكيان المدعوم | Controller permission + query test |
| Report administrator | CrystalReports | Create initial version | `POST /api/v1/crystal-reports` | `CrystalReports:Create` | Current tenant; entity never changes trusted scope | Hidden/blocked in app read-only | Create button and submit callback guard | Excluded | Create report | إنشاء تقرير | Existing denial coverage + Web guard test |
| Granted operator | CrystalReport version | Upload corrected/new version | `POST /api/v1/crystal-reports/{id}/versions` | `CrystalReports:Upload` + Upload ACL unless bypass | Report tenant | Hidden/blocked | Detail action and callback guard | Excluded | Upload version | رفع نسخة | Existing handler ACL test + Web guard test |
| Granted operator | CrystalReport version | Revalidate immutable source | `POST /api/v1/crystal-reports/{id}/versions/{versionId}/revalidate` | `CrystalReports:Upload` + Upload ACL unless bypass | Report tenant | Hidden/blocked | State-aware detail button and direct callback guard | Excluded | Revalidate | إعادة التحقق | New handler/controller denial test + Web guard test |
| Granted publisher | CrystalReport version | Publish current-valid version | Existing publish route | `CrystalReports:Publish` + Publish ACL unless bypass | Report tenant | Hidden/blocked | Disabled unless current-valid plus callback guard; server remains authority | Excluded | Publish | نشر | Existing server test + Web state test |
| Access administrator | CrystalReport grants | Replace grants | Existing access route | `CrystalReports:EditAccess` | Current company/report tenant | Hidden/blocked | Existing checkbox/save guard | Excluded | Save access | حفظ الصلاحيات | Existing tests |
| Report administrator | CrystalReport | Archive report | Existing delete route | `CrystalReports:Archive` | Report tenant | Hidden/blocked | Existing confirmation and direct guard | Excluded | Archive | أرشفة | Existing tests |

No security model redesign or new secret/configuration work is authorized here.

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| Create | Supported entities loaded; create permission; online | Select entity, optional description and `.rpt`; submit remains enabled and validation explains missing/invalid fields | Existing strict inspect/store/create flow | Dialog closes only on success; new report opens/list refreshes with explicit state |
| Import | Deployment catalog available | Search/filter and choose importable item | Existing hash recheck plus strict create pipeline | Ineligible item stays disabled with reason; conflict refreshes catalog/list |
| Add version | Active report and Upload permission/ACL | Choose corrected `.rpt` and upload | Existing append-only strict inspection flow | Earlier source/history remains unchanged; detail/list refresh |
| Revalidate | Existing active report/version; Upload permission/ACL | Choose Revalidate on `Invalid` or `NeedsRevalidation` (also safe/idempotent on `Valid`) | Verify stored size/hash, inspect current entity contract, update only validation evidence atomically | Valid becomes current-valid; deterministic mismatch becomes Invalid with safe reason; transient failure preserves prior state |
| View detail | View permission | Open report and versions tabs | Read-only projection | All four states, reason, schema version and shortened fingerprint are readable; archived report has no mutation controls |
| Publish | Current-valid version, Publish permission/ACL and current row version | Choose Publish | Existing locked current-fingerprint gate moves publication pointer | Non-current-valid is disabled with guidance and rejected server-side; 409 reloads detail/list |
| Grants/archive/download | Existing applicable state | Existing controls | Existing behavior unchanged | Existing permission, read-only and conflict behavior is preserved |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | Entity metadata, list, catalog and detail each show bounded loading and an explicit retry. Empty list/catalog uses shared empty/info state. Validation reasons are separate from transport errors. |
| Permission / forbidden / read-only | Route/view permission remains the entry gate; each mutation has visible-state and direct-handler guards, while API/ACL is authoritative. App read-only hides/blocks every mutation including revalidate. |
| Archived / locked | Archived reports remain inspectable but cannot upload, revalidate, publish, edit grants or archive again. Busy state prevents duplicate mutation submissions. |
| Unsaved changes / destructive confirmation | Create uses shared form dirty protection. Archive keeps shared confirmation. Selecting a file again replaces only the local unsaved selection. |
| Offline / stale / conflict | Online-only. No outbox. `409` row-version conflict reloads list/detail and explains that the server version won. Contract staleness is a business validation state, not client cache conflict. |
| Mock data | Unit tests may use typed DTO fixtures, but runtime UI never exposes fabricated registry/validation/concurrency data as authoritative. |

## 9. Concurrency, transactions, and consistency

Revalidation executes under the report coordination lock. It verifies that the
version belongs to the requested non-archived report and that Upload ACL still
holds, opens source bytes through `OpenVerifiedReadAsync` using immutable expected
size/SHA-256, and inspects outside any database mutation. The final validation
transition and save occur atomically under the same report lock. A deterministic
schema/parameter/invalid-report result may set `Invalid`; unsupported entity is a
stable contract failure; transient storage/inspector failure preserves the prior
validation state. Repeating revalidation against identical bytes/current
fingerprint is idempotent. Existing report RowVersion remains the concurrency
token for publish/grants/archive; revalidation does not change source identity.

## 10. i18n, RTL, accessibility, and responsive behavior

All new visible labels, lifecycle states, entity labels, hints and errors live in
both Reporting locale resources. Canonical API keys/reasons are never presented as
the only user explanation. RTL is inherited from the shared theme; toolbar and
version actions wrap without manual direction overrides. Shared form validation
focuses the first invalid field, errors are associated with their inputs, file and
revalidation actions have accessible names, dialogs keep keyboard focus and
internal scrolling, and status is conveyed by text plus color. At small widths the
toolbar and version rows stack; the grid retains its intended internal scroll.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | Phase 2 Verified/Closed and this contract/Phase 00 approved | Supported-entity query, revalidation command, safe errors, exact permissions/ACL, unit/handler/controller tests; no schema change | 128/128 Reporting tests and 59/59 Architecture tests passed on 2026-09-27 |
| 2 | Web | Verified | API stage Verified | Shared-form create flow, API-backed selectors, four-state detail/recovery UI, service/type tests and component journeys | 19/19 focused tests, full 190-file/666-test suite, complete static check and 77/77-page production build passed on 2026-09-29 |
| 3 | Mobile | Verified | Web stage Verified | Administration exclusion rechecked; no Mobile runtime source added | Route/source audit plus 8/8 focused tests and 83-route/230-endpoint-member contract matrix passed on 2026-09-29 |
| 4 | Integrated live verification | Active | API/Web Verified and Mobile disposition Verified | Authenticated supported-entity/create/import/upload/revalidate/publish/grant/archive flows in EN/AR and RTL/LTR; real `.rpt` positive acceptance may remain Deferred only under `RISK-008` | Automated Web production route is verified; authenticated live workflow remains pending |
| 5 | Documentation and closure | Queued | Integrated verification Verified | Canonical books, manifest/recipes, admin education and roadmap status reconciled | To be recorded in generated Phase 07/roadmap |

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | Revalidation command and lifecycle tests | immutable source; valid/idempotent; deterministic invalid; transient preservation; ACL denial | Verified — focused tests and full Reporting 128/128 |
| API/transport | Query/controller/permission tests | bounded safe entity metadata; exact routes and permissions | Verified — controller/query contract tests |
| Persistence/migration | Persistence immutability baseline plus no-model-change review | only validation evidence changes; no new migration | Verified — existing validation-only guard reused; no EF model source changed |
| Web | Service parser/routes plus create/detail/import/page component tests | all four states; supported selector; direct guards; publish guidance; conflict/retry | Verified — 19 focused, full 666, static gate and production build |
| Mobile | Source/route audit | no administration route/control introduced | Verified — no admin route/client/control; focused regressions and contract matrix pass |
| E2E/manual/live | Authenticated API and browser workflow in EN/AR | select → upload/import → inspect state → revalidate/correct → publish → grants/archive | Pending; real designer `.rpt`/PDF remains governed by `RISK-008`/Phase 4 |

## 13. Child exit gate

This child is complete only when:

- [x] Contract version is current and both platform rows pass the UI Pattern Gate.
- [x] Phase 00 documentation/manifest/recipes are complete before runtime work.
- [x] API exposes the bounded canonical supported-entity list without duplicating keys.
- [x] Revalidation verifies immutable stored bytes and current contract under exact Upload permission/ACL.
- [x] Deterministic mismatch and transient failures follow the documented state policy.
- [x] Web create/filter/import use supported entities and no free-text entity entry remains.
- [x] Web understands and displays all four lifecycle states, evidence and actionable recovery.
- [x] Shared form/dialog/grid/feedback primitives, direct guards and row-version recovery are preserved.
- [ ] EN/AR, RTL/LTR, keyboard/focus, accessible state text and responsive layouts are verified.
- [x] Mobile administration remains explicitly Excluded with no placeholder runtime UI.
- [x] API, Web and focused architecture/type/test gates pass; no migration drift exists.
- [x] Real designer `.rpt` acceptance stays visibly owned by `RISK-008`/Phase 4 and does not disable strict validation.
- [x] Security/dependency hardening remains Phase 6 and is not pulled into this development child.
- [ ] Canonical documentation, customer education, required-file manifest, recipes and roadmap are Closed before Phase 4 starts.
