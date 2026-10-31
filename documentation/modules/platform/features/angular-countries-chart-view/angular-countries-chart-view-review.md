# Countries page-scoped charts — review applied book

Phase06 Verified2026-10-31; exact bounded S3-A5 Closed after Phase07 education.

## 1. Ownership

ReferenceData owns global Countries read semantics; Platform migration evidence, Shared UI. No API/schema/native work.

## 2. Existing-system relationships

Extend the existing Countries multi-view client. Current Next Chart children/data utilities and shared shells were inspected, alongside current Angular source; CHART_SOURCE_CONTRACT.md records exact paths/semantics.

## 3. Bounded scope and platforms

Web Chart Required. New native UI Excluded; existing native retained. Other required views remain separate children; no aggregate API or production business-route claim.

## 4. Shared reuse

Implemented generic shared charts/public-api, ChartDefinition/ChartMetric,
CollectionChartView, ChartPanel and deferred native PrimeNG ChartRenderer using
exact Chart.js4.6.1. Existing MetricCard, SurfaceCard, CollectionFrame, CardList,
OptionSelect, FeedbackState and ActionButton gained compatible generic options.
SortDirectionButton uses existing native ActionButton and bilingual short/full labels.
Feature owns pure country-chart-data and typed authority/state integration only.
Architecture rejects feature chart.js/PrimeNG imports; renderer is absent from eager
root exports. Native features first; outside pie labels use one bounded shared
plugin because current native metadata has no equivalent property.

## 5. Transport and data

Existing GET countries or POST countries/query, secure Cookie/CSRF transport and current parser/query owner. Enter Chart resets API pageNumber1 preserving criteria/pageSize. Current loaded page only; server total matching remains separate.

## 6. Permission matrix

Exact super_admin + Countries:View for visible entry/direct callback and server reads. Read-only may read; Add remains independently Create/non-read-only. Existing scoped read masks actor/revocation changes.

## 7. Business rules

Current page states positive top10, exact nonempty currencies frequency top10, UTC month cumulative, coverage with/without states. Summary total matching/loaded countries/summed states/displayed currency groups. Exact CHART_SOURCE_CONTRACT.md is authoritative; no invented aggregates.

## 8. Edges and validation

Cover null/empty codes, all-zero states, Unicode/localized labels, equal counts/top10, invalid date/UTC offsets, empty/read errors/retry, filtered page2→chart page1, actor replacement and stale responses. Native canvas accessible alternative and safe data copies; no unsafe HTML.

## 9. Lifetime and consistency

Use current scoped read, source/query identity and controller. Loading/forbidden/error remove old charts/metrics. Native PrimeNG destroys charts on exit and reinitializes changed immutable data/options; no read from theme/language changes, no commands/retries added.

## 10. Localization and accessibility

Canonical SQL-backed EN/AR and five token palettes retained; accessible canvas labels plus semantic table alternatives and reduced motion verified.

Phase06 Verified on 2026-10-31 for exact S3-A5 and requester Cards refinements.
Full npm run check passed: 75 files/417 tests, 4 configuration/12 architecture,
types/catalog/tokens/fonts and production build. Initial498.98kB/130.00kB estimated
transfer; unchanged500kB warning budget. Chart renderer212.09kB/63.63kB remains lazy.
Actual authenticated shell browser40 passed five palettes × light/dark × EN/AR ×
390×780/1440×1050. Native canvases painted, source data/counts/zeroes/UTC timeline,
theme/locale repaint without GET, reduced motion, text alternatives, first-page
reset with criteria, retry, stale authority mask and destruction verified. Native
scroll reaches the lower plots; desktop chart rows fill the available viewport.
Current Next source8 comparisons and fresh command/form/record regressions8 pass.
See verification/CURRENT_CHART_ACCEPTANCE.md and durable JSON/screenshots/logs.
No hosted business writes/deployment, schema/migration, native-device or full-pilot
acceptance. PROD-019/023, S1-A14/FOLLOW-016 and remaining pilot children stay open.

Phase06 Verified; Phase07 education completed after verification; exact S3-A5
Closed. Bounded runtime and requester refinements are documented in the current
manifest/proof. Next child is S3-A6 managed Crystal/PDF preflight; its runtime stays
gated by its own source/Phase00. Full Countries/S1-A14/release acceptance is not closed.

## 11. Verification

Phase06 Verified on 2026-10-31 for exact S3-A5 and requester Cards refinements.
Full npm run check passed: 75 files/417 tests, 4 configuration/12 architecture,
types/catalog/tokens/fonts and production build. Initial498.98kB/130.00kB estimated
transfer; unchanged500kB warning budget. Chart renderer212.09kB/63.63kB remains lazy.
Actual authenticated shell browser40 passed five palettes × light/dark × EN/AR ×
390×780/1440×1050. Native canvases painted, source data/counts/zeroes/UTC timeline,
theme/locale repaint without GET, reduced motion, text alternatives, first-page
reset with criteria, retry, stale authority mask and destruction verified. Native
scroll reaches the lower plots; desktop chart rows fill the available viewport.
Current Next source8 comparisons and fresh command/form/record regressions8 pass.
See verification/CURRENT_CHART_ACCEPTANCE.md and durable JSON/screenshots/logs.
No hosted business writes/deployment, schema/migration, native-device or full-pilot
acceptance. PROD-019/023, S1-A14/FOLLOW-016 and remaining pilot children stay open.

## 12. Impact matrix

API/schema/native runtime reused unchanged; migration N/A. Implemented generic shared charts/public-api, ChartDefinition/ChartMetric,
CollectionChartView, ChartPanel and deferred native PrimeNG ChartRenderer using
exact Chart.js4.6.1. Existing MetricCard, SurfaceCard, CollectionFrame, CardList,
OptionSelect, FeedbackState and ActionButton gained compatible generic options.
SortDirectionButton uses existing native ActionButton and bilingual short/full labels.
Feature owns pure country-chart-data and typed authority/state integration only.
Architecture rejects feature chart.js/PrimeNG imports; renderer is absent from eager
root exports. Native features first; outside pie labels use one bounded shared
plugin because current native metadata has no equivalent property.

Phase06 Verified on 2026-10-31 for exact S3-A5 and requester Cards refinements.
Full npm run check passed: 75 files/417 tests, 4 configuration/12 architecture,
types/catalog/tokens/fonts and production build. Initial498.98kB/130.00kB estimated
transfer; unchanged500kB warning budget. Chart renderer212.09kB/63.63kB remains lazy.
Actual authenticated shell browser40 passed five palettes × light/dark × EN/AR ×
390×780/1440×1050. Native canvases painted, source data/counts/zeroes/UTC timeline,
theme/locale repaint without GET, reduced motion, text alternatives, first-page
reset with criteria, retry, stale authority mask and destruction verified. Native
scroll reaches the lower plots; desktop chart rows fill the available viewport.
Current Next source8 comparisons and fresh command/form/record regressions8 pass.
See verification/CURRENT_CHART_ACCEPTANCE.md and durable JSON/screenshots/logs.
No hosted business writes/deployment, schema/migration, native-device or full-pilot
acceptance. PROD-019/023, S1-A14/FOLLOW-016 and remaining pilot children stay open.

## 13. UI pattern and fidelity

P-001 Countries collection with embedded Chart; current Next Chart source is the
reviewed baseline. Verified same four plot semantics/order, summary metrics,
font/title16px/600, card padding8px/radius16px, theme palette, source captions and
contained responsive scroll. Native PrimeNG Chart/Chart.js replaces Recharts; tick
placement, bar sizing and pie geometry follow that engine and are not certified as
pixel-identical plot internals. Full five-view visual acceptance remains S3-A8.
Requester D33 explicitly removes Chart toolbar/header Filter and scope paragraph;
Chart inherits Grid/Cards criteria and resets page1. Cards retains one shared
single-row toolbar/toggle, short accessible arrow+Asc/Desc, Search max400px and
Sort By220px. Narrow viewports scroll the toolbar internally. No feature-local shell.

## 14. Readiness and authorization

Entry generation/check429 recipes and planning passed before runtime; G0–G3 were frozen in CHART_SOURCE_CONTRACT. Remaining G4 concerns were release-only.

Phase06 Verified on 2026-10-31 for exact S3-A5 and requester Cards refinements.
Full npm run check passed: 75 files/417 tests, 4 configuration/12 architecture,
types/catalog/tokens/fonts and production build. Initial498.98kB/130.00kB estimated
transfer; unchanged500kB warning budget. Chart renderer212.09kB/63.63kB remains lazy.
Actual authenticated shell browser40 passed five palettes × light/dark × EN/AR ×
390×780/1440×1050. Native canvases painted, source data/counts/zeroes/UTC timeline,
theme/locale repaint without GET, reduced motion, text alternatives, first-page
reset with criteria, retry, stale authority mask and destruction verified. Native
scroll reaches the lower plots; desktop chart rows fill the available viewport.
Current Next source8 comparisons and fresh command/form/record regressions8 pass.
See verification/CURRENT_CHART_ACCEPTANCE.md and durable JSON/screenshots/logs.
No hosted business writes/deployment, schema/migration, native-device or full-pilot
acceptance. PROD-019/023, S1-A14/FOLLOW-016 and remaining pilot children stay open.

## 15. Handoff

Phase06 Verified; Phase07 education completed after verification; exact S3-A5
Closed. Bounded runtime and requester refinements are documented in the current
manifest/proof. Next child is S3-A6 managed Crystal/PDF preflight; its runtime stays
gated by its own source/Phase00. Full Countries/S1-A14/release acceptance is not closed.
