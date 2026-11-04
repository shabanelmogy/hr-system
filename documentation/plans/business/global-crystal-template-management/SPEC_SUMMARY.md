# Global Crystal Template Management — Specification

Build the Angular global template manager with the existing managed lifecycle:
create/import template, append immutable source versions, inspect/revalidate,
download, and explicitly publish a current-contract valid version. The selected
published version stays active when another version is uploaded or rejected.

The actor must be super_admin and have exact reporting action authority plus Edit
permission for the template's owning global entity. Discover/select only permitted
Countries/States/Districts. Apply the same rule server-side on every read and write,
including source/version IDs; never trust client entity keys as authorization proof.

Reuse Reporting contracts, registry, native inspector/renderer, private verified
file storage, transaction locks, concurrency/error discipline and shared Angular
components. The current CrystalReport/CrystalReportVersion are TenantAuditableEntity:
do not erase tenant filters, fake a tenant ID or reuse a company administration route
for global rows. Reconcile explicit global ownership in Phase00 and add/apply the
owning Reporting migration before claiming domain implementation.

Global report consumption must eventually use the published managed global version.
Existing deployment files stay unchanged; they are import candidates rather than
mutable live version storage. Define and test a deliberate compatibility/cutover
policy before changing the existing hash-based global preview API. No silent
fallback to an older/unvalidated deployment file after managed publication fails.

Angular uses MyDataGrid, shared header/form/dialog/feedback and PrimeNG controls.
Lifecycle actions and version evidence are explicit. Mobile/Next manager UI is
Excluded by requester platform choice; existing consumers require compatibility
regression. Native positive fixture/host publication and browser acceptance remain
separate required evidence. The manager source and technical checks are implemented; actual hosted/native/browser acceptance remains explicitly Not Verified.


## Module / source / empty-draft revision — 2026-11-02

The requester approved the existing GCT-1 extension specified in [DESIGN_SOURCE_WORKFLOW_2026-11-02.md](DESIGN_SOURCE_WORKFLOW_2026-11-02.md). It freezes server-owned source selection, metadata-only empty drafts, designer preparation and unchanged inspected version/publication policy. Initial sources remain the three executable global ReferenceData projections. Future View Builder implementation is outside this revision. G0–G3 pass for this bounded workflow; existing release-only FOLLOW-024/PROD-028 acceptance remains open. This revision supersedes file-required creation as the only creation path; file-first creation remains supported.


Manual SQL View refinement and execution are recorded in MANUAL_VIEW_IMPLEMENTATION_2026-11-02.md. User explicitly selected real SQL Server View names and initial global shared data. API/Web technical stages are Verified for this revision; integrated hosted/native acceptance remains Active (FOLLOW-024), Phase06 Not Verified. Next/Mobile administration remains Excluded. Builder is DEF-027.
