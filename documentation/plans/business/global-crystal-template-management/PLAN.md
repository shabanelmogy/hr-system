# Global Crystal Template Management — Bounded Plan

| Field | Value |
| --- | --- |
| Plan ID | global-crystal-template-management |
| Owning module | Reporting |
| Status | GCT-1 execution-ready; release gated |
| Active bounded slice | GCT-1 |
| Active bounded feature | global-crystal-template-manager |
| Owner | Reporting / Angular Architecture |
| Planning method version | 2.0 |

Requester explicitly selected Angular with immutable versions and publication like
existing managed reports. Earlier direct-file replacement proposal is superseded.
This plan extends the owning Reporting capability; it does not advance the existing
Countries pilot or claim global CRUD already exists. FOLLOW-024 is the canonical
implementation follow-up. DISCOVERY, EVIDENCE, SPEC_SUMMARY and DECISIONS own intent.

### Feature Decomposition Gate

| Slice | Decision | Feature ID | Planned Screen/Workflow Contract | Boundary / independent acceptance |
| --- | --- | --- | --- | --- |
| GCT-1 | Single feature | global-crystal-template-manager | documentation/plans/business/global-crystal-template-management/decomposition/global-crystal-template-manager.md | Global immutable templates/versions/publication, editable-entity authorization and Angular manager. |

## Exact execution scope

The current [parity scope revision](PARITY_SCOPE_2026-11-01.md) supersedes earlier
archive/grant exclusions and platform-only consumption. API reopens Active for the
authorized expansion. Earlier technical counts are baseline only; Phase06 Not Verified.

1. Phase00 reconciles global persistence with the current tenant-owned aggregate,
   exact action permissions, global consumption/cutover and private storage. No
   tenant filter bypass, fake tenant, direct RPT overwrite or company impersonation.
2. API/domain: explicit global ownership, unique entity/report identity, immutable
   numbered versions, fingerprint-backed validation, version source download,
   inspect/revalidate and explicit publish. Apply the owning Reporting migration to
   the actual configured development database and inspect the resulting schema.
3. Angular: permission-filtered entity selector, shared MyDataGrid manager, create/
   import/upload dialog, version detail, validation/revalidation, download and publish.
   Primary Save stays enabled until submission validation; field errors/focus are shared.
4. Existing consumers: deliberate versioned-global cutover with compatibility
   regression for Angular/Next/Mobile. Mobile manager administration remains Excluded.
5. Integrated acceptance: real RPT native-valid/invalid fixtures, concurrent updates,
   tenant/global isolation, EN/AR and RTL, followed by docs/Phase06/Phase07 in order.

## Quality gates and current status

G0: Verified global ownership and initial Countries/States/Districts scope.
G1: Exact role/View/action/entity Edit matrix and immutable/publication lifecycle frozen.
G2: Additive Reporting model, private source, concurrency and compatible cutover are
implemented; migration applied and actual configured schema inspected; real SQL
race/isolation/history test passes. G3: Shared Angular implementation and full technical
gate pass. G4: Actual hosted/native/browser acceptance remains Required under FOLLOW-024
and existing PROD-028/025/RISK-008. It cannot change the frozen business/security contract.
The bounded slice is execution-ready; overall release is not Implementation Ready.
Phase06 remains Not Verified, Phase07 not started. Current implementation report is
IMPLEMENTATION_2026-11-01.md. No planning/scaffold existence is presented as runtime proof.

## Business rules and edge cases

### GCT-1 reviewed execution authorization — 2026-11-01

The earlier preflight gate text is historical entry evidence, superseded for this
bounded slice by the following decisions. Requester authorized continuation after
selecting immutable versions/publication. G0-G3 pass for this exact scope; overall
release remains gated. Reporting adds GlobalCrystalReport and GlobalCrystalReportVersion
tables under rpt, deriving AuditableEntity, without tenant filter bypass or fake
tenant identity. Existing tenant tables/filters stay unchanged. Reuse private file
storage, canonical registry, native inspector/renderer and SQL resource coordination.
Source/version history is append-only; only validation evidence may be updated.

| Action | Exact permission | Additional mandatory authority |
| --- | --- | --- |
| List/detail/entities | GlobalCrystalReports:View | super_admin + Countries:Edit/States:Edit/Districts:Edit for persisted entity |
| Create/import | GlobalCrystalReports:Create | Same role/View/entity Edit |
| Append/inspect/revalidate | GlobalCrystalReports:Upload | Same role/View/entity Edit |
| Download/XSD | GlobalCrystalReports:Download | Same role/View/entity Edit |
| Publish | GlobalCrystalReports:Publish | Same role/View/entity Edit |

Register these exact actions in the existing Global permission catalog. Tenant
Reporting entitlement and wildcard do not grant them. Check trusted role/permissions
before side effects and use persisted entity ownership for IDs. Unique entity/report
and report/version-number indexes plus resource locks serialize concurrent changes.
Publish requires current SQL RowVersion and valid current-fingerprint evidence.

Existing consumers retain the64hex identity/hash envelope. Managed identity/token
derive from report/version identity. A managed template shadows deployment bytes
with the same entity/report key from creation, even while unpublished or invalid;
never silently fall back. Other deployment templates retain existing behavior.
No automatic import, source overwrite or deletion.

Angular route /administration/global-crystal-reports uses P-001 shared MyDataGrid,
form/dialog and version detail. Mobile/Next administration Excluded; current
consumer compatibility Required. Phase00 records exact source and API contract.
Actual development migration/schema and technical checks are required before API
acceptance. Remaining G4 native fixtures/host publication/browser evidence are
release-only and cannot change frozen business/security rules. Phase06 stays Not
Verified until these accepted journeys run. No permission question is pending.

| Case | Required outcome |
| --- | --- |
| Missing role, reporting action or owning entity Edit | Deny before reading private source or mutating; exact entity ownership checked from persisted report. |
| Unknown/global-versus-tenant entity mismatch | Fail closed; no inferred cross-scope identity. |
| Create duplicate normalized key | Deterministic conflict under unique index/coordination. |
| Upload rejected/oversize/native timeout | Specific error, no replacement/publish and no lost prior version. |
| Upload valid version | Append; keep currently published version unchanged. |
| Publish stale RowVersion |409; reload; no overwrite. |
| Publish invalid/stale fingerprint | Refuse until successful current-contract revalidation. |
| Download tampered source | Verified hash/length failure; no bytes returned. |
| Permission/session changes | Clear/cancel scoped state; hide actions and reject direct calls. |
| Existing deployment reports | Explicit import/cutover; never silently converted to global managed versions. |

## Impact matrix

Reporting Domain/Application/Infrastructure/Presentation: Extend owning capability.
EF migration/live schema: Required for global ownership, uniqueness and source history.
Canonical registry/native inspector/renderer/private storage/locks: Reuse after current
source review. Angular shared UI/theme: Reuse; generic file field only if needed.
Next/Mobile: no new administration; consumption regression Required. Runtime deployment
sources: preserve unchanged. Existing plan/acceptance states: unchanged until verified.

## Exit

Exact policy, lifecycle, persistence/schema, tests and API-backed Angular journeys are
verified, native positive acceptance recorded, required manifests/recipes/books current.
Neither a menu link nor DTO-only changes count as implementation.

## Current implementation status2026-11-02

Status: source and technical gates Verified for the expanded scope; integrated hosted/browser/native acceptance Active. Phase06 Not Verified; Phase07 not started. Current evidence: PARITY_IMPLEMENTATION_2026-11-02.md and registered parity receipts. Source includes archive, role ACLs, company read/source paths and discovery compatibility. FOLLOW-024 includes final rendered parity, actual authenticated hosted discovery response and compatible native RPT/PDF. Earlier implementation counts are historical baseline only.


## Module / source / empty-draft revision — 2026-11-02

The requester approved the existing GCT-1 extension specified in [DESIGN_SOURCE_WORKFLOW_2026-11-02.md](DESIGN_SOURCE_WORKFLOW_2026-11-02.md). It freezes server-owned source selection, metadata-only empty drafts, designer preparation and unchanged inspected version/publication policy. Initial sources remain the three executable global ReferenceData projections. Future View Builder implementation is outside this revision. G0–G3 pass for this bounded workflow; existing release-only FOLLOW-024/PROD-028 acceptance remains open. This revision supersedes file-required creation as the only creation path; file-first creation remains supported.


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


## Local SQL environment — 2026-11-03

Requester-authorized ERPSYSTEM_Local on SHABANELMOGY\SQL2017 is created and migrated.
Canonical environment/schema/View evidence and limits: LOCAL_SQL_DATABASE_2026-11-03.md
in the global-crystal-template-management plan. No hosted target/configuration switch
or actual PDF acceptance is claimed. Connection-ignore technical checks remain
current; FOLLOW-024/PROD-028 stay Open and DEF-028/DEF-027 stay Deferred.


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
