# Application-wide Angular scrolling

The requester requires reusable presentation improvements to apply generally,
including future consumers. Scrolling is application infrastructure, not a Countries
style. Apply this rule to other recurring controls, feedback, spacing and colors too:
extend the owning shared component or global theme first; feature pages supply
business content and callbacks. AGENTS.md records this mandatory policy.

## Single source and automatic coverage

`shared/ui/layout/_scrollbar.scss` defines the shared CSS variables and browser
scrollbar mixin. `src/styles.scss` installs those variables on :root and applies the
mixin through zero-specificity :where(*). New overflow containers need no opt-in
class, copied CSS, directive, MutationObserver or JavaScript scrolling engine.
Existing erp-native-scrollbar markers remain compatible but are unnecessary for
style adoption. The rule covers document/ordinary containers, table viewports,
dialogs, drawers, textareas, nested dashboard panels and body-appended vendor lists.
It changes presentation only; overflow, dimensions and scrolling ownership remain
with each existing shared layout/control. No forced smooth scrolling or universal
scrollbar-gutter layout change is introduced.

Shared `ScrollViewport` continues using PrimeNG ScrollArea with built-in wheel,
keyboard, drag, auto-hide/resize and RTL behavior. Its design tokens reference the
same global variables as ordinary scrollbars. Do not wrap native vendor viewport
internals in another ScrollArea: that would introduce nested scroll containers.
The global selector has zero specificity, preserving PrimeNG's hidden browser
scrollbar inside ScrollArea and avoiding duplicate tracks.

## Theme contract

| Variable | Default responsibility |
| --- | --- |
| --erp-scrollbar-size | 10px vertical/horizontal track; padded rounded thumb |
| --erp-scrollbar-track | foreground4% mixed with surface |
| --erp-scrollbar-thumb | muted foreground72% mixed with primary |
| --erp-scrollbar-thumb-hover | muted foreground35% mixed with primary |
| --erp-scrollbar-duration | 150ms;0ms under reduced motion |

All colors derive from @app/tokens and update with all five palettes/light-dark.
Forced colors uses Canvas/ButtonText/Highlight and standard automatic browser
colors. No physical left/right placement is added; PrimeNG and browser direction
own RTL. The resting/hover colors contrast above5.2:1 against the shared track
across current ten palette/mode combinations (numerical token audit, rounded RGB).

Firefox uses standard scrollbar-width/color. Engines supporting WebKit scrollbar
pseudo-elements explicitly use auto for those standard properties so they do not
override the custom rounded thumb, padding, hover/active color and horizontal
corner. This follows [MDN scrollbar-color behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color)
and its [pseudo-element fallback guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar).
Cross-browser CSS support does not constitute a live Firefox/Safari acceptance run.

## Verification

PrimeNG MCP was consulted through the installed official server's direct stdio
client before and after the ScrollViewport token change. Final validate_usage
accepts ScrollArea metadata; it does not validate CSS, interaction or accessibility.
Chrome browser acceptance is `npm run verify:scroll-browser` (40 palette/mode/EN-AR/
390-1440 cases plus2 forced-color cases) and `-- --focused` (actual shared collection
paging/horizontal scrolling, Dialog and multiline field in EN/AR390-1440).
The ordinary unclassed container check proves future consumers automatically inherit
the policy. It also verifies textareas, root scrollbars and a real body-appended
PrimeNG Select list. Actual workspace ScrollArea verifies wheel/keyboard, green
palette handle drag, correct RTL edge, reduced motion, resize hiding and absence of
duplicate native bars. All API calls in these browser fixtures are intercepted;
there is no hosted business write or new API/native feature.

Canonical maintenance receipts are registered with Platform's existing
angular-module-context-navigation feature. Existing unit/feature histories are not
relabeled as fresh runs by this style maintenance. Production bundle warning
continues under FOLLOW-019; no budget was increased.
