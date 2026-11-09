# Countries XLSX import — Angular Web applied profile

## 1. Ownership

Current requester-authorized maintenance 2026-11-08 consolidates Import actions
in the existing PageHeader and uses one row of compact shared status tiles.
The [current shared layout contract](IMPORT_LAYOUT_2026-11-08.md) supersedes the
2026-11-05 vertical/compact scrolling rail. Shared presentation applies to
Countries, States and Districts. Submit/permission/uncertainty rules and all API
business/schema, Next and native workflows remain unchanged. Their new runtime
surfaces are Excluded from this visual correction. Bilingual core caption sources
and their generated catalogs are synchronized. Historical receipts retain their
own revision/date; current verification is recorded in the linked contract.

ReferenceData Countries owns six flat fields, validation and Create authority. Platform migration owns shared adapters/evidence. This is exact S3-A7 only; API/Next/native runtime unchanged.

## 2. Reviewed source

Current ImportCountries/useCountryImport/countryImport and shared excelService/SpreadsheetImportCard reviewed. P-001 embedded Import, same authenticated Countries workspace. Native Import retained. Current native PrimeNG22.1.4 MCP metadata confirms header/chooseCallback, unstyled and named Pass Through sections; dated receipts retain their original MCP access mechanism; official SheetJS0.20.3 tarball matches Next/native.

## 3. Persistence

Existing POST /api/v1/countries/bulk accepts {countries:[...]},1–100, returns201 {createdCount}. Existing CreateCountries handler checks duplicates and commits once. No schema/migration, new permission, audit or endpoint. No arbitrary file upload to API.

## 4. Business rules

Countries:View and Countries:Create, super_admin and writable actor required. Existing countryFieldError/parseCountryMutation single rule owner reused. First worksheet,5MiB,1–100 nonblank rows; exact ordered six headers nameAr,nameEn,alpha2Code,alpha3Code,phoneCode,currencyCode. Reject formulas, unexpected columns, duplicate headers and non-XLSX. Optional codes normalize uppercase and empty null. Same-field case-insensitive duplicates mark later row invalid; invalid rows never sent.

## 5. Platform options

Angular Import/template/preview/row status/finite failure and reconcile Required. New native UI/API runtime Excluded. Grid/Cards/Chart/Report retained existing owners. Standalone export/AR/offline writes Excluded. Full pilot S3-A8 and advanced Table FOLLOW-016 remain separate.

## 6. Transport

Shared parser lazy loads pinned SheetJS0.20.3; FileUpload custom local selection never uploads bytes. CountryService.bulkCreate validates again, Cookie+CSRF, exact HTTPS and10s timeout; strict createdCount equality. No retry. Not-sent differs from rejected4xx and uncertain dispatched network/5xx/timeout/malformed success.

## 7. Shared composition

Create generic SpreadsheetImportPanel using existing SurfaceCard/buttons/feedback/progress and MyDataGrid preview. Feature supplies labels/rules/status/columns. PrimeNG FileUpload uses a custom header/chooseCallback in unstyled advanced mode. Shared ActionButton is the visible trigger; documented Pass Through hides its internal native input and unused content. Owner-scoped CountryImportState disposes operations/parse generations; shared UnsavedChanges fences route/context and view changes.

## 8. States

idle/parsing/preview/submitting/succeeded/failed/uncertain. All accepted file rows initially pending; submit validates; only valid rows form one atomic batch. Uploaded/invalid/failed/uncertain statuses remain visible. No retry of a submitted batch; explicit clear/reselect after rejected result. Uncertain locks selection/submit until user reviews records or clears explicitly. Pending blocks clear/file replacement/view/context.

## 9. Security and identity

Immutable actor ownership and synchronous masks on auth/permission change; generation ignores late parse, unsubscribe cancels effects. Recheck direct callbacks before parse/template/write.403/401 latches actor denial. Never save files/row values/tokens in storage/logs. Potential spreadsheet contents treated as text, never HTML/evaluated formulas.

## 10. API evidence

CountriesController RequirePermission(Countries:Create), CreateCountriesCommandValidator limit100, CountryMutationValidator and CreateCountriesCommandHandler same-field duplicates/one unit-of-work reviewed. No live business writes authorized for test; browser intercepts actual service requests.

## 11. Verification

Phase06 Verified2026-10-31 under requester decision D35 for bounded Angular Countries Import. Fresh full Angular check78files/443tests,4configuration/12architecture, types/templates/catalog/tokens/fonts and production build passed. Angular browser40 palette/mode/EN-AR/390/1440 cases,15 failure/authority cases and5 additional user journeys passed. The new journeys cover file replacement/cancel, view discard/cancel, permission loss, permission loss during a pending command and keyboard page-size/paging. Final build500.38kB/131.48kB estimated transfer warns385bytes above the unchanged500kB warning budget (FOLLOW-019). No live hosted import, production release or full Countries/Table/realtime acceptance. Canonical decision and exact receipts: verification/CURRENT_IMPORT_ACCEPTANCE.md. Rendered Next execution/comparison is optional historical evidence under D35.

## 12. Rollback and limits

Rollback own Angular Import/shared adapter/dependency and docs; no database rollback. No API/schema/native business change or EF migration. FOLLOW-018 historical raw-log provenance and FOLLOW-019 build warning remain open. FOLLOW-020 Next preview work is outside current Angular scope per D35; temporary Next edits reverted. Full host/realtime/Table acceptance belongs to S3-A8/central release owners.

## 13. Localization and accessibility

Reuse existing core imports.* and reference-countries countries.import.* keys, runtime namespaces, all5palettes/@app/tokens. Accessible choose/template/submit/clear/review; no native dialogs. Retain shared Grid keyboard/pager and feedback; logical CSS and contained horizontal scrolling. No new key planned.

## 14. Readiness and authority

G0-G3/frozen contract/initial Phase00 preceded runtime. D35 explicitly changes the acceptance prerequisite to actual Angular/API/shared behavior and removes mandatory Next execution/debug/pixel comparison. Existing business rules, exact permissions and Required Angular capabilities remain unchanged. No broader runtime authorization inferred.

## 15. Closure

Phase06 Verified under D35, then Phase07 education completed. S3-A7 Verified/Closed. Sole next Active is S3-A8 angular-countries-pilot-acceptance, Angular/API/frozen-contract/Phase00 preparation only. Overall migration remains Draft; full Countries/host/realtime/Table release Not Verified.

