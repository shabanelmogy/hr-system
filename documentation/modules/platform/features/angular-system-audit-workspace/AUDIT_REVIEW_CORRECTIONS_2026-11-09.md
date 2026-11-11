# Audit Trail review corrections — 2026-11-09

## Authorized corrective scope

The requester approved the three findings from the current Angular Audit Trail
review: audit authority denial during export, local field-label filtering and
sorting, and usable Grid space while criteria are expanded in compact windows.
The existing browser verifier must also cover the approved POST query read.
This is maintenance under the existing System Audit, collection foundation and
collection export contracts, with no new business capability or permission.

## Verified causes and implementation ownership

1. `AuditReadState.exportSource` read the same protected audit endpoint without
   applying the existing actor denial latch on 401/403. Export reads now call
   `deny` for that captured actor. List snapshots, choices, details and export
   availability follow the same authority. A late old-actor failure cannot deny
   a replacement actor; ordinary server failures retain loaded rows.
2. `AuditChanges` displayed a translated field label but supplied the raw field
   identifier as the shared local collection's sort/filter value. The existing
   accessor now supplies the displayed label. Filtering/sorting still applies
   to the complete loaded snapshot before local paging, preserving stable IDs
   and unchanged API field names. No second filter implementation is introduced.
3. The shared CollectionFrame allowed natural toolbar/criteria height to consume
   its bounded body. At390x740 the old body measured32px for a53px header. The
   collection reuses the existing PrimeNG-backed ScrollViewport for its controls,
   bounded to40% of the collection's measured height with ResizeObserver. Small
   control groups keep natural height; larger groups scroll independently of
   data and footer. ScrollViewport's optional `maxBlockSize` keeps its default
   fill behavior for all existing consumers. No Audit-only CSS exception exists.

The requester also added pagination correction and stronger review rules to this
maintenance. CollectionFooter shows the current record number when the total is
unknown, with no Unknown denominator. Current page text is beside page size using
the existing page-count style. Compact rows separate record controls from page
size and preserve consistent 32px navigation controls and readable information. Existing
record navigation is the only exposed arrow group, reusing the existing Countries
footer composition and OptionSelect for page size. The proposed Page action menu
was rejected by the requester and removed: an existing generic button did not
justify changing the reviewed composition. The existing record controller crosses
cursor pages at row boundaries. Only current page text differs for unknown totals;
no unknown total or cursor last-page is invented. Unit/browser checks reject an
additional Page menu/paginator/arrow group in record-navigation mode.
The other shared-consumer regression exposed a size-containment collapse in a
content-sized Versions dialog grid: size containment has been removed in favor
of observing available height, preserving natural collection sizing.
Landscape containment is generalized from structured-search collections to every
CollectionFrame. A rendered hit-test exposed that its sticky footer covered a
data row even though the cell's rectangle was within the viewport. In short
landscape windows the footer now stays in normal flow inside the existing
collection scroller; scrolling makes data and footer independently reachable
without overlap. The failed baseline is retained separately from final acceptance.
The mandatory [UI review acceptance guide](../../../../guides/web/architecture/UI_REVIEW_ACCEPTANCE.md)
and root AGENTS require independent visual evidence, clipping/overlap checks,
selection states and explicit Not verified outcomes for untested surfaces.

The installed runtime is Angular22.2.3 / PrimeNG22.1.4. PrimeNG MCP capabilities
were unavailable in this session. Official ScrollArea/Table guidance and the
installed ScrollArea implementation were inspected; no MCP validation is claimed.
Relevant primary references are [PrimeNG ScrollArea](https://primeng.dev/scrollarea),
[Table](https://primeng.dev/table), [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver),
[size containment](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/contain)
and [Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md).
The landscape correction also follows the documented [sticky positioning model](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position)
and [scroll viewing region](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-padding-bottom).

### Audit-only page size — requester correction 2026-11-10

The main Angular Audit Trail uses 25 records per server page instead of its prior
fixed 50. One feature-owned `auditPageSize` constant supplies the source query,
GET parameters, POST query body, response limit and existing shared page-size
control. Export reads use the same bounded transport. Opaque cursor movement,
cached previous pages and actor/criteria resets are preserved. This request does
not change global collection defaults, other screens, or the detail changes grid.
The server endpoint and database contract are unchanged.

## Verification and prevention

- Focused state tests reproduce401/403 export denial, transient failure and actor
  replacement. Component tests cover EN/AR displayed-label filtering and sorting.
- The maintained positive verifier uses intercepted built assets and explicitly
  permits only the approved POST `/system-audit-trail/query` read, with CSRF,
  fixed 25 page size, typed column criteria and cursor reset. Unrelated writes fail.
  It exercises translated detail filtering and final401/403 export denial.
- The negative verifier also serves built assets, preserving its32error/authority
  cases without requiring a running application server.
- The layout verifier measures actual table/control bounds, keyboard reachability,
  EN/AR, Light/Dark, compact/landscape windows, navigation open/closed and reduced
  CSS space corresponding to125% zoom. This is a layout equivalent, not a claim
  of native browser-zoom testing. Known/unknown footer counters and controls are
  measured for clipping and overlap independently of navigation behavior.
- The executed acceptance receipt and retained artifacts live under
  `verification/audit-review-2026-11-09/`. Historical November6acceptance remains
  dated evidence; this maintenance does not replace unrelated release gates.

## Platform and delivery boundaries

The initial correction changed Angular behavior and shared presentation only.
The requester subsequently authorized a real total count on 2026-11-10; that
additive API/client scope supersedes the original Angular-assets-only delivery
boundary. See [the exact totals contract](AUDIT_TOTALS_2026-11-10.md).
Authorization, schema and business semantics remain unchanged. Next and Mobile
UI changes are Excluded from this authorized correction. Domain create/edit/
mock-data journeys and EF migrations are N/A. Browser fixtures do not establish
hosted SQL execution or deployed acceptance. Local SQL and API tests are recorded
separately. Totals require publishing the updated ErpSystem.Api and Angular assets;
the old server retains the unknown-total fallback. Hosted acceptance is PROD-035.
No deployment, commit/push or hosted business mutation is included.

## Executed acceptance

Verified on 2026-11-10 within the bounded local API/SQL and Angular scope. The
[portable receipt and evidence](verification/audit-review-2026-11-09/README.md)
records full Angular/API gates, 8 normal + 8 compact + 32 negative Audit cases,
20 layout contexts / 36 snapshots / 20 same-viewport Countries comparisons and
16 Report Manager cases. Functional, visual, accessibility and hosted outcomes
remain separate. The Grid options icon is in the search row at both 390px and
the supplied 493px screenshot width. Original failures and verifier repairs are
distinguished from accepted screenshots. PROD-035 and RISK-020 remain open.
