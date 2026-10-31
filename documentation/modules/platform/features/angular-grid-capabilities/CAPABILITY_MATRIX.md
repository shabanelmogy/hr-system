# Shared PrimeNG Table — frozen capability matrix

Requester requirement2026-10-30: complete installed Table capabilities through the
shared component, with exact web-next appearance. These are Required targets, not
claims of implementation. No entry becomes Verified from a config property alone.
Record actual source, test and browser evidence per row as runtime is delivered.

| Capability | Required behavior | Boundary and verification | Current acceptance |
| --- | --- | --- | --- |
| Exact header fidelity | Current Next multi-view PageHeader,toolbar,centered columns; all measured typography/colors/spacing copied through shared APIs | Next source and same-viewport measurements; no accepted redesign | Not Verified — Shared source geometry implemented; actual Countries same-screen comparison pending |
| Typed columns/templates | Dynamic columns; cell/header/footer; grouped headers; explicit owner semantic styling | Strict template context and column validation | Not Verified — Typed cell/header/footer and validated multilevel column groups implemented; bounded tests passed |
| Display | Density,gridlines,striping,hover,conditional visuals,protected visibility,reset | Source defaults unchanged; fixture combinations | Not Verified — Implemented options and current browser subset passed; full combinations remain open |
| Selection | Active record separate from single/multiple/range/checkbox/radio; page-only all; explicit selection scope | No all-server-selection inference; scope replacement and keyboard | Not Verified — Four modes and current-page keyboard/range checks passed; complete exit review pending |
| Paging | Known/unknown totals,page-size,jump,top/bottom placement,record navigation | Single controlled writer and current-page compatibility | Not Verified — Required runtime or full verification remains open |
| Sorting | Single/multi/initial/removable/custom sort | Local supplied-data versus remote event boundary; default initialization coalesced | Not Verified — Typed single/multiple and stale-source callback checks passed; local/custom scope remains open |
| Search and advanced filters | Global and per-column text/numeric/date/boolean menus; match modes; per-field AND/OR;Apply/Clear | Typed bounded criteria; local or actual owner/API translation; no ignored rules | Not Verified — Native typed AND/OR Apply/Clear and text/number/date/tri-state Boolean browser checks passed; local/actual API owner support separate |
| Custom match registry | Caller-named typed predicates for explicit local data only | Per-instance registry lifetime; never send executable functions to server | Not Verified — Required runtime or full verification remains open |
| Lazy queries | Typed immutable query/sort/filter state and captured owner revision | No shared HTTP/DTO/domain query engine | Not Verified — Required runtime or full verification remains open |
| Scrolling | Contained horizontal/vertical/flex,sticky headers | Document containment and consistent pinned footer | Not Verified — Required runtime or full verification remains open |
| Frozen data | Columns at either edge and frozen rows | RTL placement and current data scope; no synthetic totals | Not Verified — Current-page rows and logical column edges implemented; current fixture checks passed |
| Virtual rows | Fixed-height virtual and lazy virtual ranges | 10000-row fixture; bounded DOM window and stale range cancellation | Not Verified — Required runtime or full verification remains open |
| Resize/reorder | Column resize fit/expand,column order,row order callbacks | Min widths,keyboard/direct alternatives,no implicit persisted business order | Not Verified — Required runtime or full verification remains open |
| Grouping | Column header groups;subheader/rowspan row groups;collapsible groups | Explicit supplied-data/page/global scope and server ordering | Not Verified — Subheader/rowspan validation and expandable subheader checks passed; incompatible configurations reject |
| Details | Controlled row expansion and typed detail slots | Owner loads/authorizes detail; closes/cancels on scope replacement | Not Verified — Typed projected details and scope reset pass on current fixture |
| Editing | Cell and row draft editors through existing shared fields/forms;owner validation/save/cancel | No authoritative row mutation;errors/focus/unsaved/pending and no write replay | Not Verified — Required runtime or full verification remains open |
| Context menu | PrimeNG menu using current-row owner actions | Equivalent direct accessible actions and no permission grant | Not Verified — Current row owner actions and direct trigger pass on current fixture |
| CSV | Supplied/selected data CSV export,separator,filename,typed export value | Explicit data scope;escape spreadsheet formulas;not all remote data | Not Verified — Safe supplied-data exporter and browser download pass; complete matrix review remains open |
| Presentation state | Typed versioned snapshot/save/restore through owner adapter | No data/grants/private criteria restoration and no vendor browser storage | Not Verified — Validated scoped snapshot implemented; full restore/layout combinations remain open |
| Feedback/accessibility | Loading/skeleton/empty/error/forbidden/retry,tokens,PT,locale,keyboard,focus | All callers retain existing shared behavior; no raw feature widgets | Not Verified — Required runtime or full verification remains open |

## Explicitly different ownership

TreeTable,DataView,the separate PRO DataGrid/Sheet roadmap,chart/pivot computation,
PDF/XLSX import/report engines,actual business API queries and business persistence
are separate owners. Existing shared CardList compatibility is Required. Every
installed Table capability above remains Required with supported combinations;
reject incompatible combinations explicitly. Built-in local/session persistence
is replaced by the typed owner snapshot adapter, preserving the project policy.

Remote mode must expose advanced constraints/multi-sort only when a consumer has
an actual matching API contract. Countries current API has one search and sort;
S3-A2 now requires its real multiple-condition query extension and hosted support.
The generic harness uses controlled remote fixtures and never advertises local
filtering of a current server page as global query behavior.

## Exact source header measurements

Current Next captured2026-10-30,EN/AR390/1440,green/light,same fixture. At1440EN:
header1328×71.984375 at88,88;radius16;1pxdivider;border;linear gradient white to
rgb245,247,250;title18px/600/23.994px;IBM Plex Sans Arabic;foregroundrgb23,32,38.
Column header56px with centered content,10px horizontal padding and14px text.
Complete measured JSON accompanies this matrix. Other states/modes must be measured
and compared during runtime acceptance. No pixel-fidelity claim exists yet.

## Required verification combinations

EN/AR,5palettes,light/dark,390/1440;source header geometry and images;native filter
AND/OR/Apply/Clear;filter/sort/page together;scope replacement during pending
queries/edits/ranges;frozen+RTL+scroll;column resize/order+visibility+restore;grouping/
details/editors;selection keyboard/page/all;10000 virtual records;CSV formula values.
Unsupported grouping/virtual/variable-height/editor combinations must fail before
render with a typed explicit reason,not silently switch data modes.
