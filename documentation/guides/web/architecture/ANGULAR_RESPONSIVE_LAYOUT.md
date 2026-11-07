# Angular responsive layout contract

This is the application-wide responsive system, including future features. Shared
components and theme/layout owners implement these rules; features supply content,
permissions and callbacks. Do not copy responsive shells into individual features.

## Screen families and sizing

| Family | CSS viewport width | Required layout behavior |
| --- | --- | --- |
| Small phones | 320–359px | One or two content columns as space permits, compact controls, no clipped navigation |
| Phones | 360–599px | Stacked forms/panels, compact header actions, two KPI columns when the container permits |
| Tablets / narrow windows | 600–899px | Drawer navigation; reflow by actual content width, not a horizontal KPI strip |
| Medium windows | 900–1199px | Test sidebar open and closed; content can still require tablet/phone composition |
| Laptops / desktops | 1200–1919px | More columns only when each control/card remains readable; bound long text and form line lengths |
| Wide / ultrawide | 1920px and above | Use available workspace without oversized typography or endlessly stretched data-entry fields |

The debugger's existing labels remain xs below600, sm600–899, md900–1199 and
lg1200+. These labels describe the viewport; they do not force a feature's grid.
Use fluid widths, logical CSS properties, minmax(0,1fr), and content/container
queries rather than device names or physical screen.width/devicePixelRatio.

Height is an independent constraint. Verify 480, 640, 720, 820, 900 and1080px
heights where appropriate, plus landscape844×390. A wide but short window must
retain reachable actions and all content through the correct inner viewport.
Do not assign a desktop height merely because the width is large.

## Component rules across all sizes

- Forms: adapt columns to usable width; labels/helpers/errors remain readable,
  fields never overlap, and first-invalid focus can reach its field. Preserve the
  shared form/confirmation/dirty-state contracts during layout changes.
- Collections: use MyDataGrid or the approved shared card view. The Grid owns
  justified horizontal data scrolling; do not add a second feature Grid shell.
  Search, filters, paging, row actions and record navigation remain reachable.
- Cards/metrics: use meaningful minimum widths, normal word wrapping, and fewer
  columns before shrinking text. Never break ordinary words into vertical letters.
- Headers/toolbars: reduce gaps and subtitle/title sizes through shared options;
  use labelled icon actions or an accessible shared overflow menu when necessary.
- Dialogs/menus: fit within the current viewport, retain focus/keyboard access,
  and use theme surface/foreground tokens in Light/Dark instead of inverse TopBar
  colors. Do not hide validation or primary actions to make an overlay fit.
- Typography: fluid sizing has readable lower/upper bounds. Compact KPI11px is a
  short auxiliary label, not a universal body/form font. Preserve text enlargement.
- Touch/keyboard: keep targets accessible, visible focus and logical tab order;
  never solve overflow by reducing targets below the shared minimum contract.
- RTL: use inline/block/start/end properties and test actual Arabic content.
  Long Arabic/English names, empty results, loading/errors and large values are
  acceptance data, not optional visual polish.

## Verification matrix

Baseline widths:320,360,390,600,768,891,900,1024,1280,1440,1920 and2560px. Combine
representative short/tall heights instead of testing every Cartesian product.
Required boundary cases include900×820,891×820,768×640,390×844,320×720 and
1440×640. For broad layout changes add1920×1080,2560×1440 and844×390, and test
text/browser zoom at200% without lost controls or horizontal document overflow.
Cover sidebar open/closed, EN/AR, Light/Dark, keyboard and scrolling to the last
content item. Record executed cases separately from required/manual cases;
declaring this matrix does not mean every feature already passed it.

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
18rem, two from18rem, three from32rem, and six from64rem of actual container width. Panels use
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
