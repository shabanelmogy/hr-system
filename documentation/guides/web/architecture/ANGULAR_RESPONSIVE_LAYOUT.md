# Angular responsive layout contract

Use [UI review acceptance](UI_REVIEW_ACCEPTANCE.md) for independent visual,
functional and accessibility closure. Pagination, expanded criteria and nested
detail Grids require their own acceptance; zero outer overflow alone is insufficient.

The current Grid/Cards/Chart/Report/Import composition matrix and review findings
are in [Angular collection views](ANGULAR_COLLECTION_VIEWS.md). Use it with this
responsive sizing contract before copying an existing screen.

This is the application-wide responsive system, including future features. Shared
components and theme/layout owners implement these rules; features supply content,
permissions and callbacks. Do not copy responsive shells into individual features.


Shared Import refinement 2026-11-08: embed the existing commands in PageHeader,
use one row of five compact status tiles at every width, and keep the preview
at least 180px high inside its bounded scroll owner. Tile labels may use a localized
short caption with their full accessible name/title. Coarse-pointer header and
Import targets remain 44px; fine-pointer Import controls use 32px with 12px text and
16px icons. No feature-local responsive overrides; see the current
[Import layout contract](../../../modules/platform/features/angular-countries-import-view/IMPORT_LAYOUT_2026-11-08.md).

Shared Grid actions use actual content width, not viewport labels: one menu
below 600px, inline from 600px. This is MyDataGrid's default. Feature templates
inherit it, and architecture rejects forced inline action configuration. Sidebar
opening must trigger the same transition automatically. Disable a menu trigger
when no command is enabled; features still own permissions and callbacks.
Source and verification: [shared Grid actions](../../../modules/platform/features/angular-states-workspace/SHARED_GRID_ACTIONS_2026-11-08.md).

## Screen families and sizing

| Family | CSS viewport width | Required layout behavior |
| --- | --- | --- |
| Small phones | 320–359px | One or two content columns as space permits, compact controls, no clipped navigation |
| Phones | 360–599px | Stacked forms/panels, compact header actions, two KPI columns when the container permits |
| Tablets / narrow windows | 600–899px | Drawer navigation; reflow by actual content width, not a horizontal KPI strip |
| Medium windows | 900–1199px | Test sidebar open and closed; content can still require tablet/phone composition |
| Laptops / desktops | 1200–1919px | More columns only when each control/card remains readable; bound long text and form line lengths |
| Wide / ultrawide | 1920px and above | Use available workspace without oversized typography or endlessly stretched data-entry fields |

The debugger's existing labels remain xs below 600, sm 600–899, md 900–1199 and
lg 1200+. These labels describe the viewport; they do not force a feature's grid.
Use fluid widths, logical CSS properties, minmax(0,1fr), and content/container
queries rather than device names or physical screen.width/devicePixelRatio.

Height is an independent constraint. Verify 480, 640, 720, 820, 900 and 1080px
heights where appropriate, plus landscape 844×390. A wide but short window must
retain reachable actions and all content through the correct inner viewport.
Do not assign a desktop height merely because the width is large.

## Component rules across all sizes

- Forms: adapt columns to usable width; labels/helpers/errors remain readable,
  fields never overlap, and first-invalid focus can reach its field. Preserve the
  shared form/confirmation/dirty-state contracts during layout changes.
- Collections: use MyDataGrid or the approved shared card view. The Grid owns
  justified horizontal data scrolling; do not add a second feature Grid shell.
  Choose `actionDisplay="responsive"` when a collection needs inline actions:
  below 600px of Grid content width the shared row menu releases space for data.
  Keep all domain actions available in the menu and verify the frozen boundary
  during horizontal scrolling in both directions. On coarse pointers, selection
  and row actions retain 44px targets and rows remain at least 52px, even when the
  user chooses compact density. Keep headers, footer and the intended table
  viewport visible in short/landscape windows such as 844×390.
  Search, filters, paging, row actions and record navigation remain reachable.
- Cards/metrics: use meaningful minimum widths, normal word wrapping, and fewer
  columns before shrinking text. Never break ordinary words into vertical letters.
  CardList's explicit `compactLayout="single-column"` fills the content row
  through 790px of usable collection width (Tenant Administrators). Wider
  containers retain the chosen layout; do not replace shared viewport scrolling.
  In the Tenant editor, overview/details occupy equal-height columns when both
  are visible. Their own shared viewports own necessary scrolling. Compact
  summary popovers keep natural height; do not force a desktop height on them.
  Filled ContentTabs supplies 12px panel padding, reduced to 8px in narrow panels;
  use its compact/none options instead of accumulating feature-specific insets.
- Headers/toolbars: reduce gaps and subtitle/title sizes through shared options;
  use labelled icon actions or an accessible shared overflow menu when necessary.
  Collection Add/Export commands match the view-button height through the shared
  PageHeader scale in Countries/States/Districts/Tenants. Regular fine-pointer
  controls use 36px, compact/landscape 32px (fluid minimum 28px), coarse pointers
  44px. Form switches with `labelPlacement="above"` align their outlined controls
  with labelled text inputs. Multiline counters/clear actions occupy a tools row
  below the full-width writing area and follow logical RTL/LTR alignment.
  For a few commands without a view chooser, PageHeader's explicit
  `actionsLayout="inline"` keeps Add/Export/Refresh in one row (Tenant
  Administrators). Keep the adaptive default for crowded multi-view headers.
  SelectionWorkspace's search field fills its directory width with equal insets,
  including when the directory stacks above the detail panel.
- Dialogs/menus: fit within the current viewport, retain focus/keyboard access,
  and use theme surface/foreground tokens in Light/Dark instead of inverse TopBar
  colors. Do not hide validation or primary actions to make an overlay fit.
- Typography: fluid sizing has readable lower/upper bounds. Compact KPI 11px is a
  short auxiliary label, not a universal body/form font. Preserve text enlargement.
- Touch/keyboard: keep targets accessible, visible focus and logical tab order;
  never solve overflow by reducing targets below the shared minimum contract.
- RTL: use inline/block/start/end properties and test actual Arabic content.
  Long Arabic/English names, empty results, loading/errors and large values are
  acceptance data, not optional visual polish.

## Verification matrix

Baseline widths: 320,360,390,600,768,891,900,1024,1280,1440,1920 and 2560px. Combine
representative short/tall heights instead of testing every Cartesian product.
Required boundary cases include 900×820,891×820,768×640,390×844,320×720 and
1440×640. For broad layout changes add 1920×1080,2560×1440 and 844×390, and test
text/browser zoom at 200% without lost controls or horizontal document overflow.
Cover sidebar open/closed, EN/AR, Light/Dark, keyboard and scrolling to the last
content item. Record executed cases separately from required/manual cases;
declaring this matrix does not mean every feature already passed it.

## Compact collection screens

Report views project the shared current-PDF Open/Download template into the
existing PageHeader. Use PdfViewer's toolbar layout for compact accessible links,
and preserve the single Blob lease. Reference ReportWorkspace uses 260px criteria
and a 16px document gap; below 54rem of actual workspace width, criteria/document
share bounded rows with a 12px gap. Criteria scrolling stays in ScrollViewport.
Omit an empty options tab after relocating PDF actions; granted RPT management
actions retain their own options panel. Keep the document fitted to the remaining
height and the outer application page free of scroll.

Tenant Management is the reference for the shared Grid and Cards layout.
Use the same PageHeader, CollectionFrame and CollectionFooter in both views.
Screen code supplies data, criteria and actions.

- At 64rem or less of actual header width, place the title and badges at the
  logical start and the primary action at the logical end of the first row.
  Put all available view buttons at the start of the second row, with export,
  refresh and filters at the opposite end. Keep badges below the title except
  in short landscape windows, where they can sit beside it to save height.
  Use labelled export icons at 1199px or less of viewport width and a labelled
  primary icon at 599px or less. At 35rem or less of header width, scale the
  title between 12px and 14px and tighten icon spacing.
- Use `toolbarLayout="adaptive"` for wrapping collection controls. Structured
  search always starts as two logical rows at every width, including wide desktop:
  search field/operator/query first, domain filters/actions second. Both rows use
  available width. Do not wait for a breakpoint or compress a combined row.
  Very narrow panels may wrap either logical row further for readability.
  From 56rem, field/operator widths are 144/160px and query minimum 240px; below,
  use 112/128px and 200px. Projected filters use 144/112px bases, or a reviewed
  content-specific controlWidth, and grow without a maximum cap to fill each row.
  Action-only rows align commands at logical end; empty wrappers reserve no space.
  All outlined controls/actions stay 44px. At 34rem or less, put the query below
  its two selectors and visually hide labels while retaining native associations.
  Adaptive-search placeholders use 12px; entered text retains its normal size.
  At 56rem or less, control/label text is 14/12px. Labelled-row gaps are 16/14px,
  reduced to 8px with hidden labels. Preserve actual selected values and full
  text in the shared control; never replace an active filter with a placeholder.
  This two-row contract applies to structured search. Simple-search compatibility
  remains: narrow Grid search, Reset and icon-only Grid Options share a row;
  Cards keep Sort By/direction and compact Reset beside search. Short landscape
  uses bounded shared scrolling, a minimum data viewport and sticky paging.
  The header filter toggle remains reachable. No feature-local layout overrides.
  An approved `data-collection-search-companion` on one projected OptionSelect
  places it beside the operator through 34rem, above the full-width query.
  Through 28rem, move the search-field selector to its own row to preserve
  operator/companion readability. Remaining filters fill paired rows. Districts
  opts in for Status; the wider two-row default and other consumers are preserved.
- Countries, States and Districts search and filter fields start collapsed in
  Grid and Cards. The shared header
  filter button exposes its expanded state and toggles them with the keyboard.
  Keep criteria in the feature state so collapsing does not clear them or refetch
  data. Countries, States and Districts keep Reset, Grid Options and applicable
  selection actions reachable while Grid criteria are hidden. Report filters
  open by default and retain their own visibility state.
- Responsive CardList measures the scrollable panel. Use one column below 36rem,
  two from 36rem, three from 54rem and four from 72rem. At 1012×823, the open
  sidebar leaves room for two Countries cards and the collapsed rail for three.
  Keep selection in the card header with a 44px label target and actions in the
  footer with 44px targets and 8px gaps. Allow two lines for entity names and
  subtitles, with complete title text available. Use compact shared spacing and
  aligned metadata values. Verify rich, sparse and long-name cards in EN/AR.
- CollectionChartView places metrics and plots in one shared scroll viewport.
  Use two metric columns, rising to four at 42rem of panel width. Chart panels
  use one column below 50rem and two above it, with 340px rows and 16px gaps.
  Below 22rem, use 320px rows. Metrics scroll with the charts so short windows
  retain access to every plot. Test keyboard scrolling to the final plot with
  navigation open and collapsed, including 1012×823 and 844×390.
- Place Clear beside pagination in the shared footer and announce the selected
  count to assistive technology. Keep Select All in the Grid selection header
  and beside Clear in Cards. Use the theme primary outline for the bulk archive
  toolbar action. Its confirmation retains the destructive-action treatment.
- Let CollectionFooter reflow by the usable controls width after projected
  footer content. Keep record controls centered and page size at the logical
  end when the controls area exceeds 32rem. At smaller widths keep one row
  using a compact counter, arrows and page-size select. At 26rem or less the
  redundant page-count text is visually hidden. Preserve RTL order and verify
  the same arrangement in Grid and Cards, including 799×823 and 800×823.
- Size a searchable directory to its content up to a bounded height. A single
  short result fits without a scrollbar. With many results, the directory
  scrolls inside its panel. When a parent panel provides the border, embed
  CardList with `frameAppearance="plain"` to avoid a second rounded frame.
- For a Cards view that intentionally hides its scrollbar, use CardList
  `scrollbar="hidden"`. Its shared viewport must still accept touch, wheel
  and keyboard scrolling when a page contains more cards than fit.

For compact collection changes, exercise 320×720, 390×844, 570×823, 571×823,
640×823, 690×823, 799×823, 800×823 and 899×823 as relevant, and 844×390 for short landscape.
Exercise 1012×823 and 1024×823 with the sidebar open and collapsed using
`verify-countries-screen-browser.mjs --medium-layout`.
Check Grid and Cards in English and Arabic, Light and Dark. Confirm that the
toolbar has no horizontal overflow, the whole document stays within the
viewport, and any necessary data scrolling stays inside its shared viewport.
The compact browser checks live in `verify-tenant-management-browser.mjs` and
`verify-tenant-admins-browser.mjs` under `web-angular/scripts/`. See the
[shared component contracts](./ANGULAR_SHARED_COMPONENTS.md) for the owning APIs.

## Compact viewport acceptance

Screens below **900 CSS pixels wide or 820 CSS pixels high** require compact
verification. This is an acceptance boundary, not a universal fixed page height.
Test 900×820 and 891×820 explicitly, plus 390×844, 320×720, 768×640 and a wide,
short viewport. Cover EN/AR, light/dark, expanded/collapsed navigation and long data.

Browser width and usable content width differ. Opening the sidebar at 900px can
leave roughly 570px for content. Card layouts must follow the actual workspace
container, even when navigation changes without a browser resize. Use container
queries for content distribution; viewport queries own application navigation.

## Mandatory shared behavior

- Keep document/workspace overflow at zero. Place necessary vertical scrolling in
  one shared ScrollViewport for the content; keep the header/actions outside it.
- Reflow cards into fewer columns. Do not substitute horizontal KPI strips,
  independently scrolling panel rows, clipped content, or one-character-per-line
  labels for responsive layout.
- Use PageHeader `compact` for smaller title/subtitle/spacing. Use ActionButton
  `compactOnSmallScreens` for an icon action with its accessible label and tooltip.
- MetricCard `size="small"` gives 11px labels, 16px values and 28px icons. Default
  existing consumers retain their sizing. Keep normal word wrapping.
- Summary cards grow naturally. An independent data-panel scroll area requires a
  documented workflow reason. Verify the last card can be reached and all header/
  navigation controls remain usable; overflow:hidden alone is not evidence.
- Respect reduced-motion during browser geometry checks so an in-flight width
  transition is not confused with the settled layout.

## Dashboard reference

Use `shared/ui/layout/_dashboard-layout.scss` and existing shared components.
The `responsive` mixin declares `dashboard-workspace`: one metric column below
18rem, two from 18rem, three from 32rem, and six from 64rem of actual container width. Panels use
two columns from 32rem and one below it. Separate panel rows use natural heights;
an eight-item list must not stretch an unrelated capacity row through equal 1fr
tracks. Use SurfaceCard `fill` with `contentSizing="natural"` for intrinsic content
in stretched cards; its default bounded mode remains unchanged for other panels.

The Super Admin dashboard is the reference. Its subscription chips adapt to card
width; capacity/subscription/tenant content creates no nested vertical scroller.
Regression: `web-angular/scripts/verify-dashboard-responsive-browser.mjs`.

## Development viewport preview

ViewportDebugger is development-only. Its TopBar control shows current CSS
dimensions, offers copy and a size selector. Choosing a preset opens a **new tab**
with one same-origin iframe. The original page and drafts remain intact. The
iframe's actual width/height controls media queries and innerWidth/innerHeight;
this does not resize the OS window or merely scale pixels.

Presets: 320×720, 390×844, 768×1024, 900×820, 1280×800 and 1440×900. Resizing keeps
the iframe document/state. Large presets use the preview-stage scroll area; this
developer-tool exception does not allow horizontal scrolling in product pages.

Tabs open from a direct user gesture with noopener/noreferrer. Messages accept
only allowlisted preset IDs, the exact origin and the bound child/parent window.
The child applies shared unsaved-change consent before closing a loaded preview.
Production ignores preview flags and exposes no preview selector/frame.
Bootstrap imports preview state through `diagnostics/state.public-api` and text
runtime through the existing localization `presentation.public-api`. Keep the
preview host deferred; mixing an eager state import with a large deferred UI
barrel can pull unrelated UI/validation code into the initial bundle. Existing
bundle budgets remain unchanged.
PopoverPanel owns surface foreground and floating-label background so Light/Dark
overlays do not inherit inverse TopBar colors.

## Primary references

- [Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_size_and_style_queries)
- [Grid track sizing](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/grid-template-columns)
- [Overflow](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overflow)
- [PrimeNG Select](https://primeng.dev/select), [Popover](https://primeng.dev/popover) and [ScrollArea](https://primeng.dev/scrollarea), consulted through MCP; existing shared adapters remain owners.
