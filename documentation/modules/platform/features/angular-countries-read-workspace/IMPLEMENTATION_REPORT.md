> Latest footer correction: D24 uses one native arrow set and one record/total
> indicator. See verification/SINGLE_NAVIGATION_REVIEW.md. The D23 two-counter
> arrangement is superseded. Complete Countries acceptance remains Not Verified.

> Current status: **Not Verified** for complete current-source acceptance. The correction has passed Angular357 tests/build and eight actual-route browser cases, including one native PrimeNG Paginator with record navigation on page1of1 (D23) and a read dialog without initial focus. See verification/CURRENT_GRID_REVIEW.md, ROW_NAVIGATION_REVIEW.md and CURRENT_CORRECTION_RESULTS.json. Historical standalone proof below is retained provenance; S3-A2 is Active and the S1-A14 remainder is Queued.

# Countries read workspace — implementation and acceptance

Phase06: **Verified** for S3-A2 on 2026-10-30. This authenticated development
preview delivers only the frozen global read workflow; full Countries/pilot and
production business-route acceptance remain S3-A3..A8. ActiveReports stays Excluded
by DEC-028. API business/schema/native runtime is unchanged.

## 1. Delivered behavior and ownership

ReferenceData owns six Country fields and global authorization. Angular adds
strict list/detail/query contracts, a cookie-only cold GET service and a scoped
read owner. Page defaults match current Next: page1 HTTP/page0 UI, size10,
active, createdOn descending. Search is trimmed/debounced300ms and bounded200;
field/operator/status/sort are validated allowlists. Server owns filtering,
sorting and paging; no all-data fetch or local business-query implementation.
Metadata, status, ID uniqueness and detail identity are runtime validated.

MyDataGrid and CardList share one owner; switching view or language adds no GET.
Shared toolbar/search/options/footer/page-size/record navigation remain intact.
Detail is fetched by ID and displayed in six shared read-only fields, without
Save or unsaved registration. Exact super_admin plus Countries:View guards
reads/callbacks; current403 latches until identity replacement. Identity loss,
criteria changes, close and destruction mask/cancel obsolete content.

## 2. Shared-first changes and research

Generic backward-compatible capabilities: bounded CollectionSearch; typed card
header/footer projection; responsive1/2/3/4-column card layout and entity surface;
inline progress with caller-owned accent; optional solid/outline status badges;
FormContainer.showSubmit=false. Existing defaults remain. Domain quality score,
levels and colors stay in the owning Countries composition, copied from current
source thresholds90/75/60. Cards hide absent optional details, use actual code
chips, dates, page states count and a separate shared View action.

The composed test caught PrimeNG22.1.4 emitting a temporary ascending pair while
its field/order input effects initialize. Shared MyDataGrid coalesces the current
microtask pair and suppresses owner-equivalent events; initial default remains
descending with one GET, and actual header/keyboard sorting still works.
Evidence: installed primeng-table sortFieldInput/sortOrderInput effects;
[PrimeNG presort documentation](https://primeng.dev/table) and
[Angular input lifecycle](https://angular.dev/guide/components/lifecycle).
The jsdom ResizeObserver substitute exists only in tests; actual responsive and
scroll proof is Chrome. See [jsdom layout limitation](https://github.com/jsdom/jsdom/issues/3368)
and [Vitest global stubs](https://vitest.dev/api/vi).

## 3. Verification and practical limits

- Full Angular check passed:54files/323unit tests,10architecture,4API-config,
 14fonts,strict types,tokens,catalog and production build. Initial473.99kB remains
 below500kB; no Countries development route in production route configuration.
- Chrome40visual cases:5palettes ×2modes ×2languages ×390/1440; real Grid/Cards,
 52px rows, shared footer, contained document width and1/4 card columns.
- Chrome8focused flows: actual Grid/Cards sort, search field/operator and trimmed
 debounce, 201-character programmatic validation/no request, status/archive,
 page/size/last-record, locale/no duplicate GET, six-field detail,404/retry,
 pending close, empty/malformed/network/401 recovery,403 latch, revoked permission,
 wrong role/zero reads, identity replacement and pending unmount.
- Shared collections8,role home14,login10,language20,context24,managed PDF8
 regressions passed. Portable logs/results/screenshots are in verification/.
- Current Next Countries8 captures at the same2modes/2languages/2widths were taken
 using the retained e2e backend fixture, with reduced motion. S3-A1 API74 and
 Next5files/13tests remain source-audit provenance, not fresh full suites here.

All new Countries browser business traffic is intercepted GET fixtures at the
configured hosted API origin; no real host SQL/business write, live mobile device,
or full production Countries acceptance is claimed. Native client is retained;
new native creation/edit/view/list/mock journeys are Excluded in this child.
Inherited Next installed16.3.5/lock16.4.3 drift remains RISK-012. Existing analyzer
warnings and planning warnings remain separate from feature checks.

## 4. Same-viewport source comparison and approved scope differences

Compared desktop/compact EN/AR light/dark Grid and Cards against current source.
Retained fields, code/state/status indicators,52px rows,56px grid header, quality
thresholds/colors, responsive card counts, dates and server criteria. Shared
generic keyboard active-record outline and record footer remain intentional.
The standalone authenticated /dev/countries preview omits the application shell;
it is not a new production navigation target. Source Create/Edit/Archive/Restore,
selection/bulk and Chart/Report/Import controls are absent according to this
read-only child; they are Required in their queued siblings, without placeholders.
PrimeNG control shapes and shared toolbar/footer composition are adapted, not
pixel-identical MUI internals. Optional phone/currency labels and the generic
geography icon are readable domain composition differences. No full fidelity
claim for unfinished pilot journeys follows from these captures.

## 5. Release, localization and handoff

No new translation keys:21sources/7204entries and strict catalog hash
18508f727a911a54bbd521601ced5663a7a0215e96e2b65265d10b4b8ea2c4cc retained.
SQL-backed runtime overrides remain the existing localization owner's mechanism;
PROD-019 owns matching hosted catalog publication/override checks. No duplicate
translation store or token storage. PROD-002/017/019 and RISK-018 remain release
checks; RISK-016/017/008 retain source drift/specialist/full pilot obligations.
No migration is needed or claimed for this read-only client adaptation.
Phase07 technical preview guide follows this verification. Next sole candidate is
S3-A3 create/edit preflight; runtime requires its own frozen write/uncertain-result
contract and Phase00. No commit, push or deployment performed.
