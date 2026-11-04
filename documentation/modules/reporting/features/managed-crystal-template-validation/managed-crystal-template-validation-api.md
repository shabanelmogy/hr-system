# Managed Crystal Template Validation API Implementation Profile

## 1. Purpose

Extend the existing managed Crystal vertical slice so template compatibility is an
explicit persisted business fact tied to the canonical contract fingerprint.

## 2. Domain model

`CrystalReportVersion` retains immutable report ID, number, storage key, file name,
size and SHA-256. Validation status becomes `Pending`, `Valid`, `Invalid`, or
`NeedsRevalidation`; reason is bounded; valid evidence includes the positive
contract schema version and lowercase 64-character fingerprint. Named methods own
allowed transitions and `IsValidFor(fingerprint)`.

## 3. Aggregate rules

`CrystalReport.Publish` accepts only an owned version whose current-valid predicate
passes for the supplied current fingerprint. Archived reports remain immutable.
Add-version continues to require aggregate ownership and never changes the report
entity key.

## 4. Application orchestration

Create validates supported entity/key uniqueness, asks storage to inspect/store
against that entity, then creates the aggregate/version atomically. Add-version
loads the report first and passes its entity to storage. Import rechecks descriptor
identity/hash then delegates to create. Publish and render obtain the current
registry fingerprint and reject stale evidence before side effects.

## 5. Typed contracts

Internal inspection multipart adds `entityKey`. Success returns title, subject,
contract schema version and fingerprint. Stored-file and inspection records carry
that evidence. Public version responses add validation schema version/fingerprint;
existing public mutation request shapes stay stable. Wire evolution is additive.

## 6. Infrastructure and persistence

`PrivateCrystalReportFileStorage` keeps extension/size/OLE/platform scanning, calls
typed entity-aware inspection, stores bytes privately, calculates SHA-256 and
returns inspection evidence. EF configuration adds bounded evidence columns. The
DbContext permits modifications only to validation evidence through Domain
transitions while rejecting source/history mutation.

## 7. Migration

Generate a Reporting-owned migration in schema `rpt`. Existing versions become
`NeedsRevalidation`; no prior generic `Valid` is trusted. New fingerprint/schema
columns are nullable for non-valid states and constrained by Domain/configuration.
Inspect Up/Down, snapshot, drift and apply to the configured development database.

## 8. Runtime inspection

The legacy service resolves `entityKey` from `CrystalReportProfileRegistry`, loads
the report by temporary copy, applies existing source safety, then validates the
exact table/ordered field names and mapped Crystal types. It validates the entire
managed parameter set, not merely presence of `Language`. It requires a string,
required, single, discrete parameter whose static defaults are exactly `ar` and
`en` and whose custom-value editing is disabled. It returns the registry schema
version/fingerprint on success. SDK exception details are logged internally but do
not leak through public API errors.

## 9. Publish and render gates

Publish requires version ownership, existing permission/ACL, valid row version and
current-valid evidence. Managed render requires the active published version to
remain current-valid before file access, data building or runtime call. A registry
change therefore fails closed even before a data provider or Crystal process runs.

## 10. Tests

Implemented verification includes Domain transition/source-immutability tests,
create/add evidence and cleanup tests, publish/render stale-fingerprint handler
tests, inspector client contract/failure tests, and legacy runtime field/parameter
semantic cases including custom `Language` values. Reporting passes 120/120,
architecture 59/59, Release x64 runtime/harness passes, EF reports no model drift,
and the configured development database contains the migration, evidence columns
and both check constraints with zero invalid-evidence rows. A real approved positive
`.rpt` remains Deferred `RISK-008`: it is required before Fiscal Years live
acceptance/release, but does not prevent this development-scoped Phase 06 result.

## 11. Deployment and closure

Reporting API, its migration and the legacy runtime must deploy with identical
canonical bytes. Development database update is mandatory for this child.
Production/staging runtime packages and old-data revalidation remain governed by
the master rollout and `PROD-025`. Security work is deliberately not pulled forward.


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


## 12. Command design-source policy revision — 2026-11-03

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


## 13. Complete connection-ignore revision — 2026-11-03

Active GCT-1 supersedes its earlier retained password check. The source policy no
longer inspects any connection property; the obsolete credential boolean is omitted
from inspection receipts and ignored by ERP when supplied by older runtimes. Other
managed source/field/parameter checks remain. Canonical decision and actual user-file
diagnosis: CONNECTION_IGNORE_2026-11-03.md in global-crystal-template-management.
Current technical/native limits are in that feature section25. No historical child
is reactivated or relabeled as native render proof; FOLLOW-024/PROD-028 remain Open.


## 14. API-data container accepts saved rows — 2026-11-03

Active GCT-1 supersedes prior saved-data/connection admission checks. Reports may
retain either; the renderer always binds the provided API table (including zero
rows) before exporting. Obsolete private receipt flags are omitted/ignored, not
falsely reported clean. Structural fields/parameters remain checked. See current
global-crystal-template-manager section26 and CONTAINER_DATA_2026-11-03.md for exact
scope/technical versus native proof. Original source downloads retain original
bytes (RISK-019). FOLLOW-024/PROD-028 stay Open; no historical child is reactivated.


## 15. Optional RPT Language — 2026-11-03

Current GCT-1 supersedes mandatory Language-in-RPT checks. Zero report parameters
passes; a present String/single-discrete Language gets the requested ar/en value,
independent of designer prompt/default-list options. ERP render-input validation
and canonical fingerprint stay unchanged. Only independent native code/harness
changed; no ERP/client suite rerun or positive native PDF is claimed. Current
scope/evidence: OPTIONAL_RPT_LANGUAGE_2026-11-03.md / global feature section27.
FOLLOW-024/PROD-028 remain Open; historical child acceptance is not relabeled.
