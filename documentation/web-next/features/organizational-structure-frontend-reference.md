# Organizational Structure Next.js Implementation Profile

Status: final implementation profile. Routes: one page per resource under
`/basic-data/organizational-structure/{branches|departments|divisions|job-titles|job-levels|positions|job-descriptions}`.

## 1. Boundary and route

Each App Router page is thin and renders the feature-owned management page with
its fixed resource. Route access requires `OrganizationalStructure:View`;
mutations additionally require the matching action permission. The index and
legacy `/basic-data/organizational-structure` and
`/basic-data/organizational-structure/manage` routes redirect to `branches`.

## 2. Feature ownership

Types live under `src/features/basic-data/organizational-structure/management/types`,
the service is the only caller of `apiService`, hooks own React Query keys and
mutations, and the seven resource page components (`BranchesPage` through
`JobDescriptionsPage`) compose the fixed resource result. Realtime imports the
feature public API only.

## 3. Shared composition

`OrganizationalStructureMultiView` follows the States composition: shared
`PageHeader` owns the view/filter toggle, `OrganizationalStructureDataGrid`
owns the server toolbar/options, and `OrganizationalStructureCardViewHeader`
owns the shared card/chart criteria bar. `EntityCard`, `CardViewPagination`,
`BarChart`, loading, empty, and error states remain shared; no local list shell
or pagination primitive is recreated.

## 4. Criteria state

Each entity page owns one server-list state for search text, search
field/operator, status, page, page size, and sort. UI pages are zero-based and
convert to the one-based API query. Parent is a supported sortable/searchable
field where the API resource supports it.

## 5. Grid view

Grid columns follow the reviewed States/Countries widths and alignment: ID,
bilingual names, code/version, parent, a resource-specific metric where useful,
created/updated dates, soft active/archived status, and actions. Code and dates
use shared renderers and action cells use the shared accessible action pattern.
The server toolbar uses the same column/operator search selectors, Reset button,
and Grid options status menu as the reference; it is shown/hidden through the
PageHeader Filter action.

## 6. Cards view

Cards use the shared entity card scaffold and the same authoritative page data.
They show parent, status, headcount/salary or description status only when the
selected resource supports those values; archive/restore and approve/reject are
permission-aware.

## 7. Chart view

The current page is summarized with shared `BarChart`; chart labels state that
values represent the loaded page and matching total, not global analytics.

## 8. Report and Import views

Report follows the States `ReportViewer` pattern and loads the published
managed-Crystal catalog for the fixed resource, with bilingual NameAr/NameEn
filters and the shared Filter toggle. Import follows the States spreadsheet
pattern: exact resource headers, 5 MiB/100-row bounds, active parent-code
lookups, shared preview/feedback, and `POST /{resource}/bulk` atomic submission.

## 9. Forms and validation

`OrganizationalStructureForm` uses `MyForm`, `FormContainer`, `FormHeader`,
`FormContent`, `FormFooter`, `MyTextField`, and `MySelect` with a reusable Zod
schema. Save remains enabled; errors render beneath fields and shared focus/dirty
protection behavior is retained. Parent selectors load active same-company data.
In non-production builds, add/edit mode also passes a shared `mockDataAction`
to render `Generate Mock Data` in the form footer. The resource-aware generator
fills valid sample values and active lookup ids without submitting; it is absent
from view mode and production.

## 10. JobDescription decision dialog

`JobDescriptionDecisionDialog` reuses the shared form-dialog system. Approval
collects effective/expiry dates; rejection collects a required reason. The page
only exposes these actions when the approval permission and resource/status allow.

## 11. Lifecycle feedback

Shared confirmation dialogs guard archive/restore. Success, failure, loading, and
empty states use translation keys; no browser alert/confirm/native validation is
used.

## 12. Localization and accessibility

All visible feature text exists in English and Arabic translation files. Shared
direction-aware layout preserves RTL/LTR, code tokens remain readable, and icon
actions have translated labels/tooltips.

## 13. API and realtime integration

The feature service serializes the exact resource/query/mutation contracts and
approval endpoints. Query keys are exported through the feature public index;
resource `organizational-structure` invalidates the prefix after a committed
server event. The browser calls the same-origin Next.js API proxy; local runtime
configuration must point that proxy at the matching local API instance when the
backend change has not yet been deployed to the hosted environment.

## 14. Navigation and permissions

Basic Data navigation and route config expose a separate leaf for every entity;
all are protected by `OrganizationalStructure:View`. Read-only users retain
list/detail access but see no mutation controls. An existing administrator must
sign in again after the server-side permission migration is applied.

## 15. Verification and intentional differences

Architecture, lint, type-check, and `next build` pass. The production route table
contains a distinct route for each entity plus the legacy redirect; a clean local
dev server also serves `/login` and redirects anonymous entity requests to that
login with `returnTo`. An authenticated local proxy request for the initial
Branches page returns HTTP 200 after the server-query translation fix. Report
and Import are available from the shared multi-view selector. Report uses the
published managed-Crystal catalog and bounded bilingual filters. Import uses
the shared XLSX card/table, active parent-code lookups, and the atomic bulk API.
Export remains Excluded.
