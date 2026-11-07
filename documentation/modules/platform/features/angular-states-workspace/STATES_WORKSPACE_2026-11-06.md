# States Angular workspace — 2026-11-06

## Implemented scope

The canonical `/super-admin/geography/states` route now composes the existing
Shared collection, form, dialog, chart, import and managed-report owners. Exact
route/action grants are `super_admin` plus `States:View/Create/Edit/Archive/Restore`;
active Country lookup independently requires `Countries:View`. Read-only actors
retain reads without mutation/selection controls. Source baseline is the actual
web-next States workflow; D35 makes a running Next server/pixel prerequisite
unnecessary. No new business/schema, dependencies, API endpoint or native client.

The page is a small workspace coordinator. StateCollectionView owns domain list
composition; StateListCriteria owns the parent/status/District/sort callbacks;
StateCardHeader/Content own State data presentation; StateEditor, read details,
lifecycle confirmation and import each have matching component folders and
external resources. HTTP stays in the owning services and lifecycle in page-scoped
state. Shared owns presentation/validation/selection/pagination/close behavior.

## Source parity checklist

| Requirement | Current implementation and evidence |
| --- | --- |
| Grid | MyDataGrid, stable-key projected columns, server page/search/sort, status/Country/hasDistricts criteria, reset, record navigation, options, eligible page selection and inline authorized actions |
| Cards | Same authoritative source and criteria; bilingual titles, code/ID/status, parent Country, District count, quality and creation date; independent selection and actions |
| Chart | Four charts and four metrics; Country distribution/share, District counts and creation timeline use the loaded page; matching count comes from the server; scope labels explicit |
| Report | GlobalReportView with entity states, independent NameAr/NameEn criteria, existing PDF/options/source permissions and cleanup. First catalog request uses the requested entity |
| Import | Exact four-column XLSX, first sheet/5MiB/100 rows, authorized active Country resolution in either language, ambiguity rejection, duplicates scoped by parent, one valid-row atomic batch, original Excel row/index feedback and uncertain replay lock |
| Create/edit | Four native Signal Form fields, active parent lookup, precise validation and server code/field feedback, first-invalid focus, enabled invalid Save for feedback, fresh detail before edit, unsaved/pending/uncertain guards and active-parent dev samples without auto-submit |
| View/lifecycle | Independently loaded read-only detail without invented District count; shared confirmation for archive/restore/bulk, explicit max100 and authoritative idempotent count; cancelled stale actor effects and no automatic write replay |
| Refresh/realtime | Existing scoped reader coalesces State/Country/District/reconnect hints. Parent lookup receives invalidation through the page's owning lease and retains a trailing refresh while pending |
| Compact/RTL | Logical Shared layout, current-page checkbox in Grid header, Cards selection bar, horizontal toolbar overflow contained, page/import workspace fills available height |

## Reusable corrections

- Shared Sass entity-card header/metadata rules are reused by Countries and States
  rather than copying the same presentation rules into two features.
- MainShell gives its routed child the remaining workspace height; States' main
  and workspace compose flex children. Import hosts use column Flex so a short
  preview still fills its available area. Countries receives the same host rule.
- AuthenticatedApplication has a unique selector to avoid a component-ID collision
  with the unrelated routed ModuleWorkspace.
- GlobalReportState waits for the consumer entity before starting catalog HTTP;
  this prevents an incidental Countries request when States is mounted. A failing
  regression test proved the issue; 27 focused report tests passed after the fix.
- Native form dirty-key normalization accepts incomplete drafts. Detail conversion
  projects only form fields. Explicit server field errors override safe known-code
  translations; only exact verified domain codes are mapped.

## Executed verification and scope

Browser results cover8 full EN/AR × light/dark ×390/1440 journeys: Grid/header
selection/paging, Country/District/status criteria/reset, Cards/detail,
invalid-submit focus, dirty cancel/keep, create/edit/archive/restore/bulk, four
charts, State report fixture/PDF options and mixed-validity XLSX upload. Fourteen
EN/AR negative cases cover read-only, API403, parent403/503, explicit field errors,
domain duplicate mapping and uncertain outcomes. No native dialogs or page errors.
Separate Shared regressions:8 Countries Import cases and24 authenticated-shell
cases. Screenshots are inspected; geometry asserts that the import card reaches
the available workspace bottom without document horizontal overflow.

Actual hosted read-only evidence uses the existing trusted4210 login, not the new
4220 fixture UI: State page200 (27 total), active Country lookup200 (5), detail200,
Country/hasDistricts query200, and State report catalog200 with an empty array.
No business writes; the owned test session logged out204. The empty hosted report
catalog correctly requires the unavailable state; no real State RPT/PDF is claimed.
CRUD/import mutations above were intercepted fixtures; real server transaction
rules remain the retained API implementation.

Full Angular gate and final source hashes are recorded in
verification/STATES_WORKSPACE_2026-11-06.json after execution. Independent final
source review found no remaining P1/P2 findings after code-length, reset and
parent-search synchronization fixes. The earlier foundation receipt remains a
historical partial checkpoint, not current UI evidence.

## Release boundaries

PROD-019 owns publication of catalog0795bce48e9d1a5d504669949da65326d0aebea66fb9c46808150d0611fb7be9
(21sources/7395keys); generated API catalog and both Web version references match
locally. PROD-028/025 own configured hosted RPT/provider acceptance; this report
does not close them. RISK-020 retains the existing initial bundle warning. Native
Mobile, Next runtime and database schema are unchanged. All Super Admin parity
remains an active parent goal; States evidence never closes later workflows.

Subsequent integration: Districts changed the shared authenticated route/report
filter/catalog sources after this dated States receipt. Its87hash receipt in
angular-districts-workspace/verification/DISTRICTS_WORKSPACE_2026-11-06.json owns
the later integration baseline; the original States hashes remain historical.
