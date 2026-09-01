# Organizational Structure Expo Implementation Profile

Status: final implementation profile. Routes: one guarded page per resource under
`/basic-data/organizational-structure/{branches|departments|divisions|job-titles|job-levels|positions|job-descriptions}`.

## 1. Boundary and guarded route

Each Expo route renders `OrganizationalStructureManagementScreen` with a fixed
resource and is guarded by `OrganizationalStructure:View`. The screen consumes
the current tenant/company context and never accepts scope identifiers from
navigation parameters.

## 2. Feature modules

Types, Zod runtime schemas, API serializers, query keys/hooks, validation, cards,
chart, filter button, forms, decision form, and the seven resource screen
compositions are feature-owned under
`src/features/basic-data/organizational-structure`.

## 3. Shared design system

The screen uses shared `AppListScreen`, `AppDataTable`, `AppStateView`,
`AppChartCard`, `AppChartSummary`, `AppHorizontalBarChart`, and navigation/form
primitives. Local components only compose domain-specific fields; there is no
cross-entity resource selector.

## 4. Table view

Table is the mobile equivalent of Grid. It shows localized names, code/version,
parent, status, and resource-specific metrics with touch-safe labeled actions.

## 5. Cards view

`OrganizationalStructureCard` uses shared card tokens, displays the same server
page as Table, and exposes view/edit/archive/restore plus JobDescription decisions
according to permission and lifecycle state.

## 6. Chart view

`OrganizationalStructureChart` renders current-page distribution and matching
total through shared chart components; the subtitle explicitly states page scope.

## 7. Criteria and paging

Each entity screen owns one `useServerListState` for search text,
field/operator, status, page, page size, and sort. The API receives one-based
paging; the UI remains zero-based. Search supports all five fields and six
operators.

The shared view selector also exposes Report and, for users with Create
permission, Import. Report summarizes the loaded authoritative page. Import
uses exact resource headers and active-code relationship lookups before sending
the atomic bulk request.

## 8. Filter interaction

`OrganizationalStructureFilterButton` follows the States filter pattern and
provides search-field, operator, and active/archived/all status controls. Applying
filters resets the page and refreshes the canonical query.

## 9. Data-entry form

`OrganizationalStructureForm` uses shared mobile form shells and runtime Zod
validation. Active parent lookups are loaded through feature hooks; department
parent selection is filtered to prevent self-reference. Submit remains available
and field errors are rendered inline.

## 10. JobDescription decisions

`JobDescriptionDecisionForm` collects approval dates or a rejection reason and
calls the explicit API decision endpoint. Approved content is not offered for
editing; rejected/draft versions remain visible according to status.

## 11. Lifecycle and permissions

Archive/restore uses shared confirmation and feedback. View/Create/Edit/Delete and
ApproveJobDescriptions are checked independently; read-only users cannot mutate.

## 12. Localization, RTL, and accessibility

English/Arabic feature keys cover resources, fields, filters, decisions, errors,
and chart labels. Shared RTL-safe layout, accessible labels, keyboard/touch target
sizes, and safe-area handling are retained.

## 13. Realtime and deep links

The `organizational-structure` registry entry invalidates query prefixes after a
committed change. Notification actions resolve to the guarded entity route.

## 14. Report and Import surfaces

Report and Import are available in the shared list selector. Report summarizes
the current server page; Import uses the shared native XLSX picker/template,
active relationship lookups, row preview, and atomic bulk endpoint. Export is
Excluded.

## 15. Verification

`npm run typecheck`, mobile architecture, lint, translation-usage, route-access,
and the full Jest suite pass after the feature translation fix. Manual device
checks remain for direct navigation, EN/AR RTL, small/large text, permissions,
archive dependency errors, approval period validation, and realtime refresh.
