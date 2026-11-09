# Districts complete Angular parity — api applied profile

Current 2026-11-08 presentation correction: Grid actions inherit the shared
responsive default, including disabled-menu semantics and an architecture guard.
[Source contract and executed evidence](../angular-states-workspace/SHARED_GRID_ACTIONS_2026-11-08.md). API/domain/Next/native
runtime is unchanged; new platform workflows are Excluded from this correction.
Historical inline-action receipts retain their original revision.

Current shared search/Chart correction: no overlapping projected criteria,
44px controls, compact widths and a growing query. Chart search is off by default.
[Current contract and acceptance](../angular-states-workspace/SHARED_COLLECTION_SEARCH_2026-11-08.md). API/domain/Next/native remain
unchanged; this is a Web presentation correction.

## 1. Ownership

Platform owns the Angular migration record; ReferenceData retains District rules, persistence and existing API. Exact authority is D42/S3-A10 and the version2 Screen/Workflow Contract.

## 2. Verified source

Complete District Angular runtime now exists with all five Required views, four-field State-parent editor, detail and lifecycle/import. Current report and receipt are DISTRICTS_WORKSPACE_2026-11-06.md and verification/DISTRICTS_WORKSPACE_2026-11-06.json. API/Next/native rules are retained.

## 3. Data contract

Mutation has nameAr/nameEn/code/stateId only. Names printable/NFC/trim2-100; code2-10 alphanumeric/hyphen uppercase; State positive Int32. List adds addressesCount. Detail excludes count. SimpleState has id/nameAr/nameEn/code/countryId, no isDeleted.

## 4. Business rules

Global super_admin plus Districts:View/Create/Edit/Archive/Restore; States:View independently for parent lookup; read-only bars writes. Names/code uniqueness scoped to State. Active Addresses block archive and parent reassignment. Restore requires active State. Existing server is authoritative.

## 5. Platform decisions

Web Grid/Cards/Detail/Chart/managed Report/Import Required. Tree/standalone Export/ActiveReports Excluded. New native conversion Excluded; retained native and Next unchanged. No API/schema/dependency upgrade. Compact browser is part of Web acceptance.

## 6. Transport

Existing GET districts query with one-based page1/size10 and createdOn desc UI default; fields/operators/status/stateId/hasAddresses and exact DTO validation. HTTP only owner services, cookies/CSRF and current timeout. Atomic POST bulk {districts}, bulk archive {ids},100max; createdCount exact, archivedCount0..requested. No automatic replay.

## 7. Shared composition

Reuse MyDataGrid/CardList/PageHeader/CollectionChartView, native Signal Forms, DialogPanel/FormContainer/TextField/ReferenceField, shared confirmation, import parser/panel and GlobalReportView. Typed State lookup through a narrow public API. Feature data/state in focused folders, external HTML/SCSS. No CRUD/Form Engine.

## 8. States and lifetime

Actor-scoped read cancellation and generation fences, independent parent loading/ready/empty/forbidden/error, fresh detail, dirty/pending barriers, precise rejected/not-sent/uncertain mutation handling. Realtime invalidates District/State dependencies through existing owner lease; no hidden persistence or queued writes.

## 9. Authorization and consistency

Callbacks recheck grants/read-only/target eligibility/batch limits. Exact known errors District.Duplicated/StateNotFound/DistrictInUseByAddress/DistrictNotFound/NoDistrictsProvided. Explicit server field errors win. Scoped duplicate import and ambiguous State names yield actionable row errors. Existing transactions remain authoritative; no invented revision.

## 10. Localization and accessibility

Existing reference-districts/core EN/AR; catalog generator only for evidenced gaps. Logical styles,390/1440/light/dark, enabled invalid Save with beneath-field feedback/first focus, keyboard/pager/options and bounded workspace scroll. No browser-native dialogs.

## 11. Implementation preflight

G0 scope/source/actor, G1 P-001 journey, G2 exact transport/shared ownership and G3 existing semantics/tests are fixed. Remaining G4 PROD-019/028/025/RISK-020 are external release checks. Phase00 request/books/current-only manifest must generate/check before runtime.

## 12. Verification

Phase06 **Verified**2026-11-06 for the authorized Angular client.
Full npm run check passes701tests/125files,30architecture/dependency and all format,
lint/configuration/tokens/fonts/catalog/strict types/build gates. Browser8full and
14negative cases plus1States regression pass; report parent criteria and reset are
exercised. Independent source review has no actionable P1/P2. Actual hosted reads
return District page200empty, State lookup200with27, catalog200empty, logout204;
no hosted business writes or real DistrictRPT/PDF. Detail unavailable with no rows.
DISTRICTS_WORKSPACE_2026-11-06.md and its receipt own current hashes/evidence.
PROD-019/028/025/RISK-020 remain exact external release boundaries. Phase07 may now
document the verified customer workflow; no full Super Admin completion claim.

## 13. Operations and release

Report entity districts supports NameAr/NameEn/StateAr/StateEn in existing API contract. Reporting owner now extends typed filters without changing Countries/States behavior. No real District RPT is assumed; provider/template acceptance remains PROD-028/025. PROD-019 catalog publication, RISK-020 initial warning retained.

## 14. Education

Phase07 Arabic customer education completed after Phase06 Verified: documentation/plans/business/web-angular-migration/education/angular-districts-workspace.md. Canonical generation/check/planning and the next execution contract complete the sole-active handoff.

## 15. Handoff

States and Districts clients are Closed within their verified contracts. S4-A1 Tenant Management is the sole Active successor; later Super Admin workflows and final comprehensive review remain Required. Parent goal remains Active.
