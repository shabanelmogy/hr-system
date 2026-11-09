# Angular collection views — design contract

Reviewed: 2026-11-08. Scope: Angular 22.2.3 / PrimeNG 22.1.4.

This is the current cross-view design checklist for Grid, Cards, Chart, Report
and Import. Shared component APIs and the [responsive contract](ANGULAR_RESPONSIVE_LAYOUT.md)
remain the implementation authorities. Historical screenshots and phase receipts
are evidence at their recorded revision, not instructions to restore old layouts.

## 1. Scope and ownership

Related parent/child workflows may share a composition-owned tab workspace while
keeping their existing data and permission owners. Tenant Management now has one
sidebar destination opening the list directly, without outer tabs; Add/Edit are
full pages sharing one editor composition. Its saved-tenant administrator tab scopes the
existing workspace; a new unsaved tenant requires its first save. Use shared
ContentTabs fill/keepAlive rather than nested forms or a second layout shell.

- Select Required/Deferred/Excluded views from the feature's approved workflow;
  a new collection does not automatically need all five views.
- Feature pages supply data, captions, permissions, criteria and callbacks.
  Shared owners supply the shell, typography, spacing, paging, feedback and
  responsive behavior. Extend an existing shared owner before adding a local shell.
- Countries is the reviewed multi-view composition reference. Borrow another
  reference when its actual workflow fits better; do not copy geography fields,
  permissions, server criteria or domain-specific charts into unrelated features.
- The initial review was documentation-only. The requester subsequently authorized
  FOLLOW-028/029/030 corrections and compact shared Import commands/status tiles.
  Current executed evidence is separate from historical acceptance receipts.

## 2. Shared frame and title card

Use the shared collection-page shell and one PageHeader for the whole workspace.
The application frame owns the outer inset. Keep the outer page free of scroll;
the intended data/document/import viewport owns necessary scrolling.

Keep the title at logical start, badges beneath it, and the primary action at
logical end. At 64rem or less of header content width, view buttons and secondary
actions use the next row. All permitted views remain direct, named controls.
Reduce label text before losing an action; preserve accessible names, tooltips,
keyboard focus and logical RTL ordering. Back navigation uses the shared arrow
before the title when the workflow requires it.
Collection header Add/Export commands share the view-button height: 36px on
regular fine-pointer desktop, 32px compact, the existing fluid small-header size,
and 32px short landscape. Coarse-pointer controls retain 44px touch targets.
PageHeader owns the sizing variables; do not patch a feature's buttons locally.

For a collection header with a few actions and no view chooser, explicitly use
`PageHeader.actionsLayout="inline"` to keep the primary and secondary commands in
one row beside the title at compact widths. Tenant Administrators uses this for
Add, Export and Refresh. Keep icon accessible names and test the usable width;
do not apply this option to a crowded multi-view toolbar. The default adaptive
and explicit stacked arrangements remain unchanged.

An action must describe the active view: list export belongs to its supplied
export source; Report exposes its current PDF actions; Import owns the file/batch
workflow. Add is intentionally absent while importing. Preserve domain grants.
Header counts must have an explicit data scope. A list total, loaded sample,
import batch count and PDF page count are different values. The current Countries
non-list badge was corrected under FOLLOW-028: Report/Import omit unrelated
list totals; a feature supplies an explicitly scoped value when appropriate.

## 3. Search and filter density

For structured collection search, use CollectionFrame with
`toolbarLayout="adaptive"`. It is mutually exclusive with forced-single-row CSS.
Project fields into the shared slots; do not add feature wrapping/scroll overrides.

| Shared sizing | Arrangement |
| --- | --- |
| Every width, including wide desktop | Two logical rows from the outset: search selectors/query first; domain filters/actions second; both use available width |
| More criteria than fit | Wrap individual filters/actions in order; no overlap or horizontal toolbar scroll |
| At 34rem or less | Two search selectors, full-row query, then projected filters that stretch across their row; associated labels are visually hidden; search placeholder 12px |

From 56rem, search selectors use 144/160px, query minimum 240px and filters 144px;
below that use 112/128px,200px query and 112px filter bases. Projected selects grow with existing controlWidth for a justified wider lookup (States Country 168px). At every width, they grow without a maximum
cap to fill their row, including rows shared with actions. Entered text retains its normal
size while the adaptive-search placeholder is 12px only at 34rem or less. Every outlined control/action is 44px; TextField's
inner input is 42px. At 56rem, text/labels use 14/12px and gaps 8px. Normal/compact
labelled rows use 16/14px gaps. Selected values stay visible and full text remains
available in the shared control. Do not reduce hit areas to force a single row.

The current source, failure evidence and acceptance are in
[shared collection search](../../../modules/platform/features/angular-states-workspace/SHARED_COLLECTION_SEARCH_2026-11-08.md).

Countries, States and Districts start with Grid and Cards search collapsed.
Collapsing search preserves criteria and drafts and does not itself query the
server. In Grid, keep the shared toolbar mounted and condition only the `search`
input and `toolbarFilters` criteria. Put Reset in `toolbarContent` so it remains
available alongside Grid Options. Grid and Cards use the shared Reset icon and
compact button mode, with an accessible label when the text is hidden.
Sortable columns and the shared card sort button cycle through ascending,
descending and cleared. Grid emits `null` to clear the explicit sort. A server
collection then uses its configured default order and returns to page one while
retaining search and filters. Local collections use their input row order.
Only advertise a column as sortable when its source can order the entire result
before pagination. Countries, States and Districts use numeric `id` ordering.

CollectionFrame sets `--app-icon-size: 18px` for toolbar glyphs. The AppIcon
inherits that value across projected controls. Button hit areas retain the
shared density sizes. Avoid feature-local icon width/height overrides.
Reserve `toolbarVisible` for views that omit the entire toolbar.
Report criteria open by default and have independent visibility
and state. Do not apply the hidden-label convention to data-entry forms by default.

An explicitly approved compact companion may opt in with the shared
`data-collection-search-companion` attribute on one projected OptionSelect.
Through 34rem of available collection width, the shared layout places it beside
the search operator, above the full-width query. Through 28rem, the search-field
selector gets its own row so operator/companion values remain readable. Remaining
filters fill paired rows. This is an opt-in compact exception, not a replacement
for the default two-row contract; wider layouts remain unchanged. Districts uses
it for Status (Active/Archived/All) in Grid and Cards. Do not use feature CSS,
duplicate controls or positive tabindex to implement the placement.

## 4. View-specific composition

| View | Shared owner | Content and actions | Scrolling/paging |
| --- | --- | --- | --- |
| Grid | MyDataGrid / CollectionFrame | Readable headers, visible sort/filter affordances, typed columns/cell slots, row selection, frozen action boundary | Native data viewport; shared CollectionFooter; horizontal data scroll is allowed |
| Cards | CardList / SurfaceCard / entity-card mixins | Clear entity identity, two-line names, header selection, aligned metadata, footer actions | Shared card viewport and same list source/footer; no per-card vertical scroll |
| Chart | CollectionChartView / ChartPanel / MetricCard | Metrics plus named plots; distinguish matching total from loaded rows and label page-scoped figures | One shared scroll viewport for metrics and plots; no collection pager |
| Report | GlobalReportView / ReportWorkspace / PdfViewer | Current PDF Open/Download in the existing PageHeader; criteria/source operations in the bounded panel | Document fills available height; criteria viewport scrolls; PDF's own navigation is distinct from collection paging |
| Import | SpreadsheetImportPanel / MyDataGrid / shared fields/feedback | File/template/clear/submit in PageHeader, requirements disclosure, row diagnostics and a five-tile status row | Shared preview grid and batch page navigation; layout is a workflow-specific composition |

### Grid and Cards

When an approved compact layout requires full-width cards, use CardList's shared
`compactLayout="single-column"` option. It supplies one content-width column
through 790px of collection width; larger containers keep the selected layout.
Tenant Administrators opts in. Do not implement feature-specific media overrides.

- Keep the same authoritative collection criteria, row identity and footer
  implementation. A custom local pager/toolbar is not a design variant.
- MyDataGrid defaults to responsive row actions: one menu below 600px of actual
  Grid width and inline actions from 600px. Features inherit this default; do not
  force inline presentation. Preserve every authorized action and disable an
  empty/all-disabled menu trigger. The architecture gate prevents hardcoded
  feature inline overrides.
- Grid cells handle long values with ellipsis/full text; optional column icons
  use the shared default renderer. Keep numeric figures tabular and RTL text safe.
- Card columns follow actual container width: 1 below 36rem, 2 from 36rem, 3 from 54rem,
  4 from 72rem. Keep 44px selection/footer targets, 8px action gaps and compact insets.
- Select All stays in the Grid selection header; Cards uses the shared selection
  footer. Compact Clear/paging behavior remains owned by CollectionFooter.

### Chart

Use two metric columns, four from 42rem. Plot panels use one column, two from 50rem,
with 340px rows (320px below 22rem). Metrics scroll with plots so the final chart
remains reachable in short windows. Titles, legends, empty state and accessible
data presentation are part of the shared chart contract.

Countries currently projects the first loaded server page. Its labels distinguish
Matching Countries from Countries/States/Currencies on This Page. Do not present
these samples as whole-dataset analytics or add a decorative pager that does not
change the actual source. Filtering Chart is an independent workflow decision.
The shared chart defaults to no search toolbar. Countries, States and Districts
also hide their header filter toggle in Chart; independent chart workflows may
explicitly opt in after a reviewed requirement.

### Report

Reuse the current PdfViewer action template and single Blob lease. Consumers opt
into GlobalReportView.externalActions and project headerActions into PageHeader;
System Error Logs connects through its optional composition adapter. Keep native
Open/Download semantics, translated accessible names and stale-link withdrawal.

ReportWorkspace uses 260px criteria plus 16px gap. Below 54rem of actual workspace
width, criteria/document share bounded rows with 12px gap. Hide an empty Options
tab; granted RPT source download/upload remains a distinct sidebar operation.
Keep draft criteria and the mounted document across filter visibility changes.
The native PDF page controls do not use CollectionFooter.

### Import

Reuse the existing file/batch workflow, including explicit validation details,
row status, partial success and uncertain-result handling. Keep the data preview
dominant. Embedded file actions belong to the main title card; file name and
batch count identify the imported dataset. A nested workflow heading is allowed
and does not authorize another full PageHeader. Embedded consumers instead
project SpreadsheetImportPanel.actionsTemplate into the existing PageHeader
with externalActions=true and PageHeader.actionsLayout='stacked'; the redundant
local heading is hidden. The visible Choose file control is the shared ActionButton,
using FileUpload's documented header/chooseCallback and Pass Through sections.

Preview pagination may use the shared batch/page mode rather than record
navigation. This is an intentional functional difference, not permission to fork
pagination styling. Uncertain submissions retain the existing lock/review policy.
Use five shared MetricCard tiles in one row at every width, separated from the
preview by a subtle bottom divider. Compact labels may use a translated short
caption with the full accessible name/title. The old independently scrolling
4rem rail is superseded. Keep all five statuses visible and the preview at least
180px high; short windows scroll within the bounded import workspace.

## 5. Theme, accessibility and states

Use semantic theme colors for surfaces, borders, focus, status and actions.
Archive bulk selection uses the theme primary outline; its confirmation owns the
destructive treatment. Preserve feedback for loading, empty, error, forbidden,
validation, conflict and uncertain outcomes only where the workflow requires them.
Do not use color as the sole status explanation.

Keep controls labelled even when their visible text is removed. Verify keyboard
access to the last content item and focus in overlays/filters. 44px targets are
implemented for collection toolbar actions, card actions, coarse-pointer Grid
actions and PDF toolbar links; the collection text input itself is 42px inside
its 44px wrapper. PageHeader uses 44px controls when any pointer is coarse;
26–32px sizing remains a fine-pointer density choice. Compact Import commands
use 12px captions/16px icons without shrinking coarse-pointer targets.

## 6. Verification and reuse gate

Review EN/AR, Light/Dark, long names and navigation both open and collapsed. Use
320×720, 390×844, 571×823, 690×823, 799/800×823, 900×640, 1012×823, 1440px and 844×390 as
applicable. Test content width and zoom; viewport names alone do not determine
columns. Keep headers/actions reachable and prove scroll reachability.

Current executed receipts are linked from
[HEADER_ACTIONS_2026-11-08](../../../modules/platform/features/angular-countries-report-view/verification/HEADER_ACTIONS_2026-11-08.md).
Grid/Card/search/Report have recent browser evidence. Chart's existing layout
captures were inspected with current source. Current Import/header correction
scope, evidence and limits are in
[IMPORT_LAYOUT_2026-11-08](../../../modules/platform/features/angular-countries-import-view/IMPORT_LAYOUT_2026-11-08.md).
No whole-application or physical-device acceptance is implied.

Before publishing a new feature as compliant, verify its own data/permissions,
forms and view-specific states. Reuse shared rules now; close or explicitly bound
the relevant central follow-up before copying an unresolved presentation.

## 7. Tracked corrections

Canonical ownership, impact and reopening triggers live in
[FOLLOW_UPS](../../../plans/notes/FOLLOW_UPS.md):

- FOLLOW-028: header count scope outside list views.
- FOLLOW-029: compact Import summary and usable preview area.
- FOLLOW-030: compact PageHeader coarse-pointer targets.

These IDs retain the original findings and link their authorized correction and
verification evidence. Consult the central registry for current closure status.

## Primary design references

- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md)
- [CSS Grid alignment](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Box_alignment)
- [Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries)
