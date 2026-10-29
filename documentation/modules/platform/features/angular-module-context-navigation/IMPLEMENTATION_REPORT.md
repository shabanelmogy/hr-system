# Angular application context navigation — S2-A6

Phase06 **Verified**,2026-10-29. Authenticated tenant users can switch the current
application or return to overview from the existing header. Only known modules
from their real server-permitted catalog are offered. Current selection follows
successful navigation and browser back/reload, including module-area routes.

## Ownership and behavior

Platform Modules owns ModuleContextState/control and current module registry.
AuthenticatedApplication composition supplies a generic Shell application slot
and component-scoped catalog/navigation/fiscal providers. Header and page share
one ModuleCatalogState; leaving the authenticated component destroys subscriptions.
This avoids relying on cached lazy-route injector destruction. Company/year
remain their existing owners; this selector is internal navigation only.

The existing scoped read masks/cancels on identity or context changes. Its generic
explicit refresh is loading/denial guarded; catalog re-entry freshness is30s with
no poll. Catalog requests retain strict parsing, finite timeout and Cookie-only
exact API transport. Blank tenant, global role and anonymous identities make no
catalog request. Unknown/unported module/admin destinations and server entryPath
links are never fabricated. Existing direct-route denial is retained.

OptionSelect external commit, ContextBadge, buttons, icons, core translations and
tokens are reused. Navigation rejects unpermitted/duplicate/blocked callbacks,
waits for actual Router completion, and keeps the old route on false/rejection
with closeable shared feedback. Feedback is identity-fenced. Current navigation,
pending/restoring auth and context updates disable switching; context transitions
remove old options immediately. Generic compact context-region sizing prevents
application/company/tenant/year overlap. Shared UI has no module business rules.

Requester refinements are included in this acceptance: Select has a translated
menu heading, module icons and checkmark; ContextBadge/Select no longer cap desktop
text at240px. Complete desktop labels collapse to icons when viewport or toolbar
width is at most1199px, with shared PrimeNG Tooltip. Desktop language/mode controls
remain available in settings when toolbar is below1500px, reserving context space.
PalettePicker now uses PrimeNG RadioButton and field actions use pButton. A shared
ScrollViewport uses PrimeNG ScrollArea for main content, sidebar and mobile drawer:
token colors,7px rounded handles, RTL placement, reduced motion, keyboard, wheel
and pointer drag. Select's own scrolling list has matching thin theme styling.
Architecture rules reject native workflow widgets in inline/external templates.

Angular uses scoped Signals/computed, no global NgRx/BFF/new backend service.
Next/native/API runtime and schemas are unchanged in this child. Earlier auth
maintenance in the shared worktree is independent and preserved. No business
data write, new migration, permission or mock entity was introduced. Five-point
structured domain UI audit is N/A on retained Web/Mobile for this navigation child.

## Verification actually run

- Full Angular `npm --prefix web-angular run check`:25 files/**109 unit tests**,
  **9 architecture cases**,4 configuration tests, strict templates/types,
  tokens/fonts/catalog and production build passed. Initial434.41 kB /
  estimated116.17 kB transfer; budgets unchanged, no build warning.
- Production fixture `verify:module-context-browser`:**24 scenarios** including
  EN/AR, light/dark,390/1440, real PrimeNG keyboard Space/Home/Enter, close/focus,
  browser history/reload, one catalog per load, error/malformed/retry/empty/403,
  global/no-tenant no reads, delayed response after public navigation, unknown
  route recovery, company pause/authoritative new catalog, and four context
  controls without overlap at390 and1440 in both languages; complete desktop
  labels/icon-only compact labels and actual Tooltip hover; four additional
  ScrollArea cases verify wheel, Home/PageDown, handle drag, RTL position and
  ResizeObserver update after short/tall viewport changes.
- Production regressions: existing module navigation**14**, company**14**,
  fiscal-year**15**, authenticated shell**24**, language**20** browser cases passed.
- Shared form regression on the existing development server4210:**40** palette/
  mode/language/viewport combinations passed, including actual pButton password
  reveal/clear, geometry, validation/focus, reset/server errors and duplicate save.
  `/dev/forms` is deliberately absent in the production build; its initial4220
  probe redirected as designed, so the form harness ran against development.
- Retained Next module service/registry/route tests:3 files/**13 tests** passed.
  Retained native use-case/registry/remote schema:3 suites/**7 tests** passed.
- `verify:module-context-live`: trusted installed Chrome, actual Angular4210
  and hosted API shabanhrms.runasp.net. Real demo sign-in; exactly one initial
  accessible-catalog200 shared by header/page; module/overview navigation reuses
  it; reload reacquires once; actual refresh200, second reload and cleanup
  logout204 passed. No raw credentials/session/Cookie payloads were saved.
  [Live receipt](verification/live-results.json) distinguishes this from fixtures.
- Unit tests prove actual service cancellation/disposal, synchronous identity
  masks, freshness and dedupe, invalid callback rejection, navigationfalse/error,
  pending context and no cross-identity feedback. An architecture rule rejects
  a page-local ModuleCatalogState provider.

Local logs/captures live under `.codex-tmp/angular-module-context*`; curated safe
fixture screenshots and production-results.json are registered in verification.
No hosted Angular deployment or live company mutation is claimed. Actual catalog
policy is exercised by the hosted read, not inferred from mocked DTOs. Broader
release, provider and operational acceptance remains PROD-002/017/019/RISK-018.

## Baseline and intentional adapter differences

Next ModuleContextSwitcher/useModulesQuery were re-read. Known-module/overview,
scope/global exclusion and route selection semantics are retained. Angular's
existing PrimeNG OptionSelect popup and shared icon trigger are intentional
adapter differences from the source MUI ContextSwitcher, not a pixel-identity
claim; menu options now use generic shared icon/text presentation. Existing
launcher/Grid/business screens were not redesigned. Current editable business
routes are absent; FOLLOW-014 still gates future discard approval. No universal
dirty engine or unported administration route is added as a placeholder.

The first keyboard harness focused an option DOM node rather than the Select's
active-descendant owner. It was corrected to documented combobox Home/Enter and
now asserts popup closure and returned focus. Existing company/retry regression
locators were scoped to their actual owner after the new header introduced a
second Select/retry button. These were test-selector corrections, not bypasses.
Visual QA found compact context compression; sizing was corrected and explicit
four-control non-overlap checks added. The final source gate and affected browser
runs passed after these corrections. Node fixture-loader module-type advisories
remain script warnings, separate from the clean Angular production build.

PrimeNG refinements follow the installed22.1.4 components and official
[ScrollArea](https://primeng.dev/scrollarea),
[RadioButton](https://primeng.dev/radiobutton),
[Select](https://primeng.dev/select) and
[Tooltip](https://primeng.dev/tooltip) documentation. ScrollArea is used rather
than deprecated ScrollPanel. The palette test now interacts with the PrimeNG
radio by accessible name, not its internal DOM value. jsdom's missing
ResizeObserver is stubbed only in the frame unit test; Chrome proves actual
resize behavior. The scroll test's tall viewport was increased to1200px because
three mobile cards legitimately overflow900px. The keyboard harness now waits
for the active option before Enter, eliminating a focus/render race.

## Acceptance mapping and handoff

ERP-03 and SIG-01/02/03/07/08 applicable bounded behaviors Verified by the evidence
above; no claim closes their whole-program acceptance. Other ERP/SIG IDs remain
reasoned N/A for this read/navigation child as frozen in the contract. FOLLOW-012
translation editing, FOLLOW-014 future drafts and FOLLOW-015 remaining workspace/
business screens remain Open. No full S2 or ERP migration completion is claimed.
Education is authored only after this Phase06 verification. Roll back this
Angular composition/control/state and generic refresh/layout additions; retain
existing API/session/company/fiscal contracts and all business data.

Official implementation basis: [Angular Router](https://angular.dev/api/router/Router),
[hierarchical providers](https://angular.dev/guide/di/defining-dependency-providers),
[PrimeNG Select keyboard](https://primeng.dev/select),
[Playwright role locators](https://playwright.dev/docs/locators).
