# Address Types Expo Implementation Profile

## 1. Feature boundary

`src/features/basic-data/address-types` owns Address Type schemas, API, keys,
views and full-screen form. The Expo route imports only its public root.

## 2. Route and authorization

The route is `/basic-data/geographical-information/address-types`; typed ROUTES,
route policy, geographical navigation and `RouteGuard` all require
`AddressTypes:View`. Create/Edit/Delete and `CrystalReports:View` guard the
relevant controls and direct handlers.

## 3. API/schema contract

Every JSON transport result is `unknown` then parsed by feature-owned Zod schema.
Endpoint/query serializers match the server list and mutation envelopes exactly.

## 4. Query ownership

Feature keys contain list, detail/lookup if needed, and report catalog branches.
Successful create/update/archive/restore/bulk/import invalidates the Address Type
root; realtime maps the same public prefix.

## 5. Server list

One `useServerListState` owns zero-based page, status, search field/operator and
sort; it converts using `toApiPageNumber`. Table page size is 5 and Cards size is
3. Current page rows are never locally re-filtered.

## 6. Table and cards

Table shows bilingual names, active address count, date/status and touch actions.
Cards expose the same lifecycle/actions and selected active rows for 1-100 bulk
archive. Both preserve loading/error/empty/refresh states.

## 7. Chart

Chart is Required, non-paginated and scrollable. It summarizes only loaded rows
while labelling the authoritative matching total. Shared chart primitives provide
theme, RTL, text and accessibility behavior.

## 8. Form

Full-screen create/edit/view validates two bilingual names. Read-only checks run
before permission failure; modal primitives preserve dirty/busy behavior.

## 9. Lifecycle

Archive confirmation, restore and bulk archive use the shared lifecycle contract.
The API’s active-Address dependency failure is visible and actionable.

## 10. Import

Required native Import uses Expo DocumentPicker/FileSystem through the shared
spreadsheet boundary. It accepts one `.xlsx` (5 MiB/100 rows) with exact
`nameAr,nameEn` headers, previews parser/schema/duplicate errors, serializes
`{addressTypes:[...]}`, and reconciles uncertain results without automatic retry.

## 11. Report

Required Managed Crystal Report uses the authenticated shared catalog/render API
with entity key `addresstypes`. Arabic chooses SummaryInfo Title and English
Subject. It sends only report ID, `ar|en`, and NameAr/NameEn filters; PDF bytes
are signature-checked then previewed/shared through Expo Print/Sharing. Read-only
mode does not block rendering.

## 12. Notification and navigation

The API action `/basic-data/address-types` maps to the typed geographical route.
Basic Data navigation lists Address Types only through the canonical policy.

## 13. Localization and accessibility

Paired EN/AR feature resources cover all Address Type fields, states, filters,
Import and Report. Generic loading, empty, error, and not-found messages use the
shared `feedback` namespace rather than borrowing another feature namespace; the
source-usage localization test verifies every literal app/screen key in both
languages. Use semantic theme tokens, logical RTL layout, safe area owners,
44-point controls and screen-reader status labels.

## 14. Tests

Test API Zod parsing/query/body, list conversion/mutation invalidation, chart
pure series, native import parser/duplicates, report key/filter/display name,
screen five-view composition, route/access policy and realtime mapping.

## 15. Verification

Run `npm.cmd run check` and manually inspect phone/tablet portrait/landscape,
EN/AR LTR/RTL, light/dark, text scaling, permission/read-only, PDF and XLSX
failure/reconciliation states.
