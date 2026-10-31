> Superseded footer presentation: D24 in SINGLE_NAVIGATION_REVIEW.md owns the
> current single native arrow set and single counter. Earlier dual-counter proof
> below is historical; current results are CURRENT_CORRECTION_RESULTS.json.

# Countries row navigation correction — D23, 2026-10-30

The requester clarified that row navigation must remain available on page 1 of 1.
The prior correction treated its removal as part of removing duplicate pagination;
that interpretation was incorrect. D23 supersedes that part of D22.

## Implementation

Countries Grid and Cards explicitly set the existing shared `recordNavigation`
option. The shared `CollectionFooter` projects a single reusable record-controls
template into PrimeNG Paginator's documented `templateLeft`. One footer and one
native paginator contain distinctly named record and page controls. The existing
unknown-total fallback uses the same record template. Other consumers retain
their default false; no parallel pagination or feature-local navigation is added.

Record buttons call the existing collection controller. Within a page, moving
changes the active record, counter and focus without fetching. At a page boundary,
the controller requests the target authoritative page and focuses the intended
record after its response. First/last boundaries and pending/forbidden guards are
preserved. Native page buttons keep their normal single-page disabled state.

## PrimeNG evidence

Native MCP tools became available during this correction. `get_component` read
Paginator template/accessibility/API documentation, including `templateLeft` and
the `contentStart` Pass Through section. `validate_usage` reviewed the actual
modified shared footer and returned `valid: true`, `issues: []`.
Source: [official Paginator documentation](https://primeng.dev/paginator).
No new dependency, translation catalog identity or API/schema change.

## Verification

Full isolated `npm run check` passed: 61 files /356 tests, four configuration
tests and ten architecture-rule tests; TypeScript, architecture, catalog, fonts,
tokens and production build passed. Initial bundle 496.42kB raw /129.16kB estimated
transfer; no component style-budget warning.

Current browser execution and source fingerprints are registered in
`CURRENT_CORRECTION_RESULTS.json` /`CURRENT_BROWSER_RESULTS.json`. Required cases:

- Exactly one native paginator containing one record-control group.
- Record next/previous moves and focuses the correct row without HTTP.
- Next at the last visible row fetches the next page and focuses its first row.
- First/last fetch only when the target lies on another page.
- With 12 records and page size25, native page-next is disabled on page1of1,
  while record next/previous/first/last still work without HTTP.
- The Cards view uses the same record controls and focus behavior.
- EN/AR, light/dark, 390/1440, contained scrolling and aligned native controls.
- Existing filter/modal/read-dialog/browser journeys remain in the same driver.

Result: all eight actual-route cases passed. The shared collection regression
also passed all eight cases after the correction, covering Table/Cards, record
and page navigation, scope/state changes, selection and keyboard behavior,
including unknown-total fallback. Representative EN desktop and AR compact dark
screenshots were inspected; both contain one paginator with the record group.

The driver intercepts fixture API responses; it does not write SQL business data
or claim authenticated hosted-session verification. Native desktop automation was
unavailable in this session; the user's open browser/session was not inspected.
Complete Countries source parity, mutations and hosted query/catalog release
remain under their existing required slices and PROD-019.
