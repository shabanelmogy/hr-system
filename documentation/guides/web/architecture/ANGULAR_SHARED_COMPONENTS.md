# Angular shared components

Current source: web-angular/src/app/shared/ui. Ownership is generic presentation,
field/control integration and form behavior. Business rules, permissions, API
services and feature validators stay with their feature. Platform localization and
the single theme adapter remain their existing owners.

## Current structure

```text
shared/ui/
  public-api.ts
  buttons/
    public-api.ts
    action-button.ts
    action-button.scss
    action-button.spec.ts
  forms/
    public-api.ts
    form-container.ts
    form-container.scss
    form-container.spec.ts
    form-errors.ts
    fields/
      text-field.ts
      text-field.scss
```

Feature/dev consumers import from shared/ui/public-api. Internal shared owners can
compose the narrower sibling public API. Do not use export-star barrels or expose
tests. Tests/styles stay beside their implementation. Folder names describe
responsibilities, not a generic components/services/utils collection. Future
dialogs/feedback/layout/collections get a folder only when an authorized reusable
implementation exists; do not scaffold empty trees.

## Existing components

| Public API | Generic responsibility | Caller responsibility |
| --- | --- | --- |
| ActionButton | Native button type, busy/disabled/selected state, focus, translated label, full-width | Domain callback, permission, actual operation pending |
| TextField | Text/email/password CVA, label/help/error IDs, clear/reveal, readonly/disabled, IME and zoneless control updates | Typed control, validators and translated error messages, required label marker, autocomplete policy |
| FormContainer | Projected header/content/footer, native noValidate, touched errors and summary links, first invalid rendered focus, pending/read-only submit guard | Typed form, feature title/action/feedback, save pending and actual authorized submit |
| applyServerFieldErrors | Exact nested dot/index field matching, preserve client errors, return unknown paths | API-specific error parsing and unmatched form feedback |
| clearServerFieldError | Remove only server error without discarding other validator errors | No business conflict/forced replay decision |

All data-entry validation belongs to typed Angular Reactive Forms, as decided in
ANGULAR_ARCHITECTURE section 5. React-specific react-hook-form/zodResolver rules
describe the retained Next client. Do not add a second validation engine to the
Angular field. required is an accessible visual marker, not an implicit validator.
For numeric/date/select/structured data, wait for the proper shared adapter;
TextField deliberately accepts text/email/password only.

## Form composition contract

Bind the feature's typed control using [formControl] on erp-text-field. The caller
supplies translated label/help/messages and keeps the primary submit available
while invalid. FormContainer marks touched, shows field messages and error-summary
links and focuses the first rendered invalid field on submit. Inputs carry
aria-required/invalid/describedby; native constraint validation is disabled.

Content is projected into the shared form. Optional formHeader and formActions
slots add genuinely feature-specific content. FormContainer owns the primary
submit ActionButton. It does not own a Dialog, navigate away, call a business API,
inspect permissions or make a discard decision. readOnly blocks submission;
readOnly must also be passed to fields where text must be inspectable without edit.
The caller owns actual pending-save state and supplies it immediately on validSubmit.
The shared form guards the render interval before that input arrives.

Server messages identified by a field path go through applyServerFieldErrors.
Unknown paths return to the caller for visible feedback; do not silently swallow
them or turn a domain conflict into a field validator. A local edit removes that
control's server message only. Successful save/reset remains caller-owned.

Angular Reactive Form mutations do not automatically notify zoneless views.
TextField observes its bound control events and notifies Angular; FormContainer
observes form events for summary/state. A caller replacing a FormControl or dynamic
control tree must notify its own template (signal/observable/markForCheck), so the
new control binding reaches the shared field. This is not a duplicate value store.
Tests verify natural scheduled rendering without fixture.detectChanges.

## Boundaries and remaining acceptance

P-015 public authentication uses the reviewed current Next Login/AuthLayout visual
baseline. Shared form/field/button may gain generic plain/floating/icon/projected
slots needed by the actual consumer; the login page never recreates their lifecycle.

check:architecture uses the TypeScript AST to reject raw PrimeNG imports,
aliases/dynamic/re-export bypasses, inline raw form/input templates and imports of
shared internal files from feature code. It has six focused regression cases.
Inline template tag checks are a bounded policy scan, not a full external-template
architecture proof. Extend it with tests as real feature templates are introduced.

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
  overflow view visible. Default simple headers remain available.
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
font/title16px/600, card padding8px/radius16px, theme palette, source captions and
contained responsive scroll. Native PrimeNG Chart/Chart.js replaces Recharts; tick
placement, bar sizing and pie geometry follow that engine and are not certified as
pixel-identical plot internals. Full five-view visual acceptance remains S3-A8.
Requester D33 explicitly removes Chart toolbar/header Filter and scope paragraph;
Chart inherits Grid/Cards criteria and resets page1. Cards retains one shared
single-row toolbar/toggle, short accessible arrow+Asc/Desc, Search max400px and
Sort By220px. Narrow viewports scroll the toolbar internally. No feature-local shell.

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
FormContainer sidebar appearance keeps Search/Reset full width; PdfViewer fill mode
retains safe open/download, capability fallback, lease cleanup and finite inline area.
Existing standalone report defaults remain compatible; no new package or translation key.

ReportWorkspace appearance=reference is opt-in, maintains finite height/min-height0,
280px desktop criteria and compact stacked rows, using existing ScrollViewport.
FormContainer appearance=sidebar provides field gaps16 and full-width reversed DOM
footer layout (Search visually before Reset), keeping shared errors/summary/focus.
PdfViewer fill=true uses remaining flex space; safe native Open/Download are always
available even without navigator.pdfViewerEnabled. Default layouts remain unchanged.
No feature-local form/PDF/scroll shell. Use Reporting public API for owner integration;
Shared has no report entity/auth/HTTP rules. Durable S3-A6 proof owns metadata limits.
