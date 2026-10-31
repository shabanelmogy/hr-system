# Countries pilot preparation — technical handoff

Phase06 Verified2026-10-30 precedes this Phase07 technical guide. Customer Education
Pack N/A: this preparation has no new business UI. Current evidence/decisions are
in AUDIT_REPORT.md and SOURCE_SNAPSHOT.json, not generated packets or old prose.

Next is S3-A2 Countries read workspace: authenticated dev preview of global
Grid/Cards/detail through existing shared controls and actual page/detail APIs.
Freeze exact read contract/Phase00 before runtime; production Countries route waits
for complete pilot. Keep exact role/permission, server page/search/sort/status,
detail fetching, field/date/code/null semantics, scope masking and cancellation.

S3-A3..A8 contracts are Queued: create/edit; archive/restore/bulk; four page-scoped
charts; global managed Crystal integration; bounded XLSX import; complete realtime/
host/reference/production acceptance. No fake controls or silent view deferral.
No configured standalone Countries Grid export was found. Template/PDF downloads
stay in their owning children. ActiveReports is Excluded by DEC-028.

Current Country DTOs have no revision precondition;409duplicate is not stale-editor
proof. Retain native current five views/offline-read policy. RISK-012 installed/lock
drift means focused Next13 is not a locked full release gate. No commit/push/deploy.
