# Shared collection search layout — 2026-11-08

## 1. Authorized change and verified cause

The requester reported overlapping States search/filter controls and supplied
Grid/Cards screenshots at 676×823. Requested compact widths, a moderately wider
query, equal heights, more Country width, and no Chart search toolbar.

The old one-row threshold assumed a small filter set. States/Districts have
three/four projected selectors plus reset/sort commands. More importantly,
CollectionFrame assigned the forced `single-row-toolbar` class to adaptive
structured search as well. Its no-wrap/minimum-width selectors overrode the
adaptive policy after Angular emulated scoping. A failing browser receipt proves
query/Status/Country and Districts/Reset overlap at 900px. An intermediate receipt
also records computed flex-wrap:nowrap despite requesting adaptive layout.

This is an existing-feature presentation correction. It adds no business field,
API, permission, persistence, Next or native workflow.

## 2. Shared contract and ownership

- CollectionFrame.adaptiveSearchEnabled defines one mutually exclusive mode.
  Structured adaptive search never receives forced-single-row styles. A shared
  component regression checks both modes. Simple-search compatibility remains.
- Structured fields wrap by actual available width and intrinsic group needs;
  there is no 46rem/54rem guarantee that assumes a fixed number of domain filters.
- Plain filter-region/toolbarFilters/toolbarContent wrappers use display:contents inside this
  mode so the shared flex layout positions projected controls individually.
  Empty nested action wrappers must not leave a flex gap at the row edge. Existing criteria components are presentation-transparent. Labels/controls keep
  their native associations and semantics; semantic groups must not be flattened.
- Structured search always starts as two logical rows at every width: search
  field/operator/query first; projected domain filters and actions second. Do not
  attempt a single combined row, wait for a breakpoint, or squeeze controls to fit.
  On very narrow panels either logical row may wrap to preserve readable controls.
- From 56rem, field/operator widths are 144/160px and query minimum 240px. Below that,
  keep 112/128px and 200px query minimum. The search group always fills its row,
  with no maximum-width cap. At 34rem or less selectors share a row and query uses
  the next full row. Drafts/server criteria are not reset.
- Projected selects use 144px basis/minimum from 56rem, 112px below, without a maximum-width cap. OptionSelect's existing
  controlWidth is honored through a generic preferred-width variable. States
  Country uses 168px for its content; no feature-specific layout CSS is added.
  At every container width, projected selectors use flex-grow to fill available
  row space, including rows shared with actions. When controls no longer fit comfortably, wrap instead of reducing their content. Wrapped rows fill just
  like a single row. The preferred Country basis remains; controls need not have
  identical widths. No mobile-only maximum-width exception. Action-only rows
  keep Reset/options at logical end; filters share rows with commands without
  a separate empty action-wrapper spacer.
- Every search/filter/action outline is 44px. TextField keeps its 42px input inside
  a 44px border. OptionSelect supports inherited --option-control-height with its
  existing controlHeight fallback outside collection density. Shell dropdowns and
  ordinary forms retain their own controls. Button horizontal padding is 10px.
- Floating labels, short-window scrolling, collapse, clear, Grid Options, RTL,
  theme and keyboard owners remain shared. At 56rem, text/labels are 14/12px;
  at 34rem labels remain associated but visually hidden. Below the same boundary,
  adaptive search placeholders use 12px through TextField's generic
  --field-placeholder-font-size variable. Entered text retains its existing size;
  ordinary forms keep their inherited placeholder font. Do not shrink hit areas.

The all-width row-fill/compact-placeholder follow-up is an authorized presentation extension
of this same contract. It adds 555×823 and computed placeholder/full-row geometry
assertions to the existing shared browser acceptance. Final receipts are retained
separately from the original 384-case evidence.

Final requester decision: use two logical rows from the outset, including wide
desktop. This supersedes both the former single-row thresholds and the temporary
80rem two-row trigger. Each logical row uses its available width. Compact-only
placeholder typography remains a separate rule; it does not control row layout.

## 3. Chart consistency

CollectionChartView defaults toolbarVisible=false; a reviewed independent chart
workflow may explicitly opt in. States/Districts inherit the default, remove
unused chart search models/projected criteria and hide the PageHeader filter
button in Chart. Countries already follows that policy. Switching back restores
its existing collection toolbar and criteria; no dataset or analytics semantics
are changed. Charts still describe the loaded-page scope truthfully.

## 4. Verification

Verified browser evidence is retained in
[verification/shared-search-2026-11-08](verification/shared-search-2026-11-08).

- Sixteen EN/AR × Light/Dark ×4 collection contexts (Countries, States,
 Districts, Tenant Management), with 384 Grid/Cards viewport/navigation layouts.
 Widths 390/571/676/690/800/900/1012/1440 and 844×390 landscape; desktop widths
 also exercise expanded navigation. Every measured control is inside its toolbar,
 with no control intersection or horizontal page overflow.
- The three structured geography consumers additionally verify 44px outlines for
 all selectors, query wrappers, Reset/direction and Grid Options controls. Tenant
 simple-search compatibility keeps its existing sizing and passes the same
 overlap/bounds checks. The generic test accepts both search shapes explicitly.
- Each geography context checks Chart has no collection toolbar and no header
 filter toggle, then returns to Grid and verifies its collection toolbar remains.
 These checks cover 12 chart transitions; they do not invent whole-dataset analytics.
- Final screenshots include both 676px States Grid and Cards from the reported
 issue, compact AR/Dark and open-navigation compact-height cases. The before
 receipts prove overlap and the competing no-wrap mode, not a production claim.
- Shared regressions verify adaptive/forced-single-row modes are exclusive and
 Chart toolbar defaults off but supports an explicit opt-in. Countries' older
 test assertion that required single-row CSS was updated to assert the new
 adaptive contract while preserving toggle state and sort behavior.
- Final `npm run check` passes: format, typed/template lint, 4 config tests,
 33 architecture/dependency tests, catalog/tokens/fonts, app/spec type-check,
 196 test files/1003 tests and production build. The unit suite includes the new
 mutually exclusive search-mode regression. One earlier Countries test required
 the old single-row class and was corrected to the approved adaptive contract.
- PrimeNG Select metadata validation returns zero issues for the final supported
 properties and variable-height fallback; this does not replace browser evidence.
- Unchanged warning/error budgets: initial 585.51kB, PageHeader 7.05kB and
 CollectionFrame 6.17kB still warn (FOLLOW-019). collection-search no longer emits
 a style-budget warning in this final build. No budget was raised.

Browsers serve an actual development build with intercepted API fixtures. No
hosted business writes, native/Next acceptance or live Crystal runtime assertion.

## 5. Final two-row, row-fill and placeholder acceptance

Subsequent approved compact refinement: Districts alone now opts into the shared
[compact Status companion](../angular-districts-workspace/DISTRICTS_COMPACT_STATUS_2026-11-08.md).
That current receipt supersedes the all-filters-below-query assertion for its
Status control through 34rem only; the default two-row contract remains in force
for other filters, wider layouts and consumers without the opt-in attribute.

The requester ultimately requires two logical rows from the outset at all widths.
The temporary 80rem trigger is removed. Runtime and the three shared guides now
agree: full-width search row, full-width criteria/actions row; additional wrapping
only to retain readable content. Command-only rows align at logical end. Plain
projection wrappers are transparent, avoiding an empty flex gap at the row edge.

[Current final receipts](verification/two-row-search-2026-11-08) contain 16 EN/AR
and Light/Dark contexts across four collections, with 480 Grid/Cards viewport and
navigation measurements. These include 555x823 and 1332x823, plus open/collapsed
navigation at desktop widths. Checks prove search is above criteria at every
width, rows with projected selectors span the full toolbar, no overlap/horizontal
page overflow, 44px structured controls and 12px compact placeholders. The suite
also preserves simple-search compatibility and Chart toolbar behavior.

The final standalone [Angular full gate](verification/two-row-search-2026-11-08/angular-check.txt)
passes formatting, typed lint, 4 configuration tests, 33 architecture/dependency
tests, type checks, 1003 tests in 196 files and production build. Earlier
intermittent 5000ms composition-test timeouts remain tracked as FOLLOW-031;
this passing run does not establish their root cause or close that note.
The final build still warns for initial bundle 585.51kB, PageHeader 7.05kB,
CollectionFrame 6.17kB and collection-search 4.29kB (FOLLOW-019); no budget was
raised. These final measurements supersede section 4's earlier style result.

Requests are intercepted; no hosted writes or physical-device acceptance. InputText's
generated metadata does not cover native HTML value/placeholder/disabled/readOnly
properties. Directive-only validation passes; Angular/browser gates own those
native properties and the placeholder pseudo-element.

Primary references: [PrimeNG Select](https://primeng.dev/select),
[CSS minimum sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/min-width),
[CSS intrinsic sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/min-content),
[display/contents](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/display),
[Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

## 6. Persistent Grid commands when filters collapse

States and Districts follow Countries with Grid and Cards search collapsed on
entry. The header filter toggle controls the shared `search` input and projected
`toolbarFilters` criteria.
`toolbarContent` keeps Reset available, and the mounted CollectionFrame keeps
Grid Options available. Collapsing the criteria retains the owner’s current
query and filters. Cards keep their existing criteria-level Reset. Report criteria
open by default, with visibility independent of Grid and Cards.

Both collection views use the same shared Reset icon and compact button mode as
Countries. When the shared button hides its text in a narrow toolbar, it retains
the localized accessible name.

The November 9 browser run checks 128 Grid/Cards layouts per feature across
Countries, States and Districts in EN/AR and Light/Dark. All 192 Grid checks
collapse the criteria, verify both commands remain visible, and reopen to the
same criteria. The previous States build fails at the collapsed Reset check.
The States and Districts workflow smoke runs also use Reset from the collapsed
Grid, then confirm that the Report criteria close independently and the PDF
download stays in PageHeader. Their import steps use the current header actions.
The row-action test helper waits for either the inline command or the menu before
choosing a locator, so a collection refresh cannot make it select the menu early.
[Playwright locator guidance](https://playwright.dev/docs/api/class-locator#locator-or).

## 7. Toolbar glyph size correction

The initial icon check proved only that Reset rendered the same SVG. Browser
measurement subsequently reproduced 24x24px in States, while Countries Grid had
a feature-local 18px rule. The shared CollectionFrame now supplies an inherited
`--app-icon-size: 18px`. AppIcon consumes it, retaining its 1.5rem fallback outside
the toolbar. Countries' local icon width/height override is removed.

The browser acceptance measures the Reset glyph itself in Grid and Cards at
each viewport and theme. Button dimensions and glyph dimensions are checked
separately. PrimeNG Button metadata supports the child-icon composition; custom
AppIcon sizing is application CSS and requires rendered browser measurement.

Primary references are [Angular style scoping](https://angular.dev/guide/components/styling)
and [PrimeNG button icons](https://primeng.dev/button).

The [glyph-size receipt](verification/reset-icon-size-2026-11-09) records the
before measurement, current sources, browser dimensions and final quality gate.
