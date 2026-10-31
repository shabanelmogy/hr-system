# Countries Chart acceptance — 2026-10-31

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

Implemented generic shared charts/public-api, ChartDefinition/ChartMetric,
CollectionChartView, ChartPanel and deferred native PrimeNG ChartRenderer using
exact Chart.js4.6.1. Existing MetricCard, SurfaceCard, CollectionFrame, CardList,
OptionSelect, FeedbackState and ActionButton gained compatible generic options.
SortDirectionButton uses existing native ActionButton and bilingual short/full labels.
Feature owns pure country-chart-data and typed authority/state integration only.
Architecture rejects feature chart.js/PrimeNG imports; renderer is absent from eager
root exports. Native features first; outside pie labels use one bounded shared
plugin because current native metadata has no equivalent property.

## Current-source comparison and explicit differences

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

Source checks use identical synthetic12-row input and current authenticated Next
route, EN/AR × light/dark × compact/wide. Next uses Recharts while Angular uses
the requester-preferred native PrimeNG Chart. No copied source-engine internals.
Current source pie outside labels can clip; the bounded shared plugin wraps and
clamps labels inside the canvas. Desktop rows use exact container-relative height:
minmax is a range and allowed both rows to shrink; fixed max(280px,100cqh−12px)
retains source row height and scroll access. See [MDN grid-auto-rows](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-auto-rows).

## Executed evidence and reproduction

- ANGULAR_CHECK.log: full npm run check, exact source after final layout/width changes.
- CHART_RESULTS.json:40 real native Chart canvases/toolbar/lifetime combinations.
- REFERENCE_RESULTS.json:8 current Next source comparisons; native source shape counts.
- COMMAND_REGRESSION_RESULTS.json:8 fresh intercepted create/edit/archive/restore/
  bulk/error/dirty/read-only/uncertain/focus/flash/keyboard scenarios.
- ENTRY_*.log:429 recipes/planning before runtime (two inherited planning warnings).
- SDK_FEASIBILITY_RESULTS.json: prior12 standalone SDK cases, separate from integration.
- screenshots/: current source and Angular compact/wide chart/toolbar captures.

Serve an isolated Angular HTTPS preview4220, then run
`node web-angular/scripts/verify-country-charts-browser.mjs` and
`node web-angular/scripts/verify-country-actions-browser.mjs` from repository root.
Optional `--smoke` is one case; `--focused` is green8, never the full40 acceptance.
For source reruns use `verify-country-charts-reference.mjs` with its existing Next
fixture backend3199 and Next HTTP3100 configuration. No live test credentials.

MCP Chart and Button final validate_usage accepted zero metadata issues. Metadata
validation is distinct from Angular/browser checks; it does not certify rendering,
domain correctness or accessibility. Select fluid metadata was consulted for shared
width changes; native API unchanged. Sources: [PrimeNG Chart](https://primeng.dev/chart),
[Chart.js responsive container](https://www.chartjs.org/docs/latest/configuration/responsive.html),
[accessibility](https://www.chartjs.org/docs/latest/general/accessibility.html),
[plugins](https://www.chartjs.org/docs/latest/developers/plugins.html),
[gradient](https://www.chartjs.org/docs/latest/samples/advanced/linear-gradient.html).

## Limits and remaining acceptance

All chart API reads/command regressions used intercepted fixtures. No hosted
business data changed; no deployment, SQL/schema migration, native-device,
production-size or complete pilot/realtime acceptance. Existing user HTTPS4210
is preserved. Chart.js MIT license copied as CHART_JS_LICENSE.md; no added label
package. ActiveReports remains Excluded. S3-A6 managed Crystal/PDF, S3-A7 Import,
S3-A8 full pilot and S1-A14/FOLLOW-016 remain separate Required work. PROD-019
owns publication/SQL overrides for current catalog7269keys; PROD-023 retains
specialist release checks. Whole migration remains Draft. Inherited planning
warnings concern education-module and erp-platform-template v2 contracts.
