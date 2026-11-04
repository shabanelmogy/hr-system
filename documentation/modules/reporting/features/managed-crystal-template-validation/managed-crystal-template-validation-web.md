# Managed Crystal Template Validation Next.js Implementation Profile

## 1. Boundary

No Next.js runtime implementation is authorized in this child. The existing Report
Manager is a downstream consumer whose validation-state UX belongs to the next
feature.

## 2. Route and transport

Existing manager routes and create/add/import/publish request bodies remain stable.
Version responses gain additive validation schema-version/fingerprint fields; the
current client may ignore them until the manager child.

## 3. Server list

Deferred. Search, filters, sort, paging and status vocabulary are unchanged.

## 4. Grid

Deferred. The next child must reuse the shared grid/toolbar/status components and
surface compatibility states without local filtering.

## 5. Cards and chart

Excluded in this child. No new view is authorized.

## 6. Forms and lifecycle

Deferred. Current upload/import/publish controls remain; the next child will add a
supported-entity selector, precise validation feedback and recovery/revalidation
behavior through the shared form/dialog system.

## 7. Import

Server `.rpt` import remains available with the existing request. No spreadsheet
import or client parsing is introduced.

## 8. Report

No report-view change. API render now fails closed on stale validation evidence;
user-facing mapping is verified in later manager/Fiscal Years children.

## 9. Localization and access

No visible text or permission change. Existing server permissions and report ACL
remain authoritative. Security redesign remains the final phase.

## 10. Realtime and cache

Excluded. No new event or invalidation is introduced.

## 11. Offline and mock data

Excluded. Template validation is online/server authoritative and cannot be mocked
as final business evidence.

## 12. Tests

No Web source test is required for this no-change child. Phase 06 records a scoped
diff/no-contract-break review. The next manager child owns focused UI/service tests.

## 13. Accessibility, RTL and responsive behavior

Unchanged. Later visible state/error work must be bilingual, RTL/LTR aware,
keyboard/focus accessible and responsive using shared components.

## 14. Release disposition

Web is Deferred, not silently complete. This child may close with no Web edit only
after API/runtime verification and explicit downstream handoff evidence.

> Update: the selector and revalidation UI deferred here were delivered by `managed-crystal-manager-experience` (Web profile Verified 2026-09-29); this child's Web disposition is historical.

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


## 15. Command design-source policy revision — 2026-11-03

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


## 16. Complete connection-ignore revision — 2026-11-03

Active GCT-1 supersedes its earlier retained password check. The source policy no
longer inspects any connection property; the obsolete credential boolean is omitted
from inspection receipts and ignored by ERP when supplied by older runtimes. Other
managed source/field/parameter checks remain. Canonical decision and actual user-file
diagnosis: CONNECTION_IGNORE_2026-11-03.md in global-crystal-template-management.
Current technical/native limits are in that feature section25. No historical child
is reactivated or relabeled as native render proof; FOLLOW-024/PROD-028 remain Open.


## 17. API-data container accepts saved rows — 2026-11-03

Active GCT-1 supersedes prior saved-data/connection admission checks. Reports may
retain either; the renderer always binds the provided API table (including zero
rows) before exporting. Obsolete private receipt flags are omitted/ignored, not
falsely reported clean. Structural fields/parameters remain checked. See current
global-crystal-template-manager section26 and CONTAINER_DATA_2026-11-03.md for exact
scope/technical versus native proof. Original source downloads retain original
bytes (RISK-019). FOLLOW-024/PROD-028 stay Open; no historical child is reactivated.


## 18. Optional RPT Language — 2026-11-03

Current GCT-1 supersedes mandatory Language-in-RPT checks. Zero report parameters
passes; a present String/single-discrete Language gets the requested ar/en value,
independent of designer prompt/default-list options. ERP render-input validation
and canonical fingerprint stay unchanged. Only independent native code/harness
changed; no ERP/client suite rerun or positive native PDF is claimed. Current
scope/evidence: OPTIONAL_RPT_LANGUAGE_2026-11-03.md / global feature section27.
FOLLOW-024/PROD-028 remain Open; historical child acceptance is not relabeled.
