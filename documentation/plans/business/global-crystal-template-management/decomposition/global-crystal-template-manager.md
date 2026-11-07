# Global Crystal Template Manager — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | global-crystal-template-management |
| Authorized slice | GCT-1 |
| Child Feature ID | global-crystal-template-manager |
| Child feature name | Global Crystal Template Manager |
| Owner | Reporting |
| Depends on | Existing global Crystal catalog and canonical entity contract |
| Execution status | Active |
| Runtime authorization | GCT-1 execution authorized; release verification gated |

## 1. Child boundary and outcome

Upload, replace, inspect and download global templates for editable entities only.
Immutable versions and explicit publication match existing managed reports; global ownership must remain separate from tenant/company data.

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| reporting.global-templates.manager | Web | /administration/global-crystal-reports | Administer global RPT | Flat catalog with server scope/search and bounded paging | P-001 | C-01 shared wide detail/discovery dialogs; C-02 Grid only | web-next/src/modules/reporting/crystal-report-manager/CrystalReportManagerPage.tsx | Implemented | Grid Required; Table Excluded; Cards Excluded; Tree Excluded; Detail Required; Report Excluded; Import Required; Export Required; Chart Excluded | Shared feedback, pending, field errors, dirty close,409reload, identity invalidation | Online authoritative | Tests only; never fabricated valid runtime status | super_admin + GlobalCrystalReports:View + entity Edit; global | EN/AR RTL; focus first invalid input; stacked toolbar at small widths | Immutable template/version/publication workflow instead of geographical CRUD |
| reporting.global-templates.manager | Mobile | None | N/A | N/A | N/A | N/A | mobile-react/src/modules/reporting | Excluded | Grid Excluded; Table Excluded; Cards Excluded; Tree Excluded; Detail Excluded; Report Excluded; Import Excluded; Export Excluded; Chart Excluded | N/A | N/A | N/A | Existing consumer company policy/cache reconciled | N/A | Requester explicitly chose Angular administration |

## 3. Closest existing reference

Countries supplies shared MyDataGrid composition. The existing Next manager is the
exact behavior/UX reference. PARITY_SCOPE_2026-11-01.md freezes the requester-approved
global/company security adaptation without dropping reference features.

## 4. Reuse and composition contract

MyDataGrid, PageHeader, FormContainer, DialogShell, ReferenceField/OptionSelect,
FeedbackState, Confirmation and existing notifications. Generic shared PrimeNG file
picker needed only because no shared file picker exists. No feature-local grid shell.

## 5. Screen and workspace contract

Requester extension2026-11-05: reporting.global-templates.consume uses its existing
ReportWorkspace Options sidebar to download the permitted RPT and launch the same
shared upload/version dialogs for a fully authorized global-template administrator.
This is a bounded GCT-1 entry to existing version management, not a consumer-wide
write entitlement. Resolve one exact reportKey/entity, immutable SourceId and current publication token; check the
report Upload ACL. Loading/error/stale, first-invalid focus, pending and dirty-close
protection remain required. No offline editing or new API/schema contract.

Entity selector lists only authorized global entities. Select a template to inspect,
download or append a new version; upload creates an absent canonical report key. Version detail exposes validation and explicit publish. XSD download
supports designer correction. Archive and role grants are Required; physical delete
is Excluded. Company consumption is Required under the revised scope contract.

## 6. Typed transport and server criteria

ERP endpoints supply only canonical entity/source identity, file metadata and bounded
validation results. Multipart RPT bytes never include client paths. SHA is concurrency
identity. Application independently checks permissions for every endpoint.

## 7. Create, edit, view, and lifecycle contract

Inspect is advisory; save reinspects. Versions and private source identities are append-only. A new version never replaces the published pointer automatically; explicit publish requires valid current-fingerprint evidence. Existing invalid/stale versions require revalidation.

## 8. UX states, permissions, offline, and mock data

Exact permission matrix in PLAN.md. Save stays enabled for incomplete forms; shared
form validates and focuses fields. No offline changes. Mocks never imply native proof.

## 9. Concurrency, transactions, and consistency

Reuse SQL resource coordination, unique identity/version-number constraints and RowVersion publication checks. Global persistence must be explicit; migration/live schema verification Required. Do not overwrite runtime Reports files or bypass tenant filters. Phase00 froze additive global ownership and backwards-compatible managed shadow/cutover; current source and SQL tests verify this design.

## 10. i18n, RTL, accessibility, and responsive behavior

Shared theme/scroll; translated labels/errors, keyboard file selection, accessible
dialog and screen-reader status. No native workflow dialogs.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | GCT-1 frozen scope | Reporting177, architecture70, full ERP1212 and real SQL/configured schema passed | PARITY_IMPLEMENTATION_2026-11-02.md |
| 2 | Web | Verified | API Verified | Angular497 full gate; Next consumer30 + permission parity/type/architecture | PARITY_IMPLEMENTATION_2026-11-02.md |
| 3 | Mobile | Verified | Web Verified | Administration Excluded; consumer full gate601tests | PARITY_IMPLEMENTATION_2026-11-02.md |
| 4 | Integrated live verification | Active | Implementation technical stages Verified | Angular remains stopped; final browser, authenticated hosted discovery and compatible native RPT/PDF pending | FOLLOW-024 |
| 5 | Documentation and closure | Queued | Integrated verification Verified | Phase06 Verified required before Phase07 | Planned only |

**Next-step rule:** no sibling feature becomes Active before this feature's
integrated verification is Verified and documentation/closure is Closed.

## 12. Verification contract

Authorization, global/tenant isolation, traversal, duplicate/version/publication races, invalid schema/parameter, immutable source/history, revalidation, cancellation, exact native-valid upload/publication and EN/AR UI journeys.

## 13. Child exit gate

All required tests and live evidence pass; excluded clients audited; full Angular
gate passes; source docs/manifests/generated packets synchronized. No closure claim
while native/browser/release ownership evidence is missing.




## Module / source / empty-draft revision — 2026-11-02

The requester approved the existing GCT-1 extension specified in [DESIGN_SOURCE_WORKFLOW_2026-11-02.md](../DESIGN_SOURCE_WORKFLOW_2026-11-02.md). It freezes server-owned source selection, metadata-only empty drafts, designer preparation and unchanged inspected version/publication policy. Initial sources remain the three executable global ReferenceData projections. Future View Builder implementation is outside this revision. G0–G3 pass for this bounded workflow; existing release-only FOLLOW-024/PROD-028 acceptance remains open. This revision supersedes file-required creation as the only creation path; file-first creation remains supported.


Manual SQL View refinement and execution are recorded in MANUAL_VIEW_IMPLEMENTATION_2026-11-02.md. User explicitly selected real SQL Server View names and initial global shared data. API/Web technical stages are Verified for this revision; integrated hosted/native acceptance remains Active (FOLLOW-024), Phase06 Not Verified. Next/Mobile administration remains Excluded. Builder is DEF-027.


Database View discovery revision2026-11-02: requester explicitly selected database-backed View choice until Builder work (DEF-027). DATABASE_VIEW_DISCOVERY_2026-11-02.md freezes the same active GCT-1 feature, owner/security/schema boundary, shared ReferenceField and verification. This supersedes manual typing in the Angular create form; server reinspection/binding stays authoritative. No new migration or sibling feature.


## Prepared View implementation revision — 2026-11-02

The requester subsequently authorized one all-column View per entity and reviewed
LEFT JOIN navigation relationships. This supersedes the earlier discovery-only
no-migration statement. ReferenceData migration20261102143015 creates the three
ref.vw_* Views; database-backed selection replaces Angular manual entry. Current
technical evidence and publication instructions are DATABASE_VIEW_IMPLEMENTATION_2026-11-02.md
(relative ../ from decomposition). Phase06 remains Not Verified and FOLLOW-024/
PROD-028 stay Open for real hosted/native acceptance; Builder remains DEF-027.


## Current priority decision — 2026-11-03

Requester explicitly defers further empty-template preparation and the proposed
reusable blank/base RPT Templates folder/library. Canonical scope, owner, impact
and reopening trigger: DEF-028 in documentation/plans/notes/DEFERRED_ITEMS.md.
Current active GCT-1 priority is a ready-made RPT: upload, inspect, explicitly publish
a valid version and verify actual PDF rendering/display. Existing implemented
drafts/Views/packages remain available; no runtime removal or migration rollback
is requested. The base-design library is proposed, not implemented. FOLLOW-024/
PROD-028 remain Open; Phase06 Not Verified, Phase07 not started. DEF-027 remains
separate. No native/host success is inferred from this priority decision.


## Command-based pushed-data revision — 2026-11-03

Requester explicitly retains the Command in the RPT and supplies all runtime rows
from the ERP API. COMMAND_PUSH_DATA_2026-11-03.md freezes the GCT-1 policy revision
and records its boundaries: permit design connection metadata and a single source
alias, explicitly bind the received table, retain field/parameter validation and
do not add a database pull mode. Technical implementation/receipts are section24 of
the feature books. Real native PDF/no-design-database acceptance remains FOLLOW-024/
PROD-028; Phase06 Not Verified. DEF-028 and DEF-027 remain Deferred.


## Complete connection-ignore clarification — 2026-11-03

Requester explicitly removes every design-connection check, including the password
check previously retained by section24. CONNECTION_IGNORE_2026-11-03.md records
GCT-1's exact bounded policy, native diagnoses of the actual user files and current
technical evidence. No runtime connection metadata is inspected or used; the report
still needs actual fields/table and managed parameters to bind supplied data.
This does not resume DEF-028 or DEF-027 or establish a successful native PDF.
FOLLOW-024/PROD-028 remain Open. Current feature section25 supersedes section24's
password/receipt claim; earlier verification files remain historical.


## Final RPT-container decision — 2026-11-03

Requester explicitly removes both design-connection and saved-data upload gates.
CONTAINER_DATA_2026-11-03.md and feature section26 supersede earlier instructions
to clear saved rows or rebind to XSD. Runtime always binds API rows, including empty
results; original source bytes remain unchanged. RISK-019 records source-download
contents. Structural/field/parameter compatibility stays separate. FOLLOW-024/
PROD-028 retain native PDF/cache/empty proof; DEF-028/DEF-027 remain Deferred.


## Optional RPT Language correction — 2026-11-03

Current GCT-1 native maintenance makes Language optional in the RPT, conditionally
binds it when present and keeps ar/en required in the ERP render request. Canonical
scope, technical evidence and native limits: OPTIONAL_RPT_LANGUAGE_2026-11-03.md /
feature section27. Publish Crystal only; no new API/client/schema requirement or
empty-template resumption. FOLLOW-024/PROD-028 remain Open, DEF-028/DEF-027 Deferred.


## First display confirmation — 2026-11-03

Requester confirms the report displayed data. This basic ready-made report outcome
is user-confirmed; exact proof boundaries and remaining acceptance are canonical in
FIRST_REPORT_DISPLAY_2026-11-03.md / feature section28. Do not restart basic-display
debugging as though this outcome is unachieved. Broader FOLLOW-024/PROD-028 and
Phase06 remain open; DEF-028/DEF-027 are not resumed by this confirmation.


## Explicit viewer publication correction — 2026-11-03

Current GCT-1 viewer list/render requires an explicitly published active managed
version for all readers, including Super Admin. This supersedes the unmanaged
deployment-file fallback; discovery/registration/draft administration remain.
See PUBLISHED_VIEWER_CATALOG_2026-11-03.md and feature section29 for scope,
verification and manual ErpSystem.Api publication. No client/native/schema change;
FOLLOW-024/PROD-028 stay Open, DEF-027/DEF-028 stay Deferred.


## Restore historical Crystal direction — 2026-11-03

Requester authorizes restoring API-owned layout mirroring and preserving Summary
Info Title(ar)/Subject(en) selector labels. RESTORE_DIRECTION_2026-11-03.md and
feature section30 define the exact legacy policy and native verification limits.
The new shared stage supersedes earlier no-runtime-mirroring guidance for this
bounded restoration only. No RPT save, new route/schema, client runtime or
permission change; Language stays optional in RPT. FOLLOW-024/PROD-028 remain
Open and DEF-027/DEF-028 remain Deferred. Publish CrystalReportGeneratorApi only.


## Summary Info diagnosis — 2026-11-03

Requester confirms direction changed and reports missing selector names. Hosted
native inspection and independent OLE properties both find empty Title/Subject in
the local Countries.tests.rpt candidate. Its match to the published version is
unconfirmed; current catalog metadata was requested. See SUMMARY_NAMES_2026-11-03.md
and feature section31 for exact hash, source/immutable-version workflow and proof
limits. No runtime change/test rerun; broader notes and deferred scope unchanged.


## Confirmed duplicate replacement — 2026-11-03

Requester-approved same-file/same-entity detection and atomic save+publish with
retained immutable history are current GCT-1. See DUPLICATE_REPLACEMENT_2026-11-03.md
and feature section32 for bounded contract, checks and execution ledger.
