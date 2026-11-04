# Global manager column filters — bounded corrective change

Plan global-crystal-template-management/GCT-1. Requester2026-11-04 requires the
existing Countries column-filter experience in the main Global Report Manager
list. Reuse MyDataGrid advancedFilters/filter contracts and shared input adapters;
no new UI component. Preserve the Countries record-navigation configuration.

## Existing-system relationship

Reporting owns this global catalog, allowed entities and publication state. Extend
its current management query/controller/store. ReferenceData Countries provides
implementation discipline, not a cross-module internal dependency. The current
GET list supports only entity/search/status; add a bounded POST query like Countries
for column rules. Existing GET stays compatible. Next runtime list is unchanged;
mobile management remains Excluded. No entity/schema/migration or business write.

## Rules, edge cases and impact

- Existing Super Admin role/View permission/entity-edit allowlist remain on query.
- Main list columns: displayName/reportKey text, entity/status allowlisted choices,
  currentVersionNumber int32 and updatedOn UTC date. Six groups maximum, four rules
  per group, 200-character text; AND across groups, AND/OR inside a group.
- Reject unknown/duplicate fields, types, values, operators, modes and excess rules.
- Filter before count/order/page; preserve deterministic displayName/Id ordering.
- Topbar entity/status/search remain AND restrictions, never overridden by a filter.
- Null version/date semantics explicit; dateIsNot includes null, numeric rules do not.
- Text is case insensitive; no SQL interpolation. Read POST bounded32768bytes and
  existing browser mutation protection for authenticated POST requests.
- Shared GridColumnFilter gains optional text choices backed by existing OptionSelect,
  for translated entity/status labels with stable wire values; no new component.
- State owns rules and resets pageIndex0 on Apply/Clear; service owns HTTP.
- Candidate/version grids retain their current contracts; this request concerns
  the main report catalog columns, not a new local filter over server pages.

## Verification

Angular shared choice validation/input tests, state reset/request tests and service
POST contract. Reporting validator, query/store filter-count-page/scope/null-date
regressions and SQL translation test. Reuse API full solution gates and mandatory
full Angular check, actual PrimeNG menus in isolated browser EN/AR wide/compact.
Official PrimeNG Table/Select docs consulted; MCP unavailable, no MCP claim.
Update section36 in applied books, manifest/recipes, generated packets and notes.
Hosted release remains FOLLOW-024/PROD-028. No deployment or server restart.
