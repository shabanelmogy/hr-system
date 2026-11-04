# Shared report sidebar document actions

Plan global-crystal-template-management, slice GCT-1. Existing-screen layout
change requested2026-11-04: move Open PDF and Download from above the preview to
the existing report criteria sidebar, freeing document height. Keep native iframe,
new-tab original PDF opening, download and the accepted native theme limitation.

## Source and ownership

Angular22.2.3/PrimeNG22.1.4. Existing GlobalReportView composes FormContainer,
ReportWorkspace and PdfViewer. PdfViewer alone owns the validated Blob lease.
P-001 embedded Report pattern and existing standalone report screen are retained;
no new route, permissions, domain behavior or dependency. Mobile unchanged; Next
owns the canonical new label and the API embeds its generated catalog.
PrimeNG MCP discovery returned no tools; official Button anchor documentation is
the fallback, not MCP validation.

## Bounded shared design

Expose PdfViewer's existing actions as a typed TemplateRef with optional local
visibility and stacked layout. Both locations render that one template and lease.
Add generic reportActions projection within ReportWorkspace's existing scrollable
criteria region. GlobalReportView selects the sidebar while criteria are visible;
fall back to the inline actions when the sidebar is hidden. No feature-local
button markup or Blob lifecycle. Keep actions absent while a report is unavailable
or being regenerated. Preserve responsive stacking, RTL, shared colors, keyboard
links, original download filename and noreferrer/noopener.

## Verification

Focused shared/feature cases cover sidebar placement, no duplicate actions,
criteria hide/show without iframe or Blob/request replacement, loading/error and
source/context replacement cleanup. Isolated production browser tests verify both
languages, light/dark, compact/wide, actual Open/Download. No server start/restart
or live record writes. Run format/check:format, lint, architecture, full check and
documentation/planning checks. Update owning books/manifests/recipes. Broader
hosted acceptance remains FOLLOW-024/PROD-028; blank template/ViewBuilder remain
DEF-028/027. No deployment.

Official references: https://angular.dev/guide/templates/ng-template and
https://primeng.dev/button .

## Requester additions during implementation

The requester added horizontal sidebar tabs: Search (criteria and selection) and
Options (Open/Download), then reported the active indicator is reversed in Arabic.
Reuse existing shared ContentTabs/PrimeNG Tabs. Add an opt-in keepAlive mode so
sidebar form controls remain mounted. ReportWorkspace opts into labelled tabs;
existing untabbed consumers retain defaults. Validation switches back to Search
before revealing field errors. Options uses existing shared loading/empty feedback
when no document is available. Shared viewer links and Blob lease stay single.

Installed PrimeNG22.1.4 TabList.updateInkBar computes physical offsetLeft, while
@primeuix/styles tabs consumes it as inset-inline-start. This mirrors the measured
coordinate a second time in RTL. An initial physical-left Pass Through correction
still failed browser checks: the active label measured77px after font loading but
the cached bar remained74px. After official documentation/issue research, use the
built-in tab borderWidth/activeBorderColor design tokens and hide the separate
activeBar with height0. The2px border belongs to the selected tab itself, so its
width and direction always follow the label and font. This deliberately replaces
the moving bar animation. No private method, observer, dependency patch or upgrade.
Verify both tab positions, live language changes and late font completion in EN/AR.
Official references: https://primeng.dev/tabs and
https://github.com/primefaces/primeng/issues/17940 .

Add bilingual reports.viewerOptions in the canonical core catalog and regenerate
its existing API/Web/Angular artifacts. No API endpoint/business change. Runtime
localization catalog fingerprint changes, so deployment must keep ErpSystem.Api's
embedded catalog and the Angular build synchronized. Crystal service unchanged.

## Shared manager pagination correction — requester reference clarified

The requester requires the existing Countries pagination. CountriesReadPage sets
MyDataGrid.recordNavigation=true; Global Report Manager omitted that input. Enable
it on its main, registration-candidate and version grids. The proposed footer
redesign was withdrawn before delivery, with no remaining CollectionFooter edits.
Reuse its current record counter, navigation, page count, size selector, RTL and
compact layout. No new control or shared layout option. Browser proof checks actual
record navigation, within-page movement without HTTP, last-record page loading,
size reset, bounds and non-overlap in EN/AR at1213/780/390px. Reuse existing shared
controller semantics. Official reference: https://primeng.dev/paginator .

Requester reiterated shared-component-first: no duplicate components for the same
function. This change adds no application component: it extends existing PdfViewer,
ReportWorkspace and ContentTabs, and selects Countries’ existing grid input.

## Bounded verification result

Full Angular check passed526tests/91files,26architecture tests, formatting, lint,
strict types/templates, catalog and production build. Eight sidebar browser cases
and six final Countries-mode manager cases pass. Durable receipt:
documentation/modules/reporting/features/global-crystal-template-manager/verification/sidebar-actions/verification.json.
Documentation generation/check and planning checks are recorded at handoff; broader
hosted acceptance remains FOLLOW-024/PROD-028.
