# Audit Trail totals and compact footer — 2026-11-10

## Authorized existing-feature change

The requester requires 25 records per main Angular Audit page, a real total/page
count, an icon-only Grid options action at the supplied 493px-wide screenshot,
and corrected compact pagination. This extends the existing Platform audit read
capability. It does not add a business screen, writer, permission or database field.

## Existing-system relationship and ownership

Platform `GetAuditTrailQueryHandler` owns aggregation through registered
`IAuditTrailSource` ports. `AuditTrailSource<TContext>` owns each module's EF query.
Extend those owners; never read foreign tables from Platform. Authentication,
SystemAuditTrail:View, trusted tenant/company scope and newest-first keyset order
are unchanged. The generic CollectionFooter already supplies count/page-size
presentation. A known count does not grant random access to cursor pages, so the
existing collection query needs a generic sequential-access marker. This is an
evidenced contract gap authorized by the request for totals; no parallel footer
or Page menu is introduced.

### Shared/reference reuse inventory

| Recurring structure | Existing shared owner and reviewed consumer |
| --- | --- |
| Grid/footer/record/page-size controls | `web-angular/src/app/shared/ui/collections/collection-footer/collection-footer.{ts,html,scss}`; `web-angular/src/app/modules/reference-data/geographical-information/countries/pages/countries-read-page/countries-read-page.html` |
| Search and Grid options row | `web-angular/src/app/shared/ui/collections/collection-frame/collection-frame.{ts,html,scss}` through the same Countries `MyDataGrid` composition |
| Icon-only compact action | Existing `ActionButton.compactOnSmallScreens`, `web-angular/src/app/shared/ui/buttons/action-button/action-button.scss`; fix its quiet-button selector precedence and use its current public input |
| Scrolling criteria/body | Existing `ScrollViewport` and CollectionFrame; no feature-local shell |

The supplied screenshot exposed that footer selection was a sibling of the
record/page layout, reducing its usable width and causing independent wrapping.
Project it into the existing page-context cell. Keep selection, record controls
and size in one row where they fit; below 416px of footer content width, use the
existing two-row compact arrangement. Non-record-navigation selection retains its
previous outlet. The toolbar's inline-size container now applies to responsive
as well as adaptive consumers, allowing its existing narrow simple-search layout
to keep the search input and Grid options icon in one row. Inline-size containment
does not reintroduce the rejected block-size containment of dialog collections.

## Business/read rules

| Rule | Primary owner | Outcome | Evidence required |
| --- | --- | --- | --- |
| Count only the authorized module sources and trusted scope | Platform handler | No foreign tenant/company count | Handler and source scope tests |
| Count all matches to the same filters, without cursor or Take | Module source | Exact aggregate for current predicates | Count/list predicate tests |
| Counting is opt-in | Query request | Legacy and export calls avoid extra count queries | Default/opt-in transport tests |
| Keep opaque sequential traversal | Angular state/shared collection | No enabled last-page jump to an uncached cursor | Known-total sequential tests/browser |
| Main list uses 25 | Audit owning types/service/state | GET and POST query agree | Transport/state/browser assertions |

## Edge cases and validation

| Scenario | Result | Owner / verification |
| --- | --- | --- |
| No matches | Total 0, empty rows, no next cursor | Handler/source and shared empty contract |
| Module filter | Count only selected module | Handler test |
| Typed column/user/date filters | Same predicates as list | Shared EF filter builder + scope/filter test |
| Cursor supplied | Count ignores cursor; page remains bounded | Handler/source tests |
| Old deployed API omits totalCount | Preserve current-record-only fallback | Angular schema/state/browser |
| New entries between reads | Count is current at its read, not an atomic cross-module snapshot | Existing append-only read consistency; nextCursor remains traversal authority |
| Count failure/cancellation | Existing error/cancellation path; never fabricate 0 | Existing read state + propagated task cancellation |
| Untrusted negative/noninteger/unsafe total | Reject payload | Angular parser |
| Writes/lifecycle/import/transactions/concurrency/money/files | N/A: metadata over existing read-only history | No domain/schema/permission mutation |

## Impact and platform decisions

| Surface | Decision |
| --- | --- |
| Domain/schema/migrations | N/A: no persisted state or database shape changes |
| Application/read port | Extend existing count capability and optional request/response |
| Persistence | Reuse exact filtered query; SQL aggregate without loading history |
| Presentation | Existing controllers/CQRS/permissions, additive envelope |
| Angular | Required: total count, sequential navigation, shared compact layout |
| Next/Mobile | Existing consumers retained; additive total is ignored unless opted in; new UI changes Excluded |
| Export | Existing bounded chain; no repeated total counts |
| Release | Updated ErpSystem.Api required for totals; old server fallback remains usable; canonical hosted gate PROD-035 |

## Verification status

Verified within the authorized local API/SQL and Angular scope on 2026-11-10.
The [executed receipt](verification/audit-review-2026-11-09/README.md) separates
functional, visual, accessibility and hosted outcomes and retains exact logs,
source/build hashes, screenshots and JSON geometry. Full Angular check passes
1,055 tests / 198 files; full API solution passes 1,369 tests with three existing
opt-in browser skips. Browser suites pass 8 normal / 8 compact / 32 negative Audit
cases, 20 layout contexts with 36 snapshots and 20 Countries comparisons, and
16 Report Manager cases. The same-row icon is verified at 390px and 493px, in
both languages/themes. Layout uses a development build for the deliberately
dev-only Countries route; functional suites use production assets. Hosted rollout,
real-volume count latency and native browser zoom remain Not verified; PROD-035
owns the server publication gate. No deployed SQL count is claimed.
