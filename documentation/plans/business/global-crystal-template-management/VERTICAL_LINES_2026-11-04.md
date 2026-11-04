# Crystal vertical-line mirroring correction

Plan: global-crystal-template-management. Authorized slice: GCT-1.
Classification: corrective change to the existing independent Crystal renderer.

## Preflight and existing-system relationship review

The requester now requires vertical lines to mirror with the report. This
supersedes only the English vertical-line suppression rule in
RESTORE_DIRECTION_2026-11-03.md. Current source explicitly hides vertical lines in
English. The existing owner is CrystalReportDirection, called after API data
binding and before PDF export on a fresh temporary ReportDocument.

Keep Arabic coordinates, centered text, English field/picture/chart and horizontal
line mirroring, and the current diagonal-line policy. Retain each line's original
visibility, formatting, vertical endpoints and section attachment. No changes to
publication, permissions, DTOs, schema, database access, Angular, Next or mobile.
No stored/source RPT is saved or modified. This is layout only, with no migration.

## Research and implementation approach

SAP documents cloning a ReportObject, changing the detached clone, then applying
ReportObjectController.Modify(original, clone):
https://help.sap.com/doc/1eb6ed2630b940d49d85e22ba94c35bc/4.3.2/en-US/Tomodifyareportobject.html

Inspect the installed 13.0.4000 SDK and verify the atomic line update using the
actual native engine. Avoid sequential live endpoint setters that temporarily
turn a vertical line into a diagonal. Existing RAS references are sufficient.

## Verification contract

- Focused regression for visible English vertical lines and Arabic stability.
- Actual SDK build and complete existing contract/HTTP harness.
- Native in-memory lines on a temporary loaded RPT, including cross-section and
  originally suppressed lines; compare endpoints, formatting, visibility and PDFs.
- Source RPT hash unchanged; no original save, server restart or deployment.
- Update canonical feature books, manifest and generated recipes. FOLLOW-024 and
  PROD-028 retain broader hosted acceptance; DEF-027/028 remain Deferred.

Native ReportDocument loading is available on this machine in Windows PowerShell
64-bit for this correction (the earlier receipt's environment limitation is
historical). Results are recorded in the current feature verification receipt.

## Execution result

The new contract regression failed against the previous suppression policy, then
passed after the focused correction. Actual SAP Release/x64 and harness builds
pass; the complete contract/HTTP harness includes14 geometry/language cases.
The installed native engine loaded the current Countries sample and exported two
synthetic PDFs after four fixture lines were injected only in memory. Both
languages pass endpoint, visibility, style and cross-section assertions. PDF
vectors and rendered PNG review confirm actual visible mirroring. Original source
SHA256 is unchanged. Canonical receipt: feature verification/vertical-lines/.
The historical native blocker is no longer present for this local test path.
Hosted acceptance remains FOLLOW-024/PROD-028. No client/runtime server or deployment
work was performed. Documentation generation/check and planning gate follow.
