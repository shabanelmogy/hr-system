# Countries Chart current-source contract — 2026-10-30

Exact S3-A5 bounded Angular consumer. G0–G3 frozen below; remaining G4 concerns are
release-only PROD-019/023 and full-pilot/source/realtime/host acceptance. This does
not close overall migration or RISK-017 for other specialist adapters.

ReferenceData owns global Country/States semantics and existing GET countries or
POST countries/query. Platform owns migration evidence; Shared owns presentation.
No new aggregate API, schema/entity/native changes or writes. Exact super_admin
plus Countries:View and current authoritative scoped read required. Read-only may
read charts; Create action separately keeps current grant/read-only checks.

Reviewed current CountriesChartView, SummaryCards, four chart children and
chartDataUtils, existing Next shared ChartContainer/BarChart/AreaChart/PieChart and
chart theme/palette; Angular page/service/read state, MetricCard/SurfaceCard/
CollectionFrame/ScrollViewport/feedback and shared controller. Reuse those shells
first. Add a generic shared chart specification/native PrimeNG renderer and
collection chart composition; never embed vendor data/options in the feature.
If chart presentation is missing in SurfaceCard, extend it with a compatible
appearance. Keep Chart.js/native renderer behind lazy shared loading and a named
public capability entry; existing architecture checks must enforce the boundary.

Source four-chart order and behavior:
- States: vertical bar, positive statesCount only, descending, top10, active-language
  names, one translated Active States legend, source subtitle.
- Coverage: pie, count countries with statesCount>0 versus zero, translated names,
  visible-page denominator, legend/tooltip/name+percentage labels. Native Chart.js
  has no outside-slice label option; a bounded shared per-chart label plugin is
  allowed for this demonstrated gap, with bounded readable labels in RTL/mobile.
- Currencies: horizontal bar, non-null nonempty currencyCode grouped by exact source
  value, descending frequency/top10, secondary theme series, no fake Unknown group.
- Timeline: UTC YYYY-MM valid creation dates only, sorted ascending, cumulative
  number created on the current loaded page, success-colored area; omit if no valid
  months. No extrapolation from missing months or whole-dataset analytics.

Summary metrics are total matching (server total), loaded countries, sum of states
on this page and number of displayed currency groups (top10, matching current
source). Current typed transport caps rows5000 and validates nonnegative counts;
helpers still skip malformed dates and retain zeroes honestly. Currency/null/empty,
equal counts, Unicode names, timestamp offsets and >10 groups require pure tests.

Entering Chart resets server page to0 (API pageNumber1), preserving filters/search/
sort/status/pageSize. Shared composition reuses CollectionFrame;
Chart has no record/paging footer, matching Next. Back to Grid/Cards retains the
current query. Clear bulk selection on view changes. Old actor/criteria/permission
results stay masked through existing scoped read; locale/theme changes do not GET.

Requester final D33 decision2026-10-31: Countries Chart has no search/filter
toolbar, header Filter action or page-scope paragraph. It inherits Grid/Cards
criteria and resets the page. Cards alone retains the shared one-row toolbar and
shared open/closed state with Grid; native sort direction has an arrow plus short
bilingual text/full accessible name. Search max400px, Sort By220px; narrow screens
use contained horizontal scrolling. Generic chart toolbar API remains optional
for other consumers. This supersedes the intermediate request to show Chart filters.

Shared MetricCard uses the compatible raised source appearance. Layout: four metrics1/2/4 columns
at compact/600/900 and charts1/2 at900, gaps6px, chart card min-height280, independent
native scrolling with bottom gap; page must not overflow. Extend shared chart card
header/content with compact source title/subtitle/icon/padding/radius/shadow. Use
existing tokens and five palettes; theme/language updates repaint the real canvas.
Native legend/tooltips/grid/axes/responsiveness first. Motion preference respected
and native chart destruction verified on exit. Accessible canvas label and a shared
text/table alternative expose the same values, including zero, without relying on
color or hover alone. Keyboard remains usable; no feature-local native errors.

Loading/error/forbidden/empty/retry through current Shared feedback; no old metrics
or canvas while loading/authority changes. Empty supports existing permitted Add.
New native UI Excluded; retained native Countries/Charts unchanged. Chart only is
Required here. Managed Crystal/PDF, XLSX Import and complete pilot Required in their
own queued children; standalone Countries grid CSV/XLSX and ActiveReports Excluded.

Installed PrimeNG22.1.4/chart metadata and basic example consulted. Its source uses
chart.js/auto, init/reinit/destroy and native responsive/data/options/aria APIs.
Prior isolated Chart.js4.6.1 proof12 combinations is retained as SDK feasibility
only; it does not establish Angular integration. Install exact4.6.1 with lockfile
and package LICENSE; actual full Angular and browser proof required. No added
chart-label dependency. MCP metadata limits and final validation are separate from
Angular/browser evidence. Sources: https://primeng.dev/chart ;
https://www.chartjs.org/docs/latest/configuration/responsive.html ;
https://www.chartjs.org/docs/latest/general/accessibility.html ;
https://www.chartjs.org/docs/latest/developers/plugins.html .

Entry: existing approved v2 decomposition/one active child, source review, four
initial applied books and current-only manifest/recipe registration, generation/
check/planning. Only after these pass may the exact Web runtime begin. Phase06
requires focused pure/shared/owner tests, full Angular checks and production budget,
actual authenticated browser40 (five palettes×light/dark×EN/AR×390/1440), page reset/
criteria/empty-zero/error/retry/stale actor/theme-language/teardown, exact current
source comparison at same viewport and retained command regressions. No real-host
business writes. Phase07 education only after Verified; full pilot stays gated.


## Completed bounded acceptance — 2026-10-31

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
