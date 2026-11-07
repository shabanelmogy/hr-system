# GCT-1 parity correction and company consumption — 2026-11-01

## 1. Authority and existing-system relationship

Requester reaffirmed exact behavior/UX parity with the reviewed Next manager,
explicitly included archive and role grants, then explicitly chose global templates
available to company users through role grants. Earlier exclusions were not requester
decisions and are superseded. Reporting extends its global aggregate; Platform owns
roles/membership through public Contracts, Reference Data owns global business data.
Tenant Crystal aggregates/filters remain unchanged. No source overwrite/impersonation.

## 2. Frozen lifecycle, security and persistence

Management remains super_admin + GlobalCrystalReports:View + persisted entity Edit.
Create/import, Upload, Publish and Download retain independent exact actions. Add
GlobalCrystalReports:Archive, GlobalCrystalReportAccess:View/Edit to the global catalog.
Archive is audited soft deletion, locked by report identity and expected RowVersion;
history remains visible to authorized managers but archive denies mutations/download.
Archived identities continue shadowing deployment files; publication remains explicit.

The permission tab preserves Run/Download/Upload/Publish, explicit save, role choices,
dirty protection, read-only/error/retry and conflict reload. Global audited grant rows
target canonical Platform RoleId; role labels identify tenant context. Platform validates
roles. Empty grants grant no company access. Membership is intersected with roles
assignable to the trusted current tenant; deleted/foreign-tenant roles cannot grant.

Company consumers require trusted authenticated tenant/company context, existing
CrystalReports:View (Download for source), owning entity View and persisted Run/Download
grant. They never see unmanaged deployment files, drafts, stale/invalid publications or
archive history. A grant never grants management. Platform consumption retains exact
super_admin + GlobalCrystalReports:View. Upload/Publish retain named action/entity Edit
and per-report grant unless GlobalCrystalReportAccess:Edit bypasses it, like Next.

A narrow consumer adapter may disable only named GlobalActorFilter after validating
consumer authority and applies grant/active/published predicates. It never disables
tenant/company filters or exposes unfiltered administrative data. Stored source retains
hash/length verification; rendering retains opaque source/token and fingerprint checks.

## 3. Screen/workflow contract and reuse

GCT-1 remains Single feature: template identity/version/publication/access and consumers
of that identity share an independently testable boundary. Use shared MyDataGrid,
toolbar/search/options/footer, shared PrimeNG adapters/forms/dialogs/notifications,
overview/versions/permissions tabs, list/entity/status criteria, current-source download,
metadata and source/schema evidence. Shared owners handle spacing/label surfaces/dialog
width. Existing-file registration preserves registered/rejected metadata and no local
reupload; bounded service compatibility accepts the published array and current page.
Unknown legacy registration status is explicit; empty/incompatible body is an error.
Next/Mobile consumers are reconciled; new administration there remains Excluded.

Screen reporting.global-templates.consume (Web, /reports/global): P-001 Report view
using the existing shared ReportWorkspace/GlobalReportView, permission-filtered entity
selector, report/filter selector, PDF and granted source download. No CRUD/Grid/Import
on this screen. Online only; EN/AR/RTL, empty/forbidden/loading/error/stale states and
actor/company cancellation are Required. Reference: the existing Countries Report view.
This is the consumption surface of the same global-template lifecycle, not a second
feature. Mobile receives no new administration; existing consumer policy is reconciled.

Requester extension2026-11-05: the report sidebar also exposes the existing RPT
upload/version dialog for actors who already satisfy management View/Upload/entity
Edit and report ACL checks. It reuses the same manager workflow without new API
authority or automatic publication. Resolve the exact entity/reportKey and current
publication token before mapping the exact immutable consumer identity to a management GUID.
No admin requests for ordinary readers. The existing shared form/close guard and
version list own upload, validation, unsaved protection and explicit publication.
Canonical evidence: global-crystal-template-manager/REPORT_TEMPLATE_SIDEBAR_2026-11-05.md.

## 4. Phase00 / gates / deployment / evidence

This file is the revised Phase00 preflight: current Next/API/Angular source reviewed;
ownership, permission matrix, existing-system relationship and impact frozen above.
G0/G1 pass by explicit requester decisions; G2 additive grant migration, serialized
root updates, preserved tenant isolation and narrow read; G3 shared reference journeys.
The bounded expansion is execution-authorized; remaining G4 real-native/host/browser
checks are release-only. API stage reopens Active; previous test counts are baseline
only. Required: unit/security/contract and real SQL grant/tenant/archive/race tests,
actual configured migration/schema, full API/Angular gates, denied/allowed company
render/source and EN/AR/RTL wide/small UI. A compatible native RPT is still required
for successful PDF acceptance. FOLLOW-024 owns open delivery; Phase06 Not Verified.

Deploy ERP first for new contracts; Crystal separately for earlier error taxonomy.
Rollback must revoke/disable company consumption before reverting to an older ERP
that ignores grants. Preserve immutable source/history; prefer forward fix.
