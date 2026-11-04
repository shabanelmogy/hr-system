# Existing-report registration — layout correction

Corrective UI work within the approved GCT-1 scope after the requester supplied
`1.png`: the action/header was cut off, report filenames were truncated, the
entity selector dominated the dialog and its floating label was clipped.
No API, permission, persistence, native report or publication behavior is changed.

## 1. Current layout

The existing shared MyDataGrid remains the collection owner, including search,
Grid options, loading/error/retry states, footer and server paging. The manager
supplies five domain columns: report summary, file size, registration, validation
reason and registration action. Name, full source filename and optional subject
are composed through the generic shared RecordSummary; no information is removed.
Long filenames and rejection reasons wrap instead of being ellipsized.

Entity selection belongs to the grid's shared toolbarFilters slot at the standard
responsive width. Shared DialogPanel reserves floating-label space at the start of
its body. StatusBadge distinguishes registered and unregistered entries. Outlined
registration actions avoid the previous large raised buttons and remain disabled
for registered or rejected sources.

## 2. Reusable behavior

- RecordSummary provides primary text and optional secondary/metadata text using
  shared theme tokens; it is exported from the shared UI public API.
- ActionButton keeps action captions on one line. Optional descriptions can wrap.
  The opt-in compactOnSmallScreens capability shows the supplied icon in narrow
  viewport/container layouts while retaining an explicit accessible name/title.
- CollectionColumn.compactWidth is opt-in. Below a 600px collection viewport the
  action column uses its compact width; other columns keep normal minimum/header
  rules. Desktop sizes and saved width preferences are preserved outside compact
  layouts. The column heading stays available to assistive technology.
- PrimeNG's built-in frozen columns keep registration at the logical trailing edge.
  The installed22.1.4 FrozenColumn implementation calculates physical sibling
  offsets in DOM order. During actual RTL horizontal scrolling this displaced the
  trailing action. MyDataGrid supplies generic logical pinned-neighbour offsets
  for RTL, including multiple frozen columns and reserved trailing row actions.
  These rules live in shared MyDataGrid, not the reporting feature.

No PrimeNG MCP was available. The installed package source/types and official
[Table documentation](https://primeng.dev/table),
[Dialog documentation](https://primeng.dev/dialog) and
[Select documentation](https://primeng.dev/select) were reviewed. The additional
logical-offset behavior addresses the reproduced installed-version gap.

## 3. Verification

Run `npm run check` in web-angular, then
`npm run verify:report-registration-browser`.
The browser script reads the production build through isolated Playwright request
routing. It never starts/restarts Angular and never calls live report/grant APIs.
Its fixtures include a valid unregistered candidate, an already registered one,
a rejected one, a long filename, bilingual subject and long rejection reason.

The matrix covers EN/AR, LTR/RTL, green/orange/blue/navy/monochrome, light/dark and
1213px/390px widths:40 cases. It checks action visibility/hit testing before and
after actual horizontal scrolling in the proper direction, frozen positioning,
responsive icon/label and column widths, unclipped selector labels, no page/dialog
overflow, disabled actions and absence of browser runtime errors. Captures and
machine-readable results are registered under the feature verification directory.

The full Angular gate and final browser receipt record actual results. Shared
width tests cover compact action columns, unchanged desktop/header sizing,
invalid compact widths and multiple logical frozen offsets.

## 4. Acceptance boundary

This verifies the registration dialog's rendering with controlled data on the final
production build. It does not prove the authenticated hosted discovery response,
real file registration/publication, ACL changes, company consumption or native PDF.
Those remain FOLLOW-024; overall Phase06 is Not Verified and Phase07 has not started.
No application server start/restart, remote deployment, commit or push occurred.

## 5. Recorded result

Registration layout correction: full Angular check passes499tests/89files,26architecture cases, format/lint/strict types/templates and production build with no budget warning. The production-build browser fixture passes40cases across EN/AR, both directions, five palettes, light/dark and1213px/390px. It verifies no clipped action/label, responsive icon-only actions and actual horizontal scrolling in both directions. Native/host/remaining manager acceptance stays FOLLOW-024; Phase06 Not Verified.
