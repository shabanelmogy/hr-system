# Managed Crystal Template Validation Feature Full Review

Status: Phase 06 Verified and child Closed for development scope.

Reviewed: 2026-09-27

## 1. Scope and outcome

This bounded child makes managed Crystal publication mean “compatible with the
current entity contract.” It covers entity-aware `.rpt` inspection, persisted
validation evidence, development revalidation migration, and publish/render gates.
It does not implement manager UI, a real Fiscal Years template, operations, or
security hardening.

## 2. Architecture and ownership

Reporting owns report/version lifecycle and the canonical contract. Business
modules own data rows. `CrystalReportGeneratorApi` remains a database-isolated SDK
adapter that receives a file plus entity key and returns typed inspection evidence.
No second registry or DB-aware runtime is permitted.

## 3. Business lifecycle

Source identity and history are immutable. Validation is a controlled state:
`Pending`, `Valid`, `Invalid`, or `NeedsRevalidation`. A current-valid version has
status `Valid`, positive schema version and the exact current lowercase SHA-256
contract fingerprint. New synchronous submissions reach `Valid` only after exact
inspection. Old evidence becomes `NeedsRevalidation` when the contract changes.

## 4. Exact compatibility contract

The report must use the approved ADO.NET pushed source, contain no saved data,
credentials or subreports, and contain exactly the canonical table/ordered fields
with compatible Crystal types. Its managed parameter set is exactly one required,
single, discrete string parameter named `Language`, with custom values disabled and
the exact static values `ar` and `en`. Provider/XML nullability stays
enforced by the modern registry because Crystal metadata does not expose the
DataColumn `AllowDBNull` contract reliably.

## 5. Workflow and consistency

Create inspects before atomic report/version persistence. Add-version inherits the
report entity and allocates its number under the existing report lock. Import
re-lists source/hash, downloads/re-hashes, then follows the same create path.
Failed persistence cleans the newly stored file. Publish retains row-version
concurrency and requires current-valid evidence. Render checks current-valid before
opening source/building data/calling the runtime.

## 6. Scope, permissions and errors

Existing permissions, report ACL and trusted tenant/company scope remain. Security
redesign is intentionally deferred. Stable outcomes distinguish unsupported entity,
deterministic template incompatibility, runtime/inspection unavailability, stale
contract evidence, source change and optimistic concurrency.

## 7. Client disposition

Web manager state/error presentation is Deferred to
`managed-crystal-manager-experience`. Mobile administration is Excluded; report
execution is Deferred to the Fiscal Years child. Additive API fields may be ignored
by current clients. No route, component, translation or mock-data edit is claimed.

## 8. Migration and rollout

The Reporting schema owns the migration. Add validation schema-version/fingerprint
columns and mark every current development version `NeedsRevalidation`. Preserve
version bytes, hashes, numbers and published pointer for audit; the runtime gate
makes stale publication non-renderable. Apply the migration to development and
record non-development work under the plan/production notes.

## 9. Verification plan

Verified evidence: Domain transition, append-only persistence and handler/store/client tests; 120/120 full
Reporting tests; 59/59 architecture tests; Release x64 runtime and semantic
positive/negative contract harness; exact contract fingerprint parity; EF migration,
zero model drift, live development update and live schema/constraint inspection.
The repository still lacks a designer-produced real positive `.rpt`, recorded as
Deferred `RISK-008`. By requester decision this does not block backend/manager
development; it becomes mandatory before Fiscal Years live acceptance or release.
UI/device acceptance is not part of this child.

## 10. Closure rule

Exact inspection, current-valid publish/render gates and the development migration
are implemented and Phase 06 Verified. `RISK-008` real approved `.rpt`/PDF evidence
is Deferred into the Fiscal Years live-acceptance child rather than weakening strict
validation. Manager, Fiscal Years, operations and final security remain separate
siblings. Customer education moves to the manager child because that is where the
user-facing recovery behavior will exist.

### Requester-authorized corrective supplement — 2026-11-01

Existing integration maintenance is defined in the owning plan's
RUNTIME_CORRECTION_2026-11-01.md; verified source/local/package results are in
RUNTIME_CORRECTION_RESULT_2026-11-01.md. Rejected non-addressable names are omitted;
rejected addressable oversize metadata no longer hides valid reports. Malformed/
null/importable-oversize data stays fail-closed. Internal service authorization is
global and precedes body validation; current assembly alone supplies controllers.
No default key is committed or advertised. Health verifies catalog root plus
build MVID/fingerprint. Private matched runtime/ERP config packages and repeatable
smoke/real-client interoperability commands are checked.

Full ERP restore/build pass;1167tests pass with3existing browser skips on explicit
local SQL;134Reporting tests,15in-memory HTTP boundary cases and20actual IIS cases
pass. The real current ERP client and corrected .NET48 runtime preserve a mixed
catalog and enforce rejected/valid source downloads. Temporary metadata fixtures
are removed. No real SAP PDF/native engine acceptance is inferred.

FOLLOW-023 Verified. PROD-028/029 remain Open for actual host publication/denial/
catalog/native AR-EN render; saved publish passwords cannot be decrypted on this
Windows user context. No deployment performed. This does not advance the separate
business roadmap or complete its broader queued security/operations work. Public
report DTOs, scope/ACL, database meaning/schema and Web/Mobile UI are unchanged;
new Web/Angular/Mobile implementation is Excluded for this corrective supplement.
Existing shared report/error consumers remain authoritative; EF migration N/A.

### Final Visual Studio/local/host handoff — 2026-11-01

Requester publishes through existing Visual Studio profiles. PUBLISH_READY_2026-11-01.md
in the owning plan is current. Real profile transforms produce matched runtime/
ERP keys and enabled HTTPS integration without changing database/auth settings.
Runtime uses the tested WPP executable branch (UseMsdeployExe=true) for delete-only
skip rules; actual task publication preserves Reports/App_Data while removing
obsolete bin files. Local Runtime Error was stale MVC/Web.Infrastructure1vs2 bin
output; quarantined outputs/rebuild and20source-IIS cases pass. Private transforms/
local runtime key are ignored and excluded from publication; source local errors
are RemoteOnly and Release outputs On.

Requester has now published Crystal only.20actual hosted cases, exact current
assembly/fingerprint,5internal routes and catalog200with both original templates
pass; PROD-029 Verified. ERP profile publication and actual native AR/EN PDF remain
PROD-028/025/RISK-008. No new domain/schema or Web/Mobile implementation. Requester
explicitly stopped Angular; no Angular server remains active and it must not be
restarted until requested.

### Render rejection and public error correction — 2026-11-01

RENDER_REJECTION_2026-11-01.md in the owning plan records actual authenticated
inspection of both hosted Countries files: the runtime rejects database connection
metadata. This is not evidence of a missing Countries profile. Render previously
collapsed source/schema/parameter rejection into UnsupportedProfile; the correction
preserves distinct stable public errors, with localized API guidance and bounded
known-code Angular feedback through the existing shared error state. No source
policy bypass or native PDF success is claimed. The canonical XSD exporter is
verified by DataSet roundtrip; the actual .rpt files remain unchanged.

Global Angular manager is separately requested with immutable versions and explicit
publication. FOLLOW-024 owns that unfinished preflight; no global manager endpoint,
schema migration or screen is claimed by this corrective change. Next/Mobile UI
unchanged; their generic unknown-error fallback remains compatible.


## 11. Command design-source policy revision — 2026-11-03

The active global-crystal-template-manager GCT-1 revision supersedes the prior
ADO.NET/XML-only design-source and exact RPT alias policy in this shared runtime.
One table/Command may retain design connection metadata while its runtime rows are
bound explicitly from the ERP API. Exact managed field/parameter checks and
saved-data/password/subreport restrictions remain; SQL-expression fields are
unsupported. Public errors no longer require XSD conversion. No client workflow,
permission or persistence change. Canonical rules, research and current technical
versus native-environment evidence are in COMMAND_PUSH_DATA_2026-11-03.md under
the global-crystal-template-management plan and that feature's section24. Its
FOLLOW-024/PROD-028 acceptance remains Open; the historical child is not reopened
or relabeled as current native proof. DEF-028 empty-template work stays Deferred.


## 12. Complete connection-ignore revision — 2026-11-03

Active GCT-1 supersedes its earlier retained password check. The source policy no
longer inspects any connection property; the obsolete credential boolean is omitted
from inspection receipts and ignored by ERP when supplied by older runtimes. Other
managed source/field/parameter checks remain. Canonical decision and actual user-file
diagnosis: CONNECTION_IGNORE_2026-11-03.md in global-crystal-template-management.
Current technical/native limits are in that feature section25. No historical child
is reactivated or relabeled as native render proof; FOLLOW-024/PROD-028 remain Open.


## 13. API-data container accepts saved rows — 2026-11-03

Active GCT-1 supersedes prior saved-data/connection admission checks. Reports may
retain either; the renderer always binds the provided API table (including zero
rows) before exporting. Obsolete private receipt flags are omitted/ignored, not
falsely reported clean. Structural fields/parameters remain checked. See current
global-crystal-template-manager section26 and CONTAINER_DATA_2026-11-03.md for exact
scope/technical versus native proof. Original source downloads retain original
bytes (RISK-019). FOLLOW-024/PROD-028 stay Open; no historical child is reactivated.


## 14. Optional RPT Language — 2026-11-03

Current GCT-1 supersedes mandatory Language-in-RPT checks. Zero report parameters
passes; a present String/single-discrete Language gets the requested ar/en value,
independent of designer prompt/default-list options. ERP render-input validation
and canonical fingerprint stay unchanged. Only independent native code/harness
changed; no ERP/client suite rerun or positive native PDF is claimed. Current
scope/evidence: OPTIONAL_RPT_LANGUAGE_2026-11-03.md / global feature section27.
FOLLOW-024/PROD-028 remain Open; historical child acceptance is not relabeled.
