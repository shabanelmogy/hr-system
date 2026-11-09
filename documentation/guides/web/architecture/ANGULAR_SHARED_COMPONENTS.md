# Angular shared components

For the current five-view composition and reuse checklist, start with
[Angular collection views](ANGULAR_COLLECTION_VIEWS.md). It separates stable
shared rules from view-specific workflows and open findings; historical receipts
below retain their original scope and do not override the current contract.

## Shared Grid defaults and feature ownership — 2026-11-08

MyDataGrid defaults to responsive row actions: menu below 600px of actual content
width, inline from 600px. All feature consumers inherit this policy without an
explicit actionDisplay setting. The shared trigger is disabled for empty/all-disabled
commands. Architecture rejects feature-local forced-inline Grid configuration.

Reusable presentation, breakpoints, density, keyboard/focus, theme and feedback
belong to shared owners. Features provide business data, typed contracts, grants
and callbacks. Extend the existing owner and its tests when behavior repeats;
do not copy the policy into feature templates. Domain exceptions require a
reviewed shared contract, not an isolated CSS or input override.

Current source and executed acceptance:
[shared Grid actions](../../../modules/platform/features/angular-states-workspace/SHARED_GRID_ACTIONS_2026-11-08.md).

## Responsive verification and collection sizing

Apply the mandatory [responsive layout contract](ANGULAR_RESPONSIVE_LAYOUT.md)
for compact viewports, sidebar-dependent content sizing, natural dashboard cards,
compact headers and the development-only preset preview in a separate tab.

The shared `ViewportDebugger` is rendered in MainShell's TopBar only when
`isDevMode()` is true. It displays `window.innerWidth × innerHeight` in CSS pixels,
updates on resize, and labels the current layout interval: xs below600, sm600–899,
md900–1199, lg1200and above. It is an inspection aid, not a device detector; browser
zoom affects CSS pixels. Do not use physical screen dimensions for media-query checks.
Production shell rendering excludes the indicator. Labels use core EN/AR resources.

The indicator includes the shared `CopyButton` in its optional `iconOnly` mode.
Copy reads the latest signal value at activation (for example `390 × 844 · xs`),
including after a resize. Its accessible label uses `displayDebugger.copy` in EN/AR.
The generic copy owner handles unavailable/denied clipboard access and stale async
feedback; icon mode keeps its live feedback accessible without widening the TopBar
and shows a check icon on success. Existing text-button consumers keep their default
outlined layout. The diagnostic badge inherits the TopBar text color for contrast.

MyDataGrid's host must use `flex: 1` alongside zero minimum sizes when composed in a
flex collection workspace. A hidden toolbar must not make its width shrink to the
footer's content. Browser acceptance compares Grid width to the owner workspace,
in addition to verifying no outer scroll. CardList already follows the same rule.

Current source: web-angular/src/app/shared/ui. Ownership is generic presentation,
field/control integration and form behavior. Business rules, permissions, API
services and feature validators stay with their feature. Platform localization and
the single theme adapter remain their existing owners.

All shared components follow the mandatory
[Angular Clean Code policy](ANGULAR_CODE_STYLE.md): external colocated HTML/SCSS,
typed focused logic, shared ownership and automatic formatting/architecture gates.

## Current structure

### Routed parent workflows and filled tabs — 2026-11-08

Collection PageHeader uses one height scale for primary Add, Export and view
controls. Countries, States, Districts and Tenant Management inherit the policy:
36px regular fine-pointer, 32px compact/fluid small-header sizes, 32px short
landscape and 44px coarse-pointer targets. Preserve contextual action semantics;
feature pages do not introduce their own button-height overrides.

Composition groups existing owner workspaces; it does not move their services or
commands into shared code. Tenant Management opens its list directly without
outer tabs or a separate administrator sidebar destination. Add/Edit share a routed TenantEditorWorkspace, including
a scoped administrator tab for saved tenants; unsaved creation explains the
required first save. Preserve account-wide administrator command semantics.

Use shared ContentTabs `fill` for bounded full-height workspaces. It supplies
PrimeNG root/panel Pass Through sizing and a constrained active content wrapper;
non-fill consumers retain their existing layout. Retain keepAlive for drafts,
mount expensive secondary workspaces only after first selection and use external
commit with the shared navigation guard for route-owned tabs. Keep independent
HTML forms outside one another; shared DialogPanel appends its editor to body.
Tenant details has four tabs: Profile, Subscription, Applications, Administrators.
Billing/contact joins the same Tenant Profile field grid and validation-focus
identity, without internal headings or sections. Reuse the existing field-layout
group mixin for its two-column/compact single-column arrangement.
Notes joins Profile as a full-row field using the mixin's `field-span-full`
class. BooleanField's explicit `labelPlacement="above"` aligns a switch with
labelled text inputs; inline remains the default. Preserve its label association,
readonly/disabled semantics and validation. Tenant login enabled uses above
placement beside Billing email, with no helper description.
Use FormContainer's opt-in `contentScroll=false` when a shared filled tab owns
its content viewports; `footerVisible=false` hides the unrelated parent footer
on a command workspace tab. Defaults remain unchanged. Filled ContentTabs uses
12px panel insets (8px in narrow containers), with explicit comfortable/compact/
none `contentPadding` options. No feature-local raw tabs or nested HTML forms.
In short landscape windows (height through 480px), a filled form using its own
panel viewports keeps at least 180px for that content and scrolls its bounded
form container. The action footer remains sticky. Validation summaries must not
collapse the tab strip or intercept its controls; the outer page stays fixed.

Multiline TextField keeps its character count and clear action in a stable tools
row below the writing area, inside the same outline. The count aligns at logical
start and clear at logical end, respecting RTL; neither consumes textarea width.
Single-line tools remain inline. Clear retains the existing value/focus behavior.

### Selection workspace contract — 2026-11-07

Screens that browse a parent collection and its related records should compose the
shared `SelectionWorkspace` (`erp-selection-workspace`) instead of rebuilding a
sidebar, search field, and detail panel locally. The component keeps the parent
directory searchable through PrimeNG Listbox, exposes the selected parent by a
typed output, and owns the responsive two-column-to-stacked layout. The detail
slot remains owned by the feature, so cards, permissions, actions, loading and
empty states stay in the feature's existing shared collection component. At the
compact boundary (below 900px usable width or when the workspace container is
narrow), the directory and detail become stacked bounded regions; the application
page itself must keep its no-outer-scroll contract.

The sparse PrimeNG preset supplies explicit Listbox spacing and selection tokens
because the imported component preset expects semantic list tokens from a full
preset. Use the shared TextField in the Listbox filter slot so the search field
inherits the clear button and restores input focus after clearing. Keep the field
and its icon inset from the directory edges, and use the shared theme to
distinguish the selected row. The visible placeholder stays short, and the
accessible label describes the searchable fields. Verify the insets, selection
and clear action in the browser in Light, Dark, LTR and RTL.
The custom Listbox filter TextField must grow to the full available header width
with equal directory insets. Its intrinsic text width must not cap the search
field when the directory spans the page in a stacked layout.
In stacked layouts, size the directory to its content up to a bounded track.
The Listbox viewport scrolls when its rows exceed that track. A single short
result should fit without a scrollbar at 320×720 and 390×844.
Set `CardList.frameAppearance="plain"` inside a panel that already provides a
surface and border. The parent panel owns its corners and the CardList keeps
its existing scroll viewport and individual card styling.

For a few header actions with no view chooser, PageHeader exposes the explicit
`actionsLayout="inline"` option. It keeps primary/secondary commands in one row
without feature CSS. Tenant Administrators uses it for Add/Export/Refresh. The
adaptive/stacked defaults for multi-view collection headers remain unchanged;
verify compact widths and accessible icon names before selecting inline layout.

CardList's opt-in `compactLayout="single-column"` makes each card fill its
available content row through 790px of collection width. Larger containers retain
the selected auto/fit/responsive layout; the default compactLayout remains auto.
Tenant Administrators uses this to avoid a narrow card with an empty adjacent
track at 790x823 and smaller. Preserve the shared viewport, padding and footer.

Use this pattern for Tenant Administrators: the directory contains every known
Tenant, including an empty Tenant, while the detail collection contains only the
selected Tenant's administrators. If a current lookup cannot resolve a saved
membership, retain the membership snapshot name so an administrator never
disappears. A multi-Tenant administrator may therefore appear in more than one
detail selection, while the page total and export source remain based on the
unique administrator collection. Do not add a feature-local split-pane or a
second search implementation.

### Collection consistency contract — 2026-11-06

Pagination presentation belongs exclusively to CollectionFooter. When record
navigation is enabled, Grid and Cards use the same centered record controls and
edge page-size settings at every known-total/cursor consumer. A cursor source may
add explicit page controls in the shared context slot, show an unknown total and
disable last-record navigation; it must not fabricate counts or use another
feature-local footer. Responsive wrapping, dimensions, RTL and focus are shared
policy, never page-specific overrides. Native Paginator remains the documented
adapter for page-only known-total collections.

Record pagination measures the controls area after accounting for projected
footer content. Above 32rem it centers the record controls and aligns page size
at the logical end. At 32rem or less the record controls center in their
available column. At 26rem or less use smaller controls and visually hide the
page-count text so the navigation and size selector stay on one row. Native
Paginator uses its arrows and current-page report in place of numeric links
in this compact mode. Cursor controls retain their separate context slot.

MyDataGrid owns column-filter menus and AND/OR editors. A remote owner supplies
typed field definitions, applied filters and callbacks, and implements real
server predicates before paging/count/cursor merging. Never add a local predicate
over only the current remote page or silently ignore unsupported fields.

RecordSummary offers optional compact labeled metadata, and the shared entity
card header mixin accepts an optional title-line count. Owners provide domain
values; shared code owns recurring typography, spacing and wrapping. System Error
Logs consumes these APIs with container-fitting cards. Acceptance and rollout:
angular-system-log-collection-consistency; hosted query rollout is PROD-030.

S3-A7 adds `imports/spreadsheet-import-panel/spreadsheet-import-panel.ts`, the shared PrimeNG FileUpload
selection/template/action shell. Its file bytes stay local; owner-supplied JSON
commands remain in feature services. Reuse MyDataGrid for preview/paging and
FeedbackState for statuses (generic success/warning/danger tone, backward-compatible
default). Domain fields, validation, permissions, row statuses and batch outcomes
remain with Countries. Do not add another local file/preview shell.

`shared/data/spreadsheet-public-api.ts` is the import-only public entry for
SpreadsheetFiles, typed file/row policies and safe template download. The XLSX
parser and pinned SheetJS0.20.3 load dynamically; the core data entry does not
eagerly export workbook parsing. File metadata, ZIP declared inflation bounds,
headers, formulas, extra columns and nonblank-row count are validated before
exposing rows. No session storage, offline queue or direct file-byte API upload.

```text
shared/ui/
  public-api.ts
  buttons/
    public-api.ts
    action-button/
      action-button.ts
      action-button.html
      action-button.scss
      action-button.spec.ts
  forms/
    public-api.ts
    form-container/
      form-container.ts
      form-container.html
      form-container.scss
      form-container.spec.ts
    form-errors.ts
    fields/
      text-field/
        text-field.ts
        text-field.html
        text-field.scss
```

Feature/dev consumers import from shared/ui/public-api. Internal shared owners can
compose the narrower sibling public API. Do not use export-star barrels or expose
tests. Tests/styles stay beside their implementation. Folder names describe
responsibilities, not a generic components/services/utils collection. Future
dialogs/feedback/layout/collections get a folder only when an authorized reusable
implementation exists; do not scaffold empty trees.

Bootstrap consumers use `shared/data/navigation.public-api.ts` for unsaved state,
navigation lifetime and guards; unrelated read/collection utilities remain lazy.
Platform text/bootstrap uses `platform/localization/presentation.public-api.ts`.
The existing `public-api.ts` entries remain compatible for feature consumers.
Wire schemas live separately from type-only contracts; unknown responses are
validated by their HTTP owner before presentation receives typed data. D40 source
and build evidence: angular-localization-foundation/STRUCTURE_PERFORMANCE_REPORT.md.

## Existing components

### Shared import workspace — 2026-11-08

Reuse SpreadsheetImportPanel for file/template/submit/clear actions, counts,
feedback and bounded MyDataGrid preview. All current geography consumers project
its same live actionsTemplate into PageHeader with externalActions=true; the page
uses actionsLayout='stacked' and SurfaceCard.headerVisible=false avoids a redundant
local heading. Standalone consumers retain the local command heading by default.
Feature owners retain file rules, permissions, callbacks and submission state.

The summary is a single row of five compact MetricCard.layout='tile' cards with
semantic accents,18px numbers and optional localized shortLabel. Full accessible
labels and titles remain available. No independently scrolling summary rail.
Shared control text/icons are 12/16px, with 32px fine-pointer and 44px coarse-pointer
commands. Preserve at least 180px preview height and a bounded short-window
workspace scroll; the outer page stays fixed. Requirements and footer are reachable.

Keep full row/field validation details in the preview, short feedback above it,
and existing partial/uncertain handling. Never infer a specific duplicate row
from an atomic batch error. The current source and executed evidence belong to
[the Import layout contract](../../../modules/platform/features/angular-countries-import-view/IMPORT_LAYOUT_2026-11-08.md).
The dated 2026-11-05 rail contract is historical, not a current screen template.

Clean Code hardening retains MyDataGrid as the public collection shell. Its
colocated `grid-column-presentation.ts` owns generic preferences and
`grid-viewport.ts` owns native size/font observation. Shared `CollectionColumnPipe`
(`collectionColumn`) resolves projected cells/headers/footers by column key;
consumers never bind a column template to a numeric array position. Pure shared
record-feedback decisions and criteria normalizers retain their existing owners.

| Public API | Generic responsibility | Caller responsibility |
| --- | --- | --- |
| ActionButton | Native button type, busy/disabled/selected state, focus, translated label, full-width | Domain callback, permission, actual operation pending |
| ActionMenuButton | Anchored PrimeNG popup menu, one named non-submit trigger, icons, keyboard/focus, unique menu IDs and current disabled guards | Translated label, unique action IDs/labels/icons, permission-filtered actions, pending and action callback |
| TextField | Text/email/password CVA, label/help/error IDs, clear/reveal, readonly/disabled, IME and zoneless control updates | Typed control, validators and translated error messages, required label marker, autocomplete policy |
| FormContainer | Projected header/content/footer, native noValidate, touched errors and summary links, first invalid rendered focus, pending/read-only submit guard | Typed form, feature title/action/feedback, save pending and actual authorized submit |
| applyServerFieldErrors | Exact nested dot/index field matching, preserve client errors, return unknown paths | API-specific error parsing and unmatched form feedback |
| clearServerFieldError | Remove only server error without discarding other validator errors | No business conflict/forced replay decision |

## Action menus and single-row toolbars — 2026-11-05

Use `ActionMenuButton` (`erp-action-menu-button`) from the Shared public API when
several existing commands should share a dropdown trigger. Supply readonly
`ActionMenuItem` entries with stable unique `id`, translated `label`, optional
public `AppIconName` and `disabled`. Bind the global pending state to `disabled`
and handle the emitted `activated` ID in the feature. The feature filters actions
by permission and rechecks its current policy before dispatching to its existing
state/service; Shared never decides grants or performs HTTP. Duplicate IDs fail
closed. Removed, disabled or globally blocked commands cannot emit from retained
menu callbacks. No schema, business operation or form engine belongs here.

`ActionButton` accepts existing leading `[buttonIcon]` content and optional trailing
`[buttonEndIcon]` content. DOM order defines icon placement, as documented by
[PrimeNG Button](https://primeng.dev/button#icons). ActionMenuButton uses the trailing
slot for a `chevronDown` indicator with a logical separator and an expanded-state
rotation. Keep this visual dropdown affordance even while closed; a download arrow
before the label does not communicate a menu clearly. Shared owns these styles
and respects RTL and reduced-motion preferences. The whole control remains one
button and one keyboard target.

The adapter composes the existing `ActionButton` with PrimeNG `Menu` in popup mode;
the popup is appended to body so a scrolling toolbar does not clip it. PrimeNG
owns menu keyboard navigation, Escape and trigger focus restoration. External
HTML/SCSS only adapts icon and long-label layout to the existing theme. Its scoped
`dt` imports the adopted Aura Menu preset and maps root/item/list tokens to the
existing application surface, foreground, border and accent variables, following
the existing ContextMenuPanel strategy. The global preset is intentionally
selective; a newly adopted component must supply its own registered/scoped tokens
before visual acceptance. Do not compensate for absent tokens with feature CSS.
PrimeNG MCP Menu API, popup example, scoped-token guide and usage validation were
consulted; actual browser verification remains necessary for the installed version.

Reuse `MyDataGrid`'s existing `toolbarLayout="single-row"` for a toolbar that keeps
search, projected filters, actions and Grid options on one line. Small viewports
scroll inside that toolbar. `CollectionFrame` gives a text-only search a 220px
minimum; field/operator search retains its existing 540px minimum. Responsive
wrapping remains the default for other consumers. Do not add feature-local flex,
scroll or menu CSS. The current manager consumer and verification are recorded in
[the manager action menu contract](../../../modules/reporting/features/global-crystal-template-manager/MANAGER_ACTION_MENU_2026-11-05.md).

Simple-search compatibility remains (the two-logical-row rule below applies to structured search): adaptive Grid puts search, Reset and the
icon-only Grid Options trigger together at 571px or less; Cards place search,
Sort By/direction and compact Reset together. All icon-only controls keep their
accessible names. Tenant Management Cards retains CardList.scrollbar='hidden'
while touch/wheel/keyboard scrolling remains available. The plain shared layout
owns these policies, not a tenant-specific CSS override.

Toolbar icon sizing belongs to CollectionFrame. Its `--app-icon-size: 18px`
inherits through projected buttons, including Reset in Grid and Cards. AppIcon
uses a 1.5rem fallback elsewhere. Keep glyph size separate from the shared button
hit-area dimensions and remove feature-local toolbar icon sizing rules.

PageHeader retains direct permitted view buttons. At 64rem or less of actual
header width, primary action sits beside the title/badges, while views and
secondary commands occupy the next row. Filter visibility/drafts remain owned
by feature state; the header exposes its expanded state. Countries, States and
Districts start with collection search collapsed. Report has an independent
filter workflow and starts open. See the responsive and collection-view
contracts for current title/action, theme and compact acceptance rules.

Current structured collection search uses natural wrapping of the actual controls,
not the earlier fixed-count 46rem/54rem thresholds. CollectionFrame keeps adaptive
structured search separate from forced-single-row styling and flattens only its
plain projection wrappers. Compact field/operator widths are 112/128px; query starts
at 200px and expands within a full-width search row. Projected selects start at 112px or an
explicit existing controlWidth for a wider lookup. All controls/actions are 44px;
OptionSelect inherits the shared density height without changing form defaults.
At every width, projected structured filters grow without a maximum-width cap
and fill each row, including wrapped rows and rows shared with actions. At 34rem or less, adaptive search placeholders use 12px through
TextField's inherited --field-placeholder-font-size hook; entered values and
non-search fields retain their existing font. Keep 44px outlined controls.

Structured search always starts with two logical rows at every width, including
wide desktop: search selectors/query first, domain filters/actions second. Both
rows fill the available width. Do not wait for a breakpoint or squeeze content
into a combined row. Narrow panels may wrap either row further for readability.
From 56rem use 144/160px search selectors and 240px query minimum; below use 112/128px
and 200px. Projected filters grow to fill their row, with 144/112px bases and any
reviewed content-specific controlWidth. All outlined controls/actions stay 44px. Action-only rows align commands at
the logical end; empty projected wrappers do not reserve space.


Current source and rendered evidence:
[shared collection search](../../../modules/platform/features/angular-states-workspace/SHARED_COLLECTION_SEARCH_2026-11-08.md).

Compact search companion: one projected OptionSelect can explicitly opt in with
`data-collection-search-companion`. At collection widths through 34rem it shares
the operator row, followed by the full-width query and remaining filters. Through
28rem, the search-field selector gets a separate row to avoid truncated operator
values. Wider layouts retain the default two logical rows. Districts opts in for
Status in Grid/Cards; other consumers inherit the default until explicitly opted
in. This is CSS placement of the existing live control, with no duplicated inputs,
state transfer or tabindex override. See the shared [view contract](ANGULAR_COLLECTION_VIEWS.md#3-search-and-filter-density).


## Loaded snapshot collections — 2026-11-06

Use `createLocalCollection` from the Shared UI public API for an already loaded,
immutable array, such as a record's field-change snapshots. Provide signal-backed
`rows` and `scopeKey` callbacks, allowed `pageSizes` (the first is the default),
and explicit raw-value selectors in `sortValues`. Bind its `source`, `sort`,
`changePage` and `changeSort` to the existing `MyDataGrid`; keep the shared Grid
shell, columns, feedback, footer and selection. This adapter never fetches data.
Do not use it to sort or filter one downloaded page of a remote collection.

Local text filtering is opt-in through `textFilterFields`. Bind
`CollectionTextFilter.columns` to translated `{ field, label }` entries,
`filter` to the adapter's current criterion, and `filterChange` to
`changeFilter`. The filter editor composes the existing shared popover, fields,
options and buttons; `isAnyOf` has individual add/remove value controls. It
supports contains/notContains, equals/notEquals, startsWith/endsWith,
isEmpty/isNotEmpty and isAnyOf. The single-condition contract is independent of
remote `GridFilters` and does not add operators to API codecs.

The adapter filters the complete snapshot before stable sorting and paging.
Null/undefined/empty-string checks use raw values, never translated empty labels.
Text queries are trimmed; equality/list matching uses case/diacritic-insensitive
search collation. Criteria changes reset the page and shared row selection;
replacing the snapshot or scope resets page, sort and filter. Keep original row
IDs stable across sorting/filtering. Allowed filter fields are intersected with
the adapter's own raw selectors; malformed criteria preserve the existing filter.

`MyDataGrid.recordNavigation` and `selectionEnabled` remain explicit opt-ins.
Activate them when required by the reviewed source.

Grid presentation maintenance2026-11-08: use `actionDisplay="responsive"` for
collections with inline row actions. It uses inline actions from600px of actual
Grid content width and a single action-menu trigger below600px; explicit `inline`
and `menu` remain supported. Sticky actions have a logical leading separator and
retain all supplied actions. Width reservation includes44px touch targets and4px
gaps. Standard pointer targets are36px (32px in compact density); coarse pointers
use44px targets and at least52px rows, including an explicitly compact preference.
Selection labels have explicit, instance/row-key-based `for`/`inputId` pairs,
including frozen rows and radio selection. The selection column remains52px.
Headers use a theme-derived muted surface,600 weight and visible sort indicators.
Numeric cells use tabular figures. `CollectionColumn.icon` supplies an optional
decorative icon through the shared default cell renderer, which truncates long
values with a complete title and bidirectional text isolation. Do not recreate
icon/text truncation in a feature-local cell shell. Countries consumes this
renderer for both names and shows an em dash for absent phone/currency values.
PrimeNG MCP Styled Mode/Table guidance was consulted; generated Table API
validation covers bindings, while Angular checks and browser tests cover actual
CSS, density, frozen actions, selection and scrolling. The browser command is
`node scripts/verify-countries-screen-browser.mjs --grid-layout`.

Interactive checkbox controls
must not trigger a single-click row action. Unknown totals stay null, and the last
record is unavailable until an authoritative bound exists.
Unknown-total footers keep direct page controls alongside record navigation;
stepping individual records does not replace the cursor-page action.
The native Table sort field is cleared with `null`, because the installed PrimeNG input treats
`undefined` as an omitted update. Tests cover local criteria, stable rows,
selection/navigation and resetting an applied native sort.

## Current form contract — D07/D39, 2026-11-04

Use Angular 22 Signal Forms for feature models, typed validation schemas, nested
objects, arrays, conditional/cross-field rules and submission. Bind shared fields
with `[formField]`. Angular owns value, touched/dirty/errors and submitting state;
do not create another validation/dependency engine. Exact decimal strings and
invariant date-only strings use shared `validateNumericText` / `validateDateOnly`
inside the native schema. Their native MIN/MAX metadata drives shared UI bounds.

Shared `FormContainer` delegates to the form's configured native submission action.
The action awaits the actual API operation, uses `ignoreValidators: 'none'` to
block pending validation, and maps owned backend field errors with
`mapServerFieldErrors(form, fields, submittedSnapshot)`. Angular clears those
submission errors when their field changes. General network/command failures use
owner feedback, preserving unchanged retry and explicit uncertain-write recovery.
The native submit boolean describes validation/action completion; domain success
comes from the owner's success result/event. It is not persistence proof.

Save stays available when invalid. The shared shell owns novalidate, inline
messages, summary links and invalid focus. Native focus bindings also reach fields
inside child components. For such nested fields, schemas must provide translated,
self-contained messages because a parent content query cannot read their labels.
Root submission rejections appear in the summary; use them for real form-level
validation, never a transient network failure that must allow unchanged retry.

Text/email/password/multiline, numeric, date, boolean and reference controls expose
native FormValueControl models/state/touch/focus/reset. PrimeNG adaptation and its
internal FormControl, where needed, stay inside Shared. Null remains valid for
an absent reference ID; exact-number and date-only contracts remain strings.
Readonly/disabled/required/maxLength/min/max are supplied by the native schema;
do not bind reserved inputs alongside `[formField]`.

Compatibility: existing technical Reactive Forms harnesses can still use CVA,
`validSubmit`, applyServerFieldErrors/clearServerFieldError, and event bridges.
That retained interface does not authorize new feature FormGroups. Native bindings
must not register the legacy CVA on Angular's compatibility NgControl: doing so
would lose native metadata, focus and reset behavior. No second model is created.

See [the implementation and CRUD pattern](ANGULAR_SIGNAL_FORMS.md). The historical
component/acceptance sections below retain their original technical scope.

## Boundaries and remaining acceptance

P-015 public authentication uses the reviewed current Next Login/AuthLayout visual
baseline. Shared form/field/button may gain generic plain/floating/icon/projected
slots needed by the actual consumer; the login page never recreates their lifecycle.

check:architecture uses the TypeScript AST to reject raw PrimeNG imports,
aliases/dynamic/re-export bypasses, inline raw form/input templates and imports of
shared internal files from feature code. It now has 16 regression cases and resolves configured TypeScript aliases, checks
owner public APIs, external templates and eager value cycles (type-only/lazy
edges are treated separately). This is static dependency/policy evidence, not
a runtime integration proof.

Current two technical fixtures at /dev/forms verify composition without business
data or auth. They are absent from the production route file and bundle. Shared
text/form verification does not complete select/date/reference lookup, structured
repeaters, dialog focus/dirty navigation or the full SIG-07/08 contract. Those are
Required before their actual consumer; FOLLOW-014 centrally owns the remaining
shared-form acceptance schedule.

Canonical feature report: Platform/angular-form-foundation/IMPLEMENTATION_REPORT.md.
Existing SQL-backed UI translations remain FOLLOW-012 for actual signed-in consumer
acceptance. Local PrimeNG activation is Verified under FOLLOW-013. Production
origin/hosting acceptance remains PROD-017/019.

## Shared validation badges and authentication adoption

`ValidationSummary` (`erp-validation-summary`) is a generic exported Shared forms
component, added at the requester's explicit follow-up. `FormContainer` composes it
automatically for invalid submissions; feature forms must not recreate its banner,
count, badges or error links. It accepts readonly `ValidationIssue[]` with `id`,
`label`, `message`, and emits `issueSelected(id)`. It owns presentation only;
`FormContainer` still validates, observes errors, focuses the first invalid field
and resolves selected IDs to the corresponding shared field. Errors remain beneath
their inputs, submit remains enabled when invalid, and no native validation UI is
introduced. Count/badges update when errors clear. Empty issues render no alert.

The badge header and accessible count announcement use existing core translations
included in generated bootstrap resources, so a standalone Shared consumer does not
flash untranslated keys before a route's lazy core resources load. Source strings
continue to come from the canonical web/API catalog; never edit generated JSON.
Labels/messages render as text, with keyboard focus, RTL, wrapping, both theme modes
and semantic shared error tokens. The public export is under `shared/ui/public-api`.

The actual sign-in consumer also adopts generic plain form/full submit/icon slots,
floating field prefix/max-length/counter, action description/quiet/icon options,
preference `OptionSelect` and `ChoiceDialog`. These do not introduce a general
business select CVA, dirty editor or repeatable collection contract. See the
Platform `angular-password-sign-in/IMPLEMENTATION_REPORT.md`; FOLLOW-014 remains
open for those independently scoped controls.

## Authenticated frame and PrimeNG preferences

ApplicationFrame owns responsive 64/280 navigation, 64/56 header and mobile Drawer lifecycle; NavigationList owns accessible generic search/actions. Shell supplies identity, translated labels, entries and slots. Shared PopoverPanel owns opening/dismissal/focus; PalettePicker owns native radio semantics for the five public token palettes. IdentityAvatar, ContextBadge, PageHeader and SurfaceCard are reusable presentation. ActionButton supports generic aria-expanded/controls/hasPopup; TextField supports generic hidden label and placeholder. Feature pages must consume these public exports.

OptionSelect now wraps actual PrimeNG Select with controlled readonly option/value input and registered value emission, accessible label and body overlay. It is a personal-preference control, not a general business select CVA. Scoped currentColor keeps the closed selected value correct on colored headers and neutral surfaces; global tokens own overlay/selected colors. Shared partial theme must retain mask.transitionDuration so leave animation releases overlays and scroll locks. See angular-application-shell/IMPLEMENTATION_REPORT.md for 24 shell and 20 selector cases.

## Shared application discovery

LauncherGrid/LauncherTile provide generic translated navigation cards with native links, icon/accent/contrast input, responsive module/area variants and RTL arrows. Platform supplies only known permitted internal hrefs; Shared never calls the catalog or inspects permissions. FeedbackState supplies generic loading/status, empty, error/forbidden and action presentation; callers own retry/navigation. ApplicationFrame.navigationVisible is generic and defaults true. ModuleWorkspace owns component-scoped catalog state/cancellation, not Shared. See angular-module-navigation/IMPLEMENTATION_REPORT.md for source geometry, actual API and scope tests.

## Scoped reads and dashboard presentation

Shared data/public-api exposes createScopedRead for component-scoped read identity/cancellation/finite state/retry. Callers supply identity/authorization and a finite service observable; services own transport/schema/timeout. Module and tenant-summary states consume it; no global auth/query store is added. Shared MetricCard renders translated display values, ProgressMeter wraps PrimeNG ProgressBar with bounded percentage/label, and StatusBadge wraps PrimeNG Tag. SurfaceCard's optional compact/fill/icon/accent and frame fillContent compose bounded read dashboards without duplicating shells. Strong MUI secondary maps to token brand2, not the quiet secondary surface. Platform-owned namespaces must load explicitly; dashboard uses platform-tenants with core fallback and a finite caption boundary.

## Company context integration

OptionSelect also supports a generic context appearance, icon/description,
busy/disabled and external commit. Its Reactive FormControl keeps the visible
selection at the caller's verified value until that caller commits. The default
preference behavior and 20-case language/color/keyboard matrix remain compatible.
This does not establish a general business select CVA. FeedbackState supports
generic inline feedback in addition to its default page layout.

Protected scoped reads consume AuthSession.readIdentity, which is paused during
context verification; header display alone consumes the last verified user.
Platform owns invalidation-only cross-tab notifications and authoritative API
revalidation, not Shared or feature pages. New editable consumers must first
satisfy FOLLOW-014's shared dirty-context gate. See angular-company-context's
canonical report for 90 unit tests, 14 production context cases and actual
Angular/SQL Cookie transport proof; saved translation editor acceptance remains
FOLLOW-012.

## Module context composition

Shell exposes generic context-component and feedback InjectionTokens. Only the lazy app composition imports business modules. Accounting supplies its public working-year control/state; Shell imports no Accounting DTO/service. Platform runScopedContextUpdate serializes module context work with company/logout, verifies API identity and resumes scoped reads only after CSRF/localization. Module writes obtain CSRF through the narrow public BrowserMutationSecurity facade. Shared OptionSelect supports generic emptyLabel/invalid; its context value remains externally committed. Fiscal-year report records99 unit/7 architecture tests,15 production scenarios and actual UI/SQL/tab/reload/restoration. Future editable consumers still require FOLLOW-014.

## Shared collections (S1-A3)

Entity-card recurring typography and metadata styles now live in Shared Sass
cards/_entity-card.scss. Countries and States domain header/content components
include its header/content mixins; domain labels/values/quality rules remain
feature-owned. Use the existing SurfaceCard/CardList slots and this shared
presentation before copying card CSS. MainShell stretches the routed page inside
scope-view; nested workspace and import owners compose column Flex with min-height0
so short data does not collapse the remaining screen area. Current States and
Countries Import acceptance checks actual bounds, not only a height declaration.

Card presentation refinement2026-11-08: SurfaceCard projects `surfaceHeaderActions`
beside its custom header. CardList uses this slot for a labelled 44px selection
target so selection stays above the metadata. The shared entity title and
subtitle use up to two lines. Countries supplies complete title attributes and
shows the quality percentage beside its progress meter instead of a duplicate
header badge. Shared entity metadata aligns labels and values in two columns.
Card actions inherit 44px targets and 8px spacing through RowActions' generic
CSS properties. Grid actions retain their existing density. Entity header,
content and footer insets follow the shared compact spacing. Browser evidence
is produced by `verify-countries-screen-browser.mjs --card-layout`.
Checkbox labels use an explicit `for`/`inputId` pair unique to each CardList
instance. PrimeNG MCP validates Checkbox inputs; Angular Forms' `ngModel` and
`ngModelOptions` are directive bindings outside its component metadata. Angular
lint/build and browser pointer/keyboard checks verify the composed control.

Compact collection search maintenance2026-11-08: CollectionFrame's adaptive
search uses14px control text,12px labels and8px field gaps below
56rem of actual panel width. Structured search has reduced vertical spacing;
its44px controls and existing clear actions remain. OptionSelect exposes generic
`--option-font-size`, `--option-label-font-size` and `--option-label-gap` CSS
properties; TextField exposes `--field-font-size`. Default sizing stays owned by
each shared field. The collection owner supplies the compact values for Grid and
Cards; feature-local font overrides are unnecessary. Browser verification is
`verify-countries-screen-browser.mjs --pagination-layout` and `--search-layout`
in EN/AR, Light/Dark; its current search assertion requires separate search and
criteria rows even at 1440px. Earlier single-row receipts are historical.

The final label presentation uses existing floating-label fields: labels sit in
the top border above34rem of panel width. At34rem or less, the collection owner
visually clips labels while retaining their `for`/control IDs and accessible
names. Empty search text shows its placeholder; selected dropdown values remain
visible. Status/sort selectors follow the same collection presentation. TextField
exposes optional floating height/input-height/padding/radius CSS properties so
the collection can retain44px controls without changing regular form defaults.

Selection placement maintenance2026-11-05: MyDataGrid renders its single
page-selection checkbox inside the selection column header, spanning grouped
headers once. It is present only for enabled multiple/range selection. Its state
comes from the existing CollectionController: current eligible page only, partial
selection announced as mixed, and disabled outside a ready eligible page. The
selected count is announced through a live region and Clear shares the paging
row in Grid and Cards. CardList includes Select All next to Clear and retains
the shared selection bar when explicitly rendered without a footer. Features
reuse this presentation and the existing selection state.
Evidence: angular-collection-foundation/HEADER_SELECTION_2026-11-05.md.

MyDataGrid<T>/erp-data-table and CardList<T> are the public collection shells.
CollectionColumn/Source/Query/Page/Sort/Search contracts and typed CollectionCell,
CollectionCardTemplate and CollectionEmptyTemplate are exported by shared/ui/public-api.
PrimeNG Table/Checkbox/Paginator, collection controller/frame/footer/feedback/focus
remain internal. Never rebuild a collection shell or use raw Table/Paginator in
a feature; inline and external-template architecture checks reject bypasses.

The caller owns remote criteria/scope/permissions/requests and committed paging;
Shared only emits intents and masks mismatched rows. Unknown is not zero. Active
record movement and eligible page-only selection are independent; cross-page
record focus waits for its matching response. Existing controls, PopoverPanel,
SurfaceCard and ScrollViewport are reused. PopoverPanel.triggerAppearance defaults
to icon; optional quiet label is generic and retains dismiss/focus lifecycle.

See platform/angular-collection-foundation/SHARED_COLLECTION_CONTRACT.md and its
IMPLEMENTATION_REPORT for119 unit tests,40 browser cases and source comparisons.
The /dev/collections fixture is excluded from production; advanced features are
FOLLOW-016 and editable/reference controls FOLLOW-014. This is not business CRUD
or actual Countries parity. Canonical labels still use the schema3/SQL UI catalog;
matching API resource deployment stays PROD-019.

## Shared business reference field (S1-A4)

Parent-dependent feature forms use the existing ReferenceField with owner-scoped
ReferenceSource/ReferenceSelection. Keep lookup transport in the referenced
domain's service and expose a narrow public entry when another owner consumes it;
the Angular Countries lookup.public-api.ts is the current read-only example.
The dependent feature owns independent lookup grants, active membership, loading/
empty/error/forbidden and actor fencing. A retained unavailable parent is a
disabled display option, never an active choice. Compose native Signal Forms
validation with lookup signals so availability changes revalidate the selected ID
without requiring an edit or disabling Save. Dirty-key normalization must accept
incomplete drafts, and detail-to-draft conversion must explicitly project form
fields rather than spread response metadata. States' state-mutation/read/parent
controllers demonstrate this foundation; full States customer UI remains pending.

ReferenceField and typed ReferenceId/Option/Query/Result/Source/Selection contracts
are public through shared/ui/public-api. Single scalar CVA preserves numeric0 versus
string0; no implicit All ID. Source scope+search and separately resolved selected
value prevent stale option/caption leaks. The current off-page selection is a
disabled display row, not a fake selectable result. Caller owns transport, scope,
validators/permissions, debounce/cancellation, page accumulation and resolution.

FormFieldControl is internal generic error/touched/readonly/CVA observation and
focus metadata; TextField and ReferenceField share it. FormContainer queries that
token in DOM order rather than hardcoding a field class. Shared field chrome is
reused. Preference/context OptionSelect remains its existing controlled contract.
No feature-local form/selector shell or Shared HTTP/cache is permitted.

PrimeNG Select's public Pass Through mirrors disabled options to aria-disabled,
localizes the listbox label, and binds error/help/required attributes. Caption
announcements come from the canonical bilingual catalog. Preserve vendor flex/fluid
host layout; geometry and long-label overflow are browser-checked. The dev-only
reference fixture is not a business lookup acceptance test. See the canonical
angular-reference-selection-foundation report; FOLLOW-014 and ERP-02/S3 retain
multi/date/dirty/editor and actual consumer proofs.

## Verified local close and shared modal frame (S1-A5)

Shared UI exports DialogPanel/ConfirmationDialog/ChoiceDialog and FormCloseGuard.
DialogPanel extracts the actual scope-choice frame over PrimeNG Dialog; consumers
project content/actions, supply translated labels and pending. ConfirmationDialog
initially focuses Cancel. Modal dimensions/scroll/keyboard/restore behavior is shared,
not copied into feature-local wrappers. ChoiceDialog retains scope selection semantics.

FormCloseGuard accepts owner identity, monotonically changing revision, active,
semantic unsaved and pending. It emits one current CloseConsent; owner rechecks
identity/revision and pending before closing. Draft/owner/clean/pending/destruction
invalidates stale consent. Shared never saves/resets drafts or assumes form.dirty
is baseline equality. Include FormContainer.checking in local close pending;
FormContainer remains validation/summary/submit/focus authority.

Local close is technically Verified with138 unit/40+8 browser cases. App route,
company/year/module/session and forced-reload integration remain FOLLOW-014/015.
Do not claim global dirty safety from local confirmation. No native alert/confirm
or draft persistence is added. Canonical evidence:
documentation/modules/platform/features/angular-form-close-foundation/IMPLEMENTATION_REPORT.md.

## Registered draft transition protection (S1-A6)

Shared data/public-api exports UnsavedChanges, DraftState/DraftOwner and actual
unsavedNavigationGuard. Each mounted editor registers its live semantic identity,
monotonic revision, active/unsaved/pending and an invalidate callback; cleanup owns
that registration token only. Owner baseline/accepted save stays in the feature.
Reads are checked again before accepting current consent. Do not eagerly discard
a draft when the user accepts a navigation that a later target guard can still deny.

App root lazily hosts existing ConfirmationDialog through UnsavedConfirmationHost.
Authenticated parent uses CanDeactivate with always policy; UrlTree path/matrix/
outlet identity differs from query/fragment. Root lifetime handles supersession;
computed history restoration covers canceled back/forward. Context owners ask
before locale/read invalidation/API mutation, then recheck session and target.
Verified identity/permission/role/readonly/year loss invalidates registered owners;
same-scope external hints cancel old consent without erasing valid drafts.

External-commit OptionSelect silently reconciles its verified input in a guarded
microtask after PrimeNG's CVA stack. PrimeNG writes modelValue after onModelChange,
so a synchronous reset alone permits uncommitted display/retry drift. Real vendor
selection and actual context-denial/retry tests must accompany this control.

No native beforeunload/alert/confirm or sensitive draft persistence is added. Future
editors must opt in and verify. Hard reload/tab/external document recovery remains
FOLLOW-014; this kit does not prove all business editors or SIG-02 caching/lifetime.
Report: documentation/modules/platform/features/angular-unsaved-navigation-foundation/IMPLEMENTATION_REPORT.md.


## Angular shared DateField (S1-A7 Verified)

DateField in Shared public API extends the existing TextField/FormFieldControl and
FormContainer contracts. Bind string day values YYYY-MM-DD, empty string for clear,
owner required/business validators and optional inclusive min/max. Invalid text
stays visible; Arabic/Persian digits normalize to ASCII, no UTC/ISO date conversion.
The shared calendar uses deferred PrimeNG in PopoverPanel; locale captions follow
SQL overrides through the lazy theme/calendar-public-api. Do not import that adapter
through the root theme entry. Readonly/disabled/callback and summary/focus stay
shared. Manual years0001..9999; calendar0100..9999 with explicit helper. No timestamp
or schedule mode. Report and technical consumer guide own verified limits.


## Angular exact numeric field (S1-A8 Verified)

NumericField extends existing TextField and shares its extracted text-field.html.
Bind string edit values; choose integer/decimal and explicit owner limits. No Number
coercion, rounding, clamping, grouping or spinner in this kit. Optional inclusive
string min/max compare exact decimal magnitude; digits/scale independently bounded.
Arabic/Persian digits/Arabic decimal normalize, invalid/partial text stays visible.
Use existing FormContainer/summary/server errors/required rules. Constraint changes
notify shared errors without valueEvents/dirty state. Real financial consumer/API
precision remains its owning ERP-07/FOLLOW-003 gate; guide/report own current limits.


## Angular strict boolean field (S1-A9 Verified)

BooleanField uses FormFieldControl and actual PrimeNG Checkbox/ToggleSwitch.
Bind literal bool, use owner nonNullable reset; false valid, requiredTrue explicit
owner rule. No truthy string coercion/nullable/tri-state. Same Shared form/summary/
focus/server-error lifecycle, quiet programmatic writes and variant swap. Readonly
cancels native click default to prevent hidden checked/model divergence; keep it
focusable. Disabled reaches actual inner control. Owner retains flag meaning and
authority; technical guide/report own measured limits, no settings auto-save.

S1-A10 multiline: extend existing TextField via multiline/rows, never a parallel
textarea shell. Actual PrimeNG Textarea shares CVA/IME/errors/counter/clear/focus.
Rows1..20 default3, bounded vertical resize; owner required/maxLength/save remain
explicit. Numeric/email/password stay single input. See angular-multiline-field-
foundation/IMPLEMENTATION_REPORT.md and technical consumer guide after Verified.

S1-A11 optional Shared data criteria codec/Router bridge extends existing collection
responsibility/SIG-06, not the Grid shell. Explicit owner public-field/privacy/type/
operator policy, committed URL state, separate draft and API/export adapters. Reuse
MyDataGrid/CardList/toolbarFilters/source identity. CollectionSort stays compatible
alias. See angular-collection-criteria-foundation report/technical consumer guide.

S1-A12 createScopedRead now captures callback identity, defers factory errors, takes
one validated body and errors on empty completion. Existing retry/refresh coalescing
retained; invalidate restarts a pending current allowed read for an explicit owner
hint. Own watcher separately with scope validation/takeUntilDestroyed; service
retains DTO/timeout. No business watcher/global cache/loader engine. See scoped-read-
lifetime-foundation report/guide and FOLLOW-017 for actual consumer acceptance.

## S3-A0 generic PDF presentation

PdfViewer (documents/pdf-viewer.ts) accepts validated PdfDocument via the public
API. It creates trusted local Blob resources, masks obsolete input and revokes
on replace/clear/destroy. Open/Download remain available; inline capability is
advisory and iframe.load is not rendering proof. Shared data validatePdfDocument
owns bounded MIME/signature checks. No raw URL/HTML, authorization, criteria or
API call belongs here. ReportWorkspace (layout/report-workspace.ts) projects
criteria/document regions side by side wide and stacked compact. Reporting
composes existing fields/form/actions/feedback and owns report policy.
Verification:31newunit/295total/full check,PDF40+8. No new renderer SDK.

## Countries read consumer compatibility — S3-A2

The verified read consumer extends existing public components generically:

- CollectionSearch.maxLength optionally bounds local search and shows the shared
  field message; invalid drafts never emit search changes. Owner synchronization
  and locale label changes preserve a local invalid draft. Default is unbounded.
- CollectionCardHeader and CollectionCardFooter are typed per-record projection
  directives beside CollectionCardTemplate. CardList still owns collection state,
  focus, toolbar, paging and ScrollViewport; SurfaceCard owns the card surface.
- CardList.layout='responsive' opts into1/2/3/4 columns at600/900/1200 breakpoints;
  default 'auto' retains existing sizing. appearance='entity' uses SurfaceCard.entity
  for the generic accent bar and entity spacing; existing compact defaults remain.
- ProgressMeter.appearance='inline' and optional accent support owner-defined
  metrics without changing its bounded value or default usage-warning colors.
- StatusBadge.appearance supports soft(default),outline,solid; solid contrast is
  caller-owned. Country quality thresholds/levels belong to the feature.
- FormContainer.showSubmit=false supports read-only content with projected Close;
  submit is guarded before and after asynchronous validation. Default remains true.
- MyDataGrid coalesces PrimeNG's transient field/order effects into the final
  microtask pair. Owner-equivalent, destroyed and non-ready events never issue a
  sort callback; user header/keyboard sorting stays functional.

Actual sources and evidence: angular-countries-read-workspace/IMPLEMENTATION_REPORT.md
and required-files.json. Angular323 and Countries40+8,collection8/home14/login10/
language20/context24/PDF8 acceptance passed. These options do not grant business
permissions or establish complete Countries/host/native/production acceptance.

## Shared-first template rule and native PrimeNG priority

Requester reaffirmed 2026-10-30: anything recurring belongs in shared components
to unify appearance, application and maintenance; business features concentrate on
business data and rules. Follow [ANGULAR_PRIMENG_WORKFLOW](ANGULAR_PRIMENG_WORKFLOW.md):
MCP first, existing shared component, built-in PrimeNG capabilities, documented
tokens/Pass Through, then only evidenced generic extensions. No feature-local
copies of Grid, options, modal, toolbar, spacing, filter or feedback behavior.

Grid options now composes shared DialogPanel with native Dialog/Tabs/SelectButton;
visibility, order, logical pinning, search, density preview and reset stay generic.
Collection cards have shared responsive internal padding. Shared clear actions use
native icon-only buttons and the built-in icon, preserving their CVA contracts.
See the current Countries verification correction for acceptance and limitations.

## Complete shared PrimeNG Table capabilities — S1-A14 queued remainder

S1-A14's remaining work is Queued; S3-A2 is the sole Active child. Current source extends MyDataGrid,
CollectionFrame and PageHeader; CAPABILITY_MATRIX/RUNTIME_STATUS in the owning
angular-grid-capabilities feature are authoritative. Phase06 is Not Verified.
Earlier Countries standalone acceptance above is historical: the requester
reopened S3-A2 for the Data/sidebar journey, exact Next appearance and real global
multiple-condition query support.

- PageHeader.variant='collection' reuses shared actions/badges and current Next
  measurements. Mobile separates the count/view badges and keeps an active
  overflow view visible. The view badge renders only when the active view has
  a nonempty label. Export uses a labelled icon trigger below 600px or in
  landscape up to 480px tall. The same trigger opens the Excel and CSV menu.
  Default simple headers remain available.
- MyDataGrid.advancedFilters/filters/filtersChange emit bounded typed native
  AND/OR constraints on Apply/Clear. GridFilterInput reuses shared validated
  fields and tri-state Boolean OptionSelect; no filterCallback during drafting.
  Zero/false survive strict adapters. Remote owners query the full collection;
  the shared component never filters its current remote page locally.
- sortMode/sorts/sortsChange support strict multisort. Coalesced single sort
  captures the exact owner source and discards callbacks after source replacement.
- selectionMode supports multiple/single/radio/current-page range. Grouping
  validates current supplied values and contiguity; frozen rows split the page.
  Details, current-row context actions, CSV and typed scoped presentation state
  have no business HTTP, permission grant or implicit persistence.
- CollectionColumnHeader and CollectionColumnFooter project only cell content,
  retaining the shared header/sort/filter shell. Footer context provides readonly
  current supplied rows, column, query and total; it is absent outside ready.
  headerGroups accepts a bounded hierarchy covering each owner column once,
  generates colspan/rowspan and prunes hidden leaves. Column reorder/management
  and pinning with grouped column headers currently reject explicitly.
- Existing defaults and CardList compatibility remain required. All new captions
  come from canonical core EN/AR and generated SQL-compatible catalog resources.

Virtual ranges, local custom matching, draft editors and row-order owner callbacks
remain Required work in that queued technical feature. These source additions do not mark
the complete matrix, exact appearance, Countries API/host or release Verified.

## Current reusable presentation options — 2026-10-30

- `CollectionFooter`, `CollectionFrame`, `MyDataGrid` and `CardList` expose
  `recordNavigation=false` by default. Known totals use one native PrimeNG
  Paginator. In default page mode it shows page links/report/rows selector.
  Explicit record mode uses the native arrows for a global record index and shows
  exactly one current-record/total report, without page links or a second report.
  Countries Grid/Cards enable record mode per D24. The shared size selector uses
  `templateRight`; the controller retains the actual server page size, active
  record, focus and remote page crossing. Unknown totals retain the existing bounded
  fallback and never fabricate an authoritative count.
- `toolbarLayout='single-row'` keeps shared search, projected domain criteria,
  Reset and Grid options together with internal overflow on compact screens.
  The default remains responsive. Status belongs to the feature's criteria slot.
- `OptionSelect.labelVisibility='sr-only'` omits the visual floating label for
  compact controls while preserving the native Select's full `ariaLabel`.
  Default visible labels and all selection/CVA semantics remain unchanged.
- `RowActions` is a shared presentation component for guarded actions and semantic
  tones. `MyDataGrid.actionDisplay='inline'` and `stickyActions` opt into the same
  presentation at the logical trailing edge. Default menu behavior remains.
  These generic options do not imply Countries mutation handlers are implemented.
- `FormContainer.appearance='dialog'` provides shared field/footer spacing.
  `DialogPanel.showFooter=false` removes an unused native footer when the projected
  shared form owns actions. `manualInitialFocus=true` disables initial automatic
  focus for read dialogs; data-entry validation focus remains shared-form owned.

Latest corrected Countries acceptance is recorded in
`angular-countries-read-workspace/verification/CURRENT_GRID_REVIEW.md`; historical
counts above apply only to their original bounded acceptance.

## Shared command feedback — 2026-10-30

`FeedbackNotifications` is the application-wide command feedback service. Features
pass translation keys, namespace and interpolation parameters, for example
`notices.success('countries.created','reference-countries')` or
`notices.failure('countries.deleteError','reference-countries')`. Success uses the
native PrimeNG Toast; general command errors use `ErrorModalHost` and the existing
shared `DialogPanel`. Identified server field errors remain under shared inputs
through `applyServerFieldErrors`/`FormContainer.revealErrors`, which focuses the
first invalid control after render. Keep invalid Save enabled; pending locks it.

Root lazy feedback hosts load on first queued notice. Success notices remain in a
queue until the native host delivers them, including the first lazy-load message.
The lightweight `shared/ui/feedback/notifications.public-api` entry is permitted
for the root host trigger so importing the service does not eagerly include both
deferred hosts. Regular consumers use the shared UI public API. Do not couple
feature services to PrimeNG `MessageService` or create another local feedback UI.

Toast uses documented position/breakpoints/dt/closeButton Pass Through,5s life,
opaque semantic theme tokens, RTL top-left/LTR top-right and translated close.
Error Modal has safe Close focus, trapped keyboard navigation and restores focus
through shared DialogPanel; it renders known translated messages as text. It does
not expose server stacks or raw HTML. DialogPanel's backward-compatible
`tone='primary'|'danger'` defaults to primary; the error host opts into danger.
MCP validates native Toast/Dialog API usage only; Angular build and actual browser
proof independently verify rendering/lazy delivery/RTL/focus.

`CommandFailure` classifies not-sent/rejected/uncertain outcomes and retains owned
field errors plus syntactically bounded public error `codes`. A feature maps only
known codes to translation keys; never show an arbitrary code/message as UI.
Dispatched network/timeout/5xx/malformed-success outcomes are uncertain and must
not be automatically replayed. Countries lifecycle reuses shared ConfirmationDialog
safe cancel focus/pending guards, MyDataGrid/CardList selection and toolbarContent;
its domain state owns eligibility, IDs and atomic-command callbacks.

`PageHeader.primaryAction` accepts `{label,icon,disabled?}` (default null), with
`primaryActivated` for the guarded domain callback. The shared header switches the
existing native ActionButton to its icon-only appearance below600px, preserving its
accessible label/title, and keeps the text at wider sizes. This follows current
Next `MobileHeaderLayout`/`HeaderActions.iconOnlyAdd` behavior and prevents a
projected full-width Add caption from squeezing the title into individual letters.
The existing projected action slot remains compatible. Generic ActionButton icon
tokens `--action-icon-background`, `--action-icon-color`, `--action-icon-radius`
retain their old transparent/inherit/50% defaults; the primary header action opts
into the existing primary theme and8px radius.

Sticky action headers and cells use the same native FrozenColumn and physical
edge. The reference header's relative-position rule excludes frozen columns so
its translated Actions title remains pinned with the cells during horizontal
scroll. Installed22.1.4 FrozenColumn computes left offsets from previous DOM
siblings even in RTL; the last trailing action cell therefore requires a bounded
shared RTL left=0 correction. This is an evidenced native gap, not a replacement
selection/grid implementation. Actual EN/AR browser assertions compare header/cell
bounds at both scroll extremes and click the selection checkbox without force.
See [PrimeNG Frozen Columns](https://primeng.dev/table) for native edge behavior;
the installed directive source and browser proof establish the RTL offset limit.

## Shared context menu and cell-value filtering — D28

`ContextMenuPanel` (`erp-context-menu`) wraps native PrimeNG ContextMenu for any
shared consumer. Inputs: `actions: readonly ContextMenuAction[]` and accessible
`label`. An action supplies `id`, translated `label`, optional `icon: AppIconName`,
`disabled` and `separator`. Outputs: `activated` ID and `dismissed`; methods
`show(mouseEvent,returnTarget?)` and `hide(restoreFocus=true)`. Duplicate IDs,
disabled/removed commands and separators never activate. Native body append,
keyboard and focus behavior stay native; shared semantic tokens provide opaque
light/dark surfaces, padding and focus state. The documented item template uses
the existing AppIcon set; it never injects icon HTML or adds another icon package.

`MyDataGrid.cellContextFilter=true` enables exact cell-value filtering when
`advancedFilters=true` and the column declares a valid filter. Existing row actions
remain in that same menu with their icons; the built-in filter action uses a separate
ID namespace. Right-click captures the exact source/row/visible column/value and
rejects stale commands after replacement, refresh, dismissal or loss of ready state.
`filtersChange` remains the only owner-facing criteria event; remote pages never
filter locally. Existing native column-filter menus are the keyboard alternative.

`CollectionColumn.filterValue?: (row)=>unknown` supplies a raw typed value when
`value` is formatted for display. Without it, `value(row)` is used. Text/number/
boolean use `equals`, canonical date-only values use `dateIs`, subject to the
declared modes/limits. Zero/false are retained. Null/undefined/blank/invalid/unknown
values have no filter command; no localized string guessing or new null operator.
The selected column's group is replaced, other column groups and toolbar criteria
are preserved. For example Countries maps formatted status to `row.isDeleted`
and its UTC timestamp columns explicitly to their `YYYY-MM-DD` date portion.

Source/contract and bounded acceptance belong to
`angular-grid-capabilities/CELL_CONTEXT_FILTER_CONTRACT.md`. Full Table matrix
remains separately Not Verified under FOLLOW-016; this does not establish complete
pilot/host parity. Current MCP ContextMenu API/command/item-template guidance:
[PrimeNG ContextMenu](https://primeng.dev/contextmenu). Angular/browser checks are
required separately from native metadata validation.

## Shared entry-form counter and footer — D29

TextField keeps `showCounter=false`, `maxLength=null` and
`counterAppearance='inline'` defaults. Existing inline counters remain compatible.
The optional `'badge'` appearance uses the native PrimeNG Badge in a deferred shared
CharacterCountBadge, so screens that do not request it retain their initial bundle.
The visible value is actual input UTF-16 length / declared maximum, matching the
existing field/server length contract. At the limit the badge is warn; over-limit
programmatic values are danger and remain intact for validation. Native maxlength
guides typing; CVA loads/reset/IME and owner validation remain authoritative.
Only a rendered counter is referenced in aria-describedby; its translated
validation.characterCount description states used/maximum. NumericField reuses
TextField's exact template and imports the same deferred badge dependency.

FormContainer's default content projection is already a one-column grid. Project
each field directly for one field per row; do not add a feature-local grid shell.
Use generic `formTools` projection for auxiliary tools such as development-only
mock generation, and existing `formActions` for Cancel. Submit remains owned by the
shared form. Empty tools do not change existing forms. Dialog form footers use an
opaque sticky surface and group tools separately on compact viewports; default
plain/card form behavior is retained. Invalid Save stays enabled and summary/error
focus/unsaved/pending/uncertain behavior stays shared.

Countries supplies its existing validation limits100/100/2/3/10/3, tel keyboard for
phone and Add/Save primary captions/icons. This presentation correction applies to
the shared Add/Edit composition without changing fields, normalization or API.
MCP Badge inputs/tokens were consulted; final runtime verification belongs to
angular-countries-edit-workflow/FORM_LAYOUT_CORRECTION.md and its acceptance proof.

## Shared record feedback and keyboard — D30–D32

MyDataGrid and CardList accept optional `recordRequest: CollectionRecordRequest`.
Provide the public `CollectionRecordFeedback` once per collection page and pass its
`request()` to the active view. After an authoritative successful edit call
`edited(source,id)` before refreshing the existing scoped read; after a successful
archive call `removed(source,rowId,ids)` before the refresh. Features own command
permissions/results and supply IDs; Shared owns active record, focus, navigation
and animation. Rejected or uncertain writes must not publish success requests.

The controller waits for ready data under the captured scope, criteria and page
size. Edit keeps the same visible ID active and requests actual row focus with a
2.4-second themed highlight (1.2 seconds twice, matching current Next). Reduced
motion uses a brief static highlight. A request is consumed once across Grid/Card
replacement; subsequent refresh/view changes cannot replay it. Repeated successful
edits publish new requests, even for the same ID. Stale scope/error/expired requests
are discarded. No all-record fetch, invented rank or forced filter changes: if an
edited ID leaves the current page/criteria, normal active fallback applies.
Moving active focus to another row cancels the old flash immediately; returning
never replays it. In keyboard-visible focus mode, a stationary pointer on an old
unselected row cannot retain a competing hover tint. Exactly one record is active;
explicit bulk checkbox selection remains independent. Shared CSS uses the bounded
table-body :has(tr:focus-visible) rule, following native focus/hover semantics.

Removal targets the global predecessor of the first removed displayed row. The
existing server paging callback crosses a page boundary if necessary. First-row
fallback is the first survivor; an empty collection has no active record. Bulk
checkbox selection remains separate and clears through the existing command/read
lifetime. Restore keeps normal collection behavior. No API/business rules live in
the presentation service.

Click a non-interactive part of a row/card to focus it. Up/Down move to the previous/
next record; horizontal arrows follow LTR/RTL direction. Home/End target the current
page, Ctrl+Home/End the entire known collection, PageUp/PageDown move by one page
and clamp the last partial page. Enter emits the existing View activation. Existing
Space/range selection is retained. Native buttons, links, fields, editable content,
menus and dialogs own their keyboard events; typing/search never invokes record
navigation. Shared focus requests use afterNextRender and scroll the row into view.
DialogPanel's delayed return-focus callback preserves an already focused outside
input or refreshed row when native onHide fires after its leaving animation.
Ordinary available-trigger restoration and the existing nested-dialog barrier remain.

PrimeNG MCP Table accessibility/selection guidance was consulted. Native selection
keys are not a command-result focus/flash or remote active-record paging API. These
bounded additions extend the existing collection controller; they do not introduce
a second grid or paginator. Table controls/checkboxes/filter overlays stay native.
Proof and scope: angular-countries-edit-workflow/FORM_LAYOUT_CORRECTION.md and
verification/FORM_RECORD_ACCEPTANCE.md; full Table matrix remains FOLLOW-016.


## Shared chart composition and collection toolbar — D33

Implemented generic shared charts/public-api, ChartDefinition/ChartMetric,
CollectionChartView, ChartPanel and deferred native PrimeNG ChartRenderer using
exact Chart.js4.6.1. Existing MetricCard, SurfaceCard, CollectionFrame, CardList,
OptionSelect, FeedbackState and ActionButton gained compatible generic options.
SortDirectionButton uses existing native ActionButton and bilingual short/full labels.
Feature owns pure country-chart-data and typed authority/state integration only.
Architecture rejects feature chart.js/PrimeNG imports; renderer is absent from eager
root exports. Native features first; outside pie labels use one bounded shared
plugin because current native metadata has no equivalent property.

P-001 Countries collection with embedded Chart; current Next Chart source is the
reviewed baseline. Verified same four plot semantics/order, summary metrics,
font/title16px/600, theme palette, source captions and
contained responsive scroll. Native PrimeNG Chart/Chart.js replaces Recharts; tick
placement, bar sizing and pie geometry follow that engine and are not certified as
pixel-identical plot internals. Full five-view visual acceptance remains S3-A8.
Requester D33 explicitly removes Chart toolbar/header Filter and scope paragraph;
Chart inherits Grid/Cards criteria and resets page1. Cards retains one shared
single-row toolbar/toggle, short accessible arrow+Asc/Desc, Search max400px and
Sort By220px. Narrow viewports scroll the toolbar internally. No feature-local shell.

Chart presentation refinement2026-11-08: CollectionChartView scrolls metrics and
plots together, using two/four metric columns at 42rem and one/two plot columns
at 50rem of panel width. Rows are 340px, or 320px below 22rem, with 16px gaps.
SurfaceCard chart appearance uses a 16px inset, 12px radius, theme border and
subtle shadow. Headings use the foreground color and remain separated from the
plot by a visible divider. This requester-approved Angular presentation updates
the earlier Next visual baseline. Native datasets, captions and accessible table
alternatives keep their existing contracts. Browser layout verification is
`verify-country-charts-browser.mjs --layout`.
MetricCard exposes generic value-size, label-transform and label-spacing CSS
properties. Chart summaries use 28px tabular values and sentence-case labels.
The chart content reserves logical-end padding for the shared scrollbar.

Public capability entry: shared/ui/charts/public-api.ts. ChartDefinition owns generic
labels/series/kind/palette/legend/sliceLabels/numberLocale; ChartMetric owns summary
presentation. Feature code must not import Chart.js or PrimeNG. ChartPanel validates
finite aligned bounded values and supplies semantic table alternatives; deferred
renderer owns theme/locale/reduced-motion/native lifetime. SurfaceCard appearance=chart,
MetricCard appearance=raised and FeedbackState compact/icon preserve existing defaults.
CollectionFrame appearance=plain/showFooter=false supports a chart workspace without
duplicating a frame/footer. CollectionChartView may optionally use existing toolbar
projection; Countries explicitly disables it.

CardList passes toolbarVisible/toolbarLayout/searchMaxWidth to CollectionFrame.
single-row projection styles reach the actual nested toolbarFilters content; do not
add a feature-local toolbar to fix projection. OptionSelect controlWidth fixes native
fluid width only when configured. SortDirectionButton is controlled asc/desc, exposes
full accessible captions through ActionButton.accessibleLabel and emits owner changes.
Default collection/field/button behavior remains compatible. Verify actual responsive
control bounds and API/lifetime behavior, not just generated metadata. Durable S3-A5
proof is registered in the chart manifest; full Table capabilities remain FOLLOW-016.


## Shared embedded Report composition — S3-A6

Countries consumes GlobalReportView and globalReportAllowed through Reporting's
public API, lazy inside the existing collection workspace. Exact Countries:View
workspace authority and super_admin + GlobalCrystalReports:View gate visible/direct
Report entry; current read-only actors may render. Losing authority destroys the
embedded report and falls back to Grid. Header Refresh reloads report catalog/source
and regenerates; other views keep existing refresh. Header Filter controls report
criteria without discarding form/selection or rerendering. No nested PageHeader.
Reporting keeps existing catalog/service/PDF validation/cancellation. Applied filters
and selected report now belong to the immutable actor; replacement clears them and
draft fields. Explicit reload regenerates even if source/hash is unchanged. Shared
ReportWorkspace reference appearance uses280px sidebar/gap64 and contained scrolling;
FormContainer sidebar appearance keeps Search/Reset full width in DOM order; PdfViewer fill mode
retains safe open/download, capability fallback, lease cleanup and finite inline area.
Existing standalone report defaults remain compatible; no new package or translation key.

ReportWorkspace appearance=reference is opt-in, maintains finite height/min-height0,
280px desktop criteria and compact stacked rows, using existing ScrollViewport.
FormContainer appearance=sidebar provides field gaps16 and full-width footer
layout (Search before Reset in DOM and visually), keeping shared errors/summary/focus.
PdfViewer fill=true uses remaining flex space; safe native Open/Download are always
available even without navigator.pdfViewerEnabled. Default layouts remain unchanged.
No feature-local form/PDF/scroll shell. Use Reporting public API for owner integration;
Shared has no report entity/auth/HTTP rules. Durable S3-A6 proof owns metadata limits.

## S3-A8 live collection compatibility

MyDataGrid uses PrimeNG rowTrackBy with its existing typed row key to preserve same-ID DOM/focus across fresh snapshots. Shared empty/loading/error/forbidden feedback stays inside the visible horizontal viewport using container width/logical sticky CSS; no feature wrapper. PrimeNG MCP accepts the Table binding; actual browser EN/AR390/1440 asserts feedback visibility and row/focus retention. createScopedRead adds explicit pending/refreshInBackground without changing initial/manual/identity-loading semantics; errors remain explicit. Full contract and consumer example: ANGULAR_REALTIME.md.

## Shared improvements apply generally

Requester2026-10-31: reusable presentation/behavior must apply to every applicable current and future consumer. Extend the global theme/owning shared component, never a Countries-only workaround. Application scrolling now follows ANGULAR_SCROLLING.md: one SCSS token policy, automatic root/overflow styling, existing PrimeNG ScrollViewport consumes the same values. All five palettes, EN/AR/RTL, horizontal/vertical, dialogs/lists/fields use it without per-feature opt-in. Domain-specific exceptions require a domain reason; generic improvements remain shared.

## Native PDF theme policy — 2026-11-04

Shared PdfViewer retains its native iframe and original Blob Open/Download. Its
application toolbar uses shared surface/foreground/border/radius tokens in both
standalone and fill modes. The frame background uses muted and inherits root
color-scheme. Native PDF chrome remains browser-owned: Edge may remain light,
Chrome may show dark chrome; no CSS filters or PDF inversion are permitted.
Open PDF opens the original document in a new tab for browser printing; no automatic
print dialog is promised. No renderer dependency or theme-triggered iframe reload.
Native capability fallback and URL cleanup remain intact.8isolated production
browser cases and the522test full Angular gate pass. Registered evidence lives at
reporting/global-crystal-template-manager/verification/pdf-viewer-theme/.


## Shared document actions, tabs and pagination — 2026-11-04

PdfViewer.actionsTemplate exposes its existing safe Open/Download links using the
single owned resource; showActions defaults true and actionsLayout defaults inline.
Header action maintenance2026-11-08: `actionsLayout="toolbar"` removes the inner
action shell and uses compact links, with text hidden below1200px while translated
accessible names/titles remain. Coarse pointers retain44px targets. GlobalReportView
exposes `headerActions` for its current PDF only; embedding pages opt into
`externalActions` and project that template into their existing PageHeader. The
standalone viewer uses its own header. Countries, States, Districts and the
composition-connected System Error Logs use this contract. PdfViewer remains the
sole Blob URL owner; never rebuild links from API URLs or create a second lease.
Filter visibility/tab/theme changes retain the mounted iframe and URL; replacement,
failure, identity changes and teardown withdraw stale links through existing state.
RPT source download/upload remain permission-controlled sidebar operations.
Hide the Search/Options tab strip when the relocated PDF actions leave no source
operations for the current actor. Keep the criteria form directly visible; a
granted RPT download/upload action restores the options panel.
ReportWorkspace reference layout uses a260px sidebar and16px gap. Below54rem of
actual workspace width, criteria and document share bounded rows with a12px gap
and the existing criteria scroll viewport. Standalone and embedded report pages
use the shared fill shell; no additional outer page scroll. This supersedes the
older280px/gap64 presentation described in historical acceptance below.
PrimeNG MCP validates Button directive inputs; native anchor href/target/rel/title/
download attributes are outside that generated component metadata. Angular and
browser checks verify the complete links, including bytes and resource cleanup.
ReportWorkspace optionally projects reportActions into its sidebar and uses labelled
Search/Options tabs when optionsLabel is supplied. ContentTabs.keepAlive defaults
false; opt in for forms that must remain mounted. Validation can select the relevant
panel before focus. ContentTabs uses PrimeNG active tab border tokens instead of
the separately measured bar, covering RTL, translated labels and font loading.

Global Report Manager reuses Countries' existing MyDataGrid.recordNavigation=true
in all three grids. CollectionFooter is unchanged; no new pagination styling or
component was added. Existing record count/navigation, page count, size selection,
RTL and compact layout are inherited directly from the shared implementation.
Evidence and exact APIs: global-crystal-template-manager web section35 and
verification/sidebar-actions/. PrimeNG22.1.4; no vendor patch or extra dependency.

## Shared column-filter choices — 2026-11-04

GridColumnFilter.choices optionally supplies translated labels with stable string
wire values for text filters restricted to equals/notEquals. Shared GridFilterInput
uses the existing OptionSelect, All emits null, and typed contract validation
rejects duplicate/blank/oversized/unlisted choices. Other fields retain their
existing inputs and menus. Owners provide choices and server predicates; shared UI
never filters a single remote page locally. Main Global Report Manager is the
verified consumer: section36 and verification/column-filters/. No new component.

## Report search sidebar and icons — 2026-11-04

FormContainer sidebar renders its single submit fragment before secondary actions,
matching DOM/keyboard and visual order. Other appearances retain their placement.
ReportWorkspace document-actions owns generic12px grid spacing; use wrapper-free
reportActions projection for multiple actions. GlobalReportView uses the same
sidebar form in both modes and places report selection before criteria. Shared
AppIcon adds download/openInNew/language; PdfViewer consumes icons inside its
original anchors. ActionButton/formSubmitIcon stay the only button projection API.
No new components. Verified sources,16browser cases and full531test Angular gate:
global-crystal-template-manager section37/verification/search-sidebar-layout/.

## Manager action and metadata composition — 2026-11-04

MyDataGrid toolbarContent owns actions; toolbarFilters owns criteria. Use wrapper-free
ng-container projection so existing collection-actions gap/wrapping reaches buttons.
SurfaceCard contentLayout=details opts into a responsive RecordSummary grid and a
wrapping footer through the existing footerTemplate API. Default cards retain their
layout. Existing formTools is for auxiliary Inspect; formActions and formSubmitIcon
provide Cancel/Save. AppIcon adds reusable upload/save SVGs. Manager531test and6case
production-fixture browser proof lives in global-crystal-template-manager section38.

## Shared ActionButtonGroup — 2026-11-04

ActionButtonGroup (erp-button-group) wraps PrimeNG ButtonGroup for existing shared
ActionButton children. Supply a translated label; features retain callbacks,
authority and pending state. The adapter owns logical joined edges across
erp-button wrapper hosts and vertical full-width grouping under 600px. Reuse it
for related actions; keep unrelated actions outside. No custom interaction or
button replacement. Existing MyDataGrid toolbarContent and SurfaceCard footerTemplate
own placement. Verified in global-crystal-template-manager section39: 532 Angular
tests and six EN/AR production-fixture browser cases including RTL joined edges.


## Component composition maintenance — D41

Shared AppearancePreferences composes existing OptionSelect/ActionButton with controlled typed language/mode inputs and events. AuthLayout/MainShell retain preference writes. CollectionOptionsDialog is internal to CollectionFrame; createGridPresentation is internal per-grid state. MyDataGrid public API remains stable. Countries card header/content, read-detail dialog and lifecycle confirmation remain feature-owned; page-scoped providers remain at the page. GlobalReportView uses external template/styles.

The reusable policy, extraction decisions, CSS/projection/provider boundaries, source examples and regression requirements are in [Angular component composition](ANGULAR_COMPONENT_COMPOSITION.md). Current evidence: [D41 report](../../../modules/platform/features/angular-collection-foundation/COMPONENT_COMPOSITION_REPORT.md).

## Small form components and tab focus — 2026-11-06

FormContainer owns a nearest-form field registry. Shared FormFieldControl instances
register through Angular DI, including fields inside child-component views, and
unregister on destruction. Registration follows DOM order and is isolated between
form containers. Feature field groups inject their page-scoped editor state; they
do not create another form, error store, submission handler or shared field copy.

Assign `formSection="identity"` (or another stable feature section ID) to a child
component or group. Handle FormContainer.sectionFocusRequested by selecting the
corresponding tab. FormContainer then focuses the registered field after rendering.
Use ContentTabs.keepAlive for forms whose inactive panels must retain controls and
drafts. The same section/focus contract handles invalid submit, server field errors
and validation-summary links. Non-section fields retain direct focus; legacy
Reactive Forms remain an explicit compatibility boundary.

FormFieldControl is the public extension contract for a domain-specific value field
that cannot be expressed with existing shared controls. The Tenant entitlement
picker is one such aggregate field: it composes shared BooleanField inputs and
inherits the existing label/error/touch/focus lifecycle. Do not build a field-schema
renderer or Form Engine. The optional shared `forms/_field-layout.scss` mixin owns
recurring field-group spacing; feature components supply only their domain layout.

MetricCard.compact adapts to its own container width. At widths up to12rem, the
label occupies a full row above the icon/value so ordinary words remain readable
inside narrow entity cards. Wider Import statistics keep their existing inline
layout. This policy belongs to MetricCard rather than a Tenant-only CSS override.
PrimeNG MCP Styled Mode and Card metadata were consulted; Card supplies no metric
layout policy. The change uses existing application CSS/tokens and introduces no
vendor selector override or dependency. Metadata validation of the supplied markup
does not validate CSS or the custom MetricCard; browser checks own that evidence.

FormContainer.appearance=`page` is the routed-form container. It retains the
borderless shared form surface while using the existing spaced persistent action
footer from dialog forms. It does not alter plain/sidebar consumers. Compose it
with PageHeader/SurfaceCard and an owner-supplied summary when a full page is
required by C-01. Keep the same form tree, field groups, validation focus and
submission owner when adapting a dialog to a page. Add an explicit route
canDeactivate unsaved guard and use current authority at direct-link entry.

## Viewport workspaces and consistent back navigation — 2026-11-06

PageHeader.appearance=`card` is the generic title-card surface for form/workflow
pages. PageHeader.backLabel/backDisabled/backRequested place the shared BackButton
before the h1, with an accessible translated name and logical RTL arrow direction.
LauncherGrid exposes the same back-label/event pattern and uses that shared button.
Features own the destination; shared presentation never calls history.back or the
router. Do not add a separate text Back action after the title.

Primary form/collection pages have no outer page scrollbar. Route presentation
data `workspaceLayout: 'fill'` and optional `workspaceDensity: 'compact'` are read
generically by Shell/ApplicationFrame. FormContainer.fillContent reserves the
footer and scrolls its own body through ScrollViewport. Draft summaries remain
available through PopoverPanel on compact screens. The shared collection-page
Sass shell keeps Countries and Tenant Management header insets/gaps identical;
States/Districts/Tenant Admins inherit it. See ANGULAR_SCROLLING.md for the browser
acceptance rules; do not clip overflow as a substitute for reachable content.

BooleanField.density=`compact` reduces label/padding while keeping44px control
height. The Tenant module/area picker composes that option and tighter domain
layout spacing; controls retain the shared field lifecycle and keyboard behavior.

## Allowlisted collection presentation preference (S4-A4 foundation)

`shared/data/public-api` exports `createViewPreference`. Owners supply an Angular-
namespaced key, a safe default and their current typed view allowlist. It stores
only the presentation string, tolerates unavailable storage/SSR, synchronizes
same-key browser events and unregisters listeners with the owning injector.
Application data, filters, diagnostics, credentials and form drafts never belong
in this helper. Only its exact implementation path may access localStorage;
other owners and sessionStorage remain rejected by the architecture checker.

Always pass `canSynchronize` when a view transition can unmount an editor. Check
registered UnsavedChanges dirty/busy, local active editor and lifecycle/pending
state. Incoming storage events do not obtain discard consent. Explicit feature
transitions retain the normal shared consent and post-await actor/stamp checks.
Keep view-dependent collection work (selection, Chart page1) in the feature owner,
including restored/synchronized transitions. Reuse typed PageViewOption<T> to
construct allowlists without unchecked casts.

Tenant Management, Countries, States and Districts use this owner now. Scoped
unit14/2files and fixture-browser16EN/AR390/1440 cases prove their restore,
synchronization and unavailable-value fallback; wide cases include actual SPA
route departure/back. Independent source review has no P1/P2. Error Logs consumer
and full S4-A4 acceptance remain Required under FOLLOW-027; this foundation is not
acceptance of either new screen.


Administration navigation2026-11-06: application composition groups existing audit/operational/error/settings entries below the translated Administration parent. Shared NavigationList retains nested rendering/filtering/keyboard behavior. Tenant management and Global Geography keep their current hierarchy. Global Report Manager remains standalone after the requester reversed its proposed move. Current acceptance907tests/177files,8ErrorLogs navigation cases and24geography cases; portable S4-A4 receipt registers the source. Future entries require real authorized workflows.

## Account consumer additions — 2026-11-07

`ContentTabs.commitMode` defaults to `immediate`. A page requiring asynchronous
discard consent uses `external`, supplies the committed `selected` value and
handles `selectionRequested`. The adapter restores PrimeNG's public `value` model
while the decision is pending; only an owner-approved value activates another
panel. Never implement this with a feature-local tabs copy or allow a visual
transition before consent. `keepAlive` controls mounting independently; it does
not authorize a tab transition. Unit and production-asset browser evidence is
registered under `angular-account-profile`.

`FileField.dropzone` defaults to false, preserving existing basic pickers.
Opting in uses PrimeNG FileUpload's advanced mode and `dropLabel` for a translated
prompt. Both modes remain single-file, nonautomatic and custom-upload only;
the service owns persistence. No URL/credentials/business-specific validation is
embedded in this shared adapter. Existing read-only/disabled/clear/field-error
contracts apply. A consumer validates its domain file rules and provides explicit
Save/Undo actions. The native file dialog remains an accessible alternative to
dragging.

PrimeNG MCP FileUpload and Tabs metadata/examples were consulted. Final generated
API usage validation accepted both components. Tabs metadata does not enumerate
the Angular model's generated output separately; the routed controlled example,
installed22.1.4 public model and Angular/browser checks establish that behavior.
See [FileUpload](https://primeng.dev/fileupload) and [Tabs](https://primeng.dev/tabs).
MCP acceptance covers API metadata only, not compilation, geometry or consent.

## All-filtered collection export

Collection pages bind `PageHeader.exportSource` to the feature state's typed
`TabularExportSource`. The header owns one `CollectionExportMenu` for Excel and
CSV, independent of the current Grid or Cards view. Do not create a feature-local
export button, workbook encoder, second collection toolbar or current-page export
handler. The shared menu reuses `ActionMenuButton` and shared feedback.

The feature state captures its verified actor, locale, immutable filter/order
identity and explicit scalar columns. Use `pagedTabularSource` for known totals,
`collectExportCursor` for cursor APIs and `localTabularSource` only when the owner
has already loaded the complete collection. Data-page requests remain in the
owning service. Exclude paging from `criteriaKey`; retain every applied filter,
sort and archived-state criterion. A page change alone does not cancel export.
Provide stable row IDs and an `isCurrent` predicate that includes source access.
Never derive a server-wide export from the rendered Grid rows or selection.

Shared orchestration is `createCollectionExport`; formatting is supplied through
`TABULAR_FILE_WRITER`. Application composition binds that port to Reporting's
`TabularFileService`. Shared code must not import Reporting or Platform. The
formatter service chooses the verified tenant/global contract and owns HTTPS,
credentials, CSRF, response checks and file generation. The API does not fetch
business rows and cannot grant source access. A global actor needs the independent
`GlobalDataExports:Export` permission in addition to the source View permission;
System Error Logs also retains its dedicated Export grant and5000row limit.

The general envelope is100000rows,200columns,2000000cells and8MiBof request
data. Domain limits can be smaller. Empty results, count drift, duplicate IDs,
cursor loops and limit overflow fail explicitly without a truncated download.
The APIs do not supply a cross-request atomic database snapshot. Capture explicit
allowlisted fields, exclude actions/selection/diagnostic secrets, and disambiguate
duplicate translated headers. Do not export arbitrary DTO properties.

Actor, permissions, applied criteria, locale or owner destruction cancels the
operation and suppresses stale file downloads and feedback. Keep an explicit
Cancel action while preparing. Never reset visible collection paging, selected
rows or business drafts as a side effect. No automatic retry after denial or
failure. Each future collection consumer must verify its actual filters and
all-page results, both file formats, any supported views, cancellation and denial
at EN/AR390/900/1440, including900x640 and both themes. Browser fixtures must parse
the actual API-generated files and compare their rows, not merely count clicks.

Canonical source and evidence belong to
`documentation/modules/platform/features/angular-collection-export/`. Hosted
rollout is independently tracked by PROD-032.

## SignalR token lifecycle

`RealtimeEvents` receives a short-lived token from the authenticated
`BrowserAuthService`; it must never persist, log or place that token in application
state. The SignalR connector may put it in the transport URL because that is the
vendor transport contract, but the client must renew it before `exp`, stop the
old connection, clear its expiry timer and create a fresh connection. A closed
connection must not be restarted with the same connection object or stale token.

Chromium can report a failed WebSocket/SSE handshake as CORS when an upstream
IIS rejection does not carry the managed API's CORS headers. Do not infer token
expiry by comparing its exp to the time a pasted log is read. Inspect the actual
HTTP result, query size, fresh-token transport behavior and hosting limits first.
The2026-11-07 hosted404was reproduced at the IIS2048/2049query boundary while fresh
tokens were valid. ERP's published web.config now allows a bounded24576query/URL
envelope only for hubs/company; ordinary API query limits remain inherited.
Exact origin/Credentials CORS remains
required for negotiate and authorized API requests; hub access uses its dedicated
bearer token and does not fall back to the browser auth Cookie.

Keep the renewal margin bounded (currently10seconds), parse only the untrusted
JWT payload for scheduling, and treat malformed/opaque tokens as normal reconnect
inputs. A401/403 from the token endpoint or hub remains a denial and ends the
lease; it must not trigger an endless replacement of an otherwise valid session.
Unit coverage must include expiry renewal, fresh token acquisition, closed-lease
cleanup, denial and actor replacement. Do not print the SignalR URL or token in
diagnostics. Production origin/proxy/real reconnect acceptance remains PROD-003.

Source and actual local IIS proof:
`documentation/modules/reporting/features/global-crystal-template-manager/RUNTIME_KEY_REPAIR_2026-11-07.md`.
The native SignalR client still chooses/falls back between supported transports;
do not globally force LongPolling to conceal an IIS or WebSocket-hosting failure.
