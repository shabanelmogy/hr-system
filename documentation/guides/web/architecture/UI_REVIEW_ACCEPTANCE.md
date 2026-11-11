# UI review acceptance

Requester-approved corrective review policy,2026-11-09. Applies to reviews and
changes of application screens and recurring shared presentation. Use alongside
the owning feature contract, responsive layout policy and Web Interface Guidelines.

## Separate functional and visual acceptance

A functional test proves only its asserted behavior. Successful requests, correct
cursor values, working buttons, no console errors or zero document overflow do
not establish that text, controls or data are visible and usable. Record functional,
visual, accessibility and hosted verification independently. Never describe an
untested surface or matrix cell as passed because a different check passed.

Before closing a review, inventory the actual rendered structures: header/actions,
search, criteria, Grid/Cards, row actions, selection, pagination, feedback, dialogs
and their content/footer. Assign each structure an explicit outcome: Verified,
Finding, Not verified, or Not applicable with a reason. Findings include inherited
shared/reference defects that are visible in the reviewed screen.

## Blocking reuse gate

Before implementation, record the existing shared component/public API and the
reviewed consumer's exact source path for each recurring structure. Read the
current implementation before changing it. Reusing an unrelated generic button
does not establish fidelity to an existing pagination or form composition.

If the established component covers the requirement, a parallel control, new
visual composition or speculative option is a failed review. Correct it before
handoff. A genuine domain gap must be evidenced and the difference explicitly
authorized; preference or convenience is not an exception. For the current Audit
footer, the baseline is CountriesReadPage in
`web-angular/src/app/modules/reference-data/geographical-information/countries/pages/countries-read-page/countries-read-page.html`
and shared `CollectionFooter`. Use its one record-arrow group and page-size
OptionSelect. Do not add another Page menu or page-arrow group.

## Required visual checks

| Structure | Acceptance evidence |
| --- | --- |
| Header/actions | Readable title and labels; reachable actions; no overlap or clipping at the available width |
| Search/criteria | Expanded and collapsed; every field reachable by keyboard; overlays/clear/focus perimeter visible; criteria leave usable data space |
| Data viewport | At least a complete header and row can be used; all required columns remain accessible through justified inner scrolling |
| Selection | None, one and a page selected; Clear/count do not displace paging or cover other controls |
| Pagination | Known and unknown totals; first/middle/final or no-next states; readable uncut count/summary; correct disabled actions; one visible arrow group using the existing shared footer/reference composition |
| Feedback | Loading, empty, invalid, error/retry and denied states show a readable message in the actual available content area |
| Dialog | Header, content and footer reachable; local collections get the same paging/criteria checks as the main Grid |

For pagination, measure the rendered counter's scrollWidth versus clientWidth and
the bounds of navigation buttons, count, page summary, selection action and page
size. Verify that required elements fit their containing region and do not overlap
each other. Check EN/AR direction, icon direction, meaningful labels and keyboard
focus. Do not invent a total. For cursor collections, show the current record
number without an Unknown denominator and place current page text beside page
size using the established page-count style.
Do not present two adjacent sets of first/previous/next arrows. Use the existing
record controller to cross page boundaries, including cursor pages, and verify
keyboard navigation and disabled states. Do not invent a cursor last page.
Dialog collection
actions must receive real clicks; DOM existence does not establish reachability.

For bounded/scrolling layouts, inspect the clipping ancestors as well as document
overflow. An element existing in the DOM or partially intersecting the viewport
does not prove that its complete control/message is usable. Exercise scrolling
and focus, then inspect the screenshot at the relevant state. Hit-test an actual
data cell and click its row/selection control; a sticky footer can cover a row
whose full rectangle still intersects the viewport. In short landscape windows,
verify both the data and footer after scrolling to each. Keep shared content in
normal flow when simultaneous visibility would obscure usable rows.

## Responsive and reference matrix

- Exercise EN/AR and Light/Dark with real shared components and representative
  values, including long labels and several data rows.
- Include a narrow/short case such as390x740, a tablet/narrow window, a desktop
  below820px height and landscape844x390. Width alone never certifies usable height.
- Check navigation open and closed at the same desktop viewport. Include reduced
  CSS space corresponding to125% zoom; state explicitly whether native browser
  zoom or a layout equivalent was exercised.
- Compare the relevant reviewed reference at the same viewport and state. Shared
  component reuse and reference fidelity are necessary implementation evidence;
  neither makes an existing visual defect acceptable.
- For a shared correction, verify another applicable collection consumer and both
  known-total and cursor contracts. Do not compensate in a feature-local shell.

## Evidence and closure

Record the source/build, exact commands, case dimensions/language/theme/navigation,
screenshots and meaningful geometry assertions. Retain failed baseline evidence
separately from current acceptance. A changed selector or fixture is a verifier
repair, not proof of a product correction. Investigate a failed implementation
using current primary documentation before another implementation attempt.

Run the owning application's required quality gates after runtime edits. Update
canonical owner evidence and manifests and regenerate packets. Report confirmed
regressions, inherited failures, environment blockers and manual/hosted checks
separately. A remaining observed defect stays open even when the overall unit
suite passes.

Current Angular Audit/collection regression entry points:

- `web-angular/scripts/verify-system-audit-browser.mjs`
- `web-angular/scripts/verify-system-audit-failures-browser.mjs`
- `web-angular/scripts/verify-system-audit-layout-browser.mjs`

These use built assets and synthetic APIs. They do not certify live hosted data
or other feature journeys that they do not exercise.
