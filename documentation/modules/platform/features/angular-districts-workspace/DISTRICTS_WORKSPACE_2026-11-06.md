# Districts Angular workspace — 2026-11-06

## Complete authorized implementation

The canonical /super-admin/geography/districts route composes shared MyDataGrid,
CardList, collection charts, managed reports, import panel and native Signal Form.
Domain HTTP and state stay in owning services/controllers; focused component
folders use external HTML/SCSS. No engine, dependency, API/domain/schema or native
rewrite. States lookup has a narrow public API and separate States:View grant.

## Source parity

| Workflow | Implemented contract |
| --- | --- |
| Grid/Cards | Shared controlled server page/search/operator/status/State/hasAddresses/sort, reset, eligible current-page header selection, row actions/options/record navigation; createdOn desc/page1/size10 |
| Create/edit | Exactly nameAr/nameEn/code/stateId; printable trimmed NFC names2-100, uppercase code2-10; active authorized State; fresh detail; explicit server errors and known code mapping, first invalid focus and enabled invalid Save; dirty/pending/uncertain barriers |
| Detail | Localized parent State, bilingual names/code/status/ID; addressesCount intentionally absent from detail contract |
| Lifecycle | Exact grants and readonly guards, shared archive/restore/bulk confirmation; active Address dependencies remain authoritative server rules;100max and idempotent0..requested archivedCount |
| Charts | Current-page State distribution/share, Address counts and creation timeline; server matching total versus visible District/State/Address metrics labeled explicitly |
| Report | Existing Reporting owner, entity districts; NameAr/NameEn/StateAr/StateEn typed filters,200char validation, server field mapping, reset/entity/actor cleanup, shared PDF lifecycle. Countries/States retain two-filter request behavior |
| Import | Exact nameAr,nameEn,code,stateName XLSX; first-sheet/5MiB/100rows/noformula; normalized bilingual active State names, ambiguity rejection across Countries, duplicates scoped by State, original row error mapping, single atomic valid-row batch, uncertain replay lock |
| Refresh | District/State/Address invalidation plus reconnect, actor cancellation and coalesced trailing refresh. Address count update has a failing regression before the resource correction and passes in the final full suite |
| Dev samples | Realistic District samples and an actual active caller parent; fill only, no automatic submit |

## Verification and limits

Full npm run check passes701tests/125files and30architecture/dependency checks,
format/lint/configuration/catalog/tokens/fonts/strict app+spec types/production
build. Initial574.50kB retains the existing RISK-020 warning; no style-budget warning.
All8EN/AR×light/dark×390/1440 browser journeys and14negative cases pass; a fresh
States regression journey also passes. District report criteria are actually filled,
submitted as StateAr/StateEn, reset and inspected. CRUD/archive/restore/bulk/import
are intercepted fixtures. Negative cases cover read-only, parent403/503+retry,
field/duplicate guidance, uncertain replay barrier and API403; no native dialogs.
Two representative compact-RTL and wide-import screenshots were visually inspected.
Independent bounded source review found no actionable P1/P2 findings.

Hosted read-only checks returned District page200empty, active State lookup200
with27entries, District report catalog200empty and own-session logout204. No business
writes. Actual District detail could not be exercised with an empty dataset; no
real District RPT/PDF render is claimed. Fixture PDF acceptance is only client
evidence. Portable receipts/source hashes: verification/DISTRICTS_WORKSPACE_2026-11-06.json.

## Reusable extension and release ownership

The existing Reporting filter owner supports the two evidenced District parent
criteria without a schema renderer. Parent labels load only for the District
entity, preserving lazy resources for Countries/States. Existing shared controls
and entity-card Sass are reused; no parallel form/grid/dialog shell was added.

Local catalog4bf4189c7c3163149fdecdf37112eb46757d7c3e96a4b98b3e40ab7d621d3ace
contains21sources/7409keys. PROD-019 owns matching hosted publication. PROD-028/025
retain actual template/provider acceptance; RISK-020 retains initial budget.
The parent goal remains Active; other Super Admin workflows and the final whole
application review are Required, not completed by geography acceptance.
