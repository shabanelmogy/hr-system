# Single visible record indicator — D24, 2026-10-30

The requester rejected the two visible counters and arrow sets retained by D23,
then requested a cleaner appearance. This correction supersedes the D23 footer
presentation and acceptance assertions. One shared footer alone was insufficient.

## Current implementation

In record mode, the existing shared CollectionFooter uses PrimeNG Paginator's
native first/previous/next/last buttons, one current-record/total report between
the arrows and the existing shared row-size selector in native `templateRight`.
No page report, numbered page links or second arrow group is rendered. The group
is centered with aligned32px controls, shared colors/insets and compact spacing.
The size selector is80px wide, with no clipped floating label; its full accessible
name remains on native Select through shared `labelVisibility='sr-only'`.
For compact shared selectors (height32 or less), native Select tokens use8px
horizontal padding and a24px dropdown region, keeping the selected size fully
visible. Larger selectors and context controls preserve their defaults.
The single counter uses tabular numerals and weight600. These layout rules live
in shared components, without Countries-local overrides.
Countries Grid/Cards explicitly use this mode. Other consumers retain page mode.

The Paginator navigation unit is one record; this is independent from the server
page size. Native events call the existing controller's `navigateIndex`. Movement
within a loaded page updates active record and focus without HTTP. Crossing a
boundary requests the target server page with its current page size, then focuses
the target row. Changing the size resets the authoritative page. Unknown totals
use one fallback record group/report and size selector, without page controls.

## PrimeNG evidence and verification boundary

Before implementation, native MCP `get_component` reviewed Paginator basic,
template/current-report metadata, `first`, `rows`, `showPageLinks`, `templateRight`
and documented Pass Through sections. Native `validate_usage` reviewed the actual
modified shared footer and returned valid=true, issues=[]. Presentation ordering
uses supported Pass Through, without changing native root flex behavior.
See [official Paginator documentation](https://primeng.dev/paginator).

Full isolated Angular gate passed:61files/362tests,4configuration/10architecture
tests, TypeScript/architecture/catalog/fonts/tokens and production build.
Initial bundle496.42kB raw/129.19kB estimated transfer; no style-budget warning.
A focused adapter test distinguishes native record indices from server page size,
proves local movement emits no fetch, cross-page movement preserves server size,
and checks that default page-mode callbacks remain compatible.

Current browser proof is registered in CURRENT_CORRECTION_RESULTS.json and
CURRENT_BROWSER_RESULTS.json. The driver explicitly checks one native paginator,
exactly four native navigation buttons, one report, no numbered links and no
extra record group; native record movement, boundaries, size change and focus;
12records fitting one page; Grid/Cards and existing filter/modal/detail journeys.
The matrix is EN/AR,light/dark,390/1440. Compact EN and desktop EN screenshots were
visually inspected for centering, contained width, spacing and vertical alignment.

The driver intercepts fixtures and performs no hosted business writes. Full
Countries/source parity and hosted acceptance remain under their required slices
and PROD-019; this correction changes no API/schema/native UI or catalog keys.

## D25 final placement, value centering and first-click proof

Native template slots balance the record navigator independently of the edge
settings. Total pages is static metadata beside the size selector, as expressly
requested; no second navigation control is introduced. Compact viewports use a
second settings row. OptionSelect.valueAlign=center centers the text in the whole
control, reserves symmetric caret space via the native dropdown-width token, and
keeps the caret at its edge. Native size=small and scoped label/dropdown PT retain
full values and accessible names. There are no feature-local layout patches.

Final full Angular gate:362/0,61files; focused auth/Grid/Select41/0. Final actual
route8/8: record group center and settings edge offsets0px; selected number
horizontal/vertical offsets0px; unchanged session focus plus first blank/row
clicks cause no loading, refetch or row replacement. The Session owner uses a
coalesced verification-only path for an unchanged visible hint; actual changes or
failures and external notifications preserve the existing secure coordinator.
Company-context canonical books own that behavior. Representative footer images
are registered under current-single-navigation/. PROD-019 retains hosted checks.

Existing company-context/cross-tab browser regression also passed14/14 after the
focus correction. An earlier full run hit a5second Countries composition setup
timeout; the final full gate ran with the extra preview stopped and passed362/0.
No test timeout was increased; the final production build has no style warning.
