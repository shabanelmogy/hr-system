# Managed Crystal/PDF adapter — verified technical handoff

Phase06 Verified2026-10-30 precedes this Phase07 technical guide. This is a dev-only
integration minimum, not a released Countries screen or customer reporting manager.

Run Angular with start:host; authenticated /dev/reports requires both super_admin
and GlobalCrystalReports:View. Production excludes this route. The API must provide
deployed global Countries sources; a live engine/RPT is not supplied by this proof.

Select a report, enter Arabic/English filters, then Search. Editing a filter does
not silently apply it on language/source changes. Reset applies empty criteria.
Invalid fields show shared badges/messages and first-field focus. A source-change
conflict requires Reload. Denied users cannot keep an old PDF in the current view.
Open PDF/Download remain available; there is no automatic replay or hash bypass.

Shared consumers import PdfViewer/ReportWorkspace and validated PdfDocument from
public APIs. Services use validatePdfDocument, never a remote URL/HTML input.
Reporting owns authorization, API, criteria and scoped epochs. Native print/share
ownership is retained. No new renderer SDK or ActiveReports package is required.

Run npm --prefix web-angular run check. Browser driver:
node web-angular/scripts/verify-reporting-browser.mjs (40visual) and --focused
(8lifecycle), against isolated HTTPS4220 and intercepted configured host requests.
Portable results/screenshots live under the feature verification directory.
Do not edit runtime during acceptance; HMR changes invalidate the run.

DEC-028 excludes ActiveReports viewer/designer/SDK/authoring/licensing.
RISK-008/RISK-017 and PROD-002/017/019/RISK-018 retain engine/mobile/hosting/release
obligations. PROD-019 requires matching7204-entry API catalog deployment before
hosted SQL override compatibility. No commit/push/deploy was performed.
