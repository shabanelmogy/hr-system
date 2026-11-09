# Report header actions and responsive search — 2026-11-08

## Authorized scope

Presentation maintenance of existing Angular collections and managed reports.
No API, schema, permission model, Next.js or Mobile runtime change.

## Applied presentation

- Collection search uses labels in the control border. Below34rem of actual
  panel width, labels are visually hidden while native label associations and
  accessible names remain; empty text shows its placeholder and selects retain
  their selected value.
- One-row search uses120px field,144px operator/filter selectors and an expanding
  query with a160px minimum. It starts at46rem of actual panel width, or54rem
  when sorting controls are present. Wrapped filters share available width and
  align with the action group. Compact typography remains14px/12px.
- Current-PDF Open/Download actions use the existing PdfViewer template in the
  existing page title card. Countries, States and Districts consume Reporting's
  public contract; System Error Logs uses its composition adapter.
- PdfViewer remains the sole Blob URL owner. There is no duplicate document
  toolbar or lease. RPT source operations retain their sidebar and grants.
- Empty Options tabs are omitted. ReportWorkspace uses260px criteria and16px
  spacing, with bounded stacked rows/gap12 below54rem. Standalone routes own the
  available-height contract and fill the remaining viewport.

## Executed browser checks

All requests below use intercepted API/catalog/PDF fixtures and built Angular
assets, without starting a development server.

| Command | Executed result |
| --- | --- |
| `verify-countries-screen-browser.mjs --pagination-layout` |40 contexts /80 Grid and Cards view passes; EN/AR, Light/Dark,320 through899px including844×390; font sizes, floating/hidden labels, label associations, search/clear, filters and contained paging |
| `verify-countries-screen-browser.mjs --search-layout` |20 contexts /40 Grid and Cards view passes at390/690/900/1012/1440px; single-row and wrapped control alignment, responsive thresholds and containment |
| `verify-country-report-browser.mjs --focused` |8 lifecycle passes; EN/AR, Light/Dark,390/1440px; header links, exact downloaded fixture bytes, criteria/theme changes, stale/invalid/empty/error handling, cancellation, authority and Blob revocation |
| `verify-country-report-browser.mjs --layout` |20 layout passes;320/690/844/1012/1440px, including844×390; header target bounds, coarse-pointer sizes, open navigation, finite document area and retained lease while hiding criteria |
| `verify-reporting-browser.mjs --focused` |8 standalone lifecycle passes; header links, exact downloaded bytes, full-height contained workspace and permission/error/resource handling |

## Quality gates

The final `npm run check` passed: formatting, typed/template lint, configuration,
tokens/fonts/catalog, architecture, application/spec types,1002 tests in196 files
and production build. Build warnings remain for the initial bundle and PageHeader,
CollectionFrame and collection-search styles; the latter is4.24kB against its4kB
warning threshold (244bytes over). There are no build-budget errors.
Earlier focused failures from relocated selectors were corrected by asserting
the new header placement while retaining the original lifecycle checks.
Canonical packets are regenerated with `Generate-Documentation.ps1` and checked
with `Generate-Documentation.ps1 -Check`; generated packets are not hand-edited.

## Limits

Synthetic valid PDF bytes prove document/UI handling and downloads. These checks
do not certify a hosted Crystal engine, live RPT output, native PDF paint or a
physical device. Existing report source/publication contracts remain authoritative.
