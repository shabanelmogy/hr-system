# Address Types Next.js Implementation Profile

## 1. Route and public boundary

The thin App Router page at `/basic-data/address-types` renders the Address Types
feature public API. Navigation and route access require `AddressTypes:View`.

## 2. Transport and types

Feature types model list/detail/request/bulk/page separately. The service sends
one-based query values, exact create/update/bulk envelopes, and normalizes names
by trim. Query keys form an Address Types root that mutations and realtime
invalidate.

## 3. Server list

One controller owns zero-based page, page size, status, visible search column and
operator, sort and selected bulk IDs. Grid and Cards use API data only; no client
filtering or fake fallback. Background fetching preserves visible rows.

## 4. Grid

Grid displays English/Arabic names, active-address count, creation date, status,
and guarded view/edit/archive/restore actions. Only Name EN/AR and Created On
sort requests are enabled. It owns server pagination and accessible criteria.

## 5. Cards and chart

Cards share the loaded server page and permit active selected rows for atomic
bulk archive. Chart summarizes only the loaded page and displays the matching
server total separately; it is non-paginated and exposes text alternatives.

## 6. Forms and lifecycle

View, Create and active Edit use the two-name contract. Archive/bulk confirmations
stay open on failure; read-only and permission checks run in both visibility and
handlers. Archived rows restore through Delete permission.

## 7. Import

Required Import uses the shared browser XLSX parser with exact
`nameAr,nameEn` headers, 5 MiB/100-row bound, preview and duplicate detection.
It submits `{addressTypes:[...]}` once. Ambiguous results lock resubmission until
the canonical list is refreshed.

## 8. Report

Required Managed Crystal Report lists published `addresstypes` catalog items,
selects localized SummaryInfo names, accepts only NameAr/NameEn filters and sends
report ID/language/filters through the shared report service. It owns no list
pagination.

## 9. Localization and access

Every Address Type string exists in EN/AR. Components use current direction,
native MUI keyboard/focus behavior and visible non-color status labels.

## 10. Realtime

`address-types` maps to the Address Type root query key. The notification route
remains `/basic-data/address-types`.

## 11. Tests

Cover service/query serialization, permissions, report catalog/filter payload,
import parsing/duplicates/request body, and representative five-view wiring.

## 12. Verification

Run focused tests plus TypeScript, lint, architecture/build checks specified by
the web project, then record all results in the review artifact.

## 13. Intentional platform differences

Web has a dense Grid and dialog form; mobile has a touch Table and full-screen
form. They serialize the same business contracts.

## 14. Manual release

The manager-published Crystal report and `Run` ACL are operational prerequisites.

## 15. Reference fidelity

Address Types follows the current Countries flat-reference architecture and the
States multi-view composition: `PageHeader`, server `MyDataGrid` toolbar,
`EntityCard` card scaffold, chart viewport container, spreadsheet import card,
and managed report surface are reused rather than recreated. Domain adaptation
is limited to Address Type fields, exact routes/envelopes, permissions, and
Address Type-specific import/report contracts. Any intentional visual or
interaction difference must be recorded here before implementation.
