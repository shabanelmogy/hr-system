# D29–D32 form and record interaction acceptance — 2026-10-30

Phase06 Verified for this bounded requested correction. Original Create/Edit and
lifecycle proofs remain historical; full Countries/pilot/Table matrix is not closed.
Exact authorized scope and entry gates: ../FORM_LAYOUT_CORRECTION.md. D29/D30–D32
current-source Phase00 generation/check and planning passed before runtime.

Add/Edit now projects six shared TextFields directly into the existing one-column
FormContainer. A shared optional counterAppearance=badge renders native PrimeNG
Badge (deferred), actual used/maximum100/100/2/3/10/3. Native maxlength guides typing;
programmatically loaded values are not truncated. Default inline counters remain
compatible. Counter aria-describedby exists only for rendered counters and uses
the canonical bilingual validation.characterCount caption. NumericField retains
the same TextField template/deferred dependency. FormContainer formTools groups the
development generator separately from Cancel/primary action; opaque sticky dialog
footer and contained scroll preserve access at390×780. Create uses Add/add icon;
edit Save/check. No new feature-local shell/field/menu/paginator.

CollectionRecordFeedback is page-scoped and public. MyDataGrid/CardList consume a
query/scope-bound recordRequest through their existing shared controller. A confirmed
edit followed by authoritative refresh selects/focuses the same visible record and
flashes for1.2s twice with themed info/success colors, matching inspected current
Next MyDataGrid source. Reduced motion uses a static temporary highlight. Requests
are consumed once across refresh/view replacement; a repeated edit publishes a new
request. Stale actor/criteria/page-size/errors/expired requests cannot activate an
old record. No invented rank/all-record fetch if an edited ID leaves its page.
Leaving the flashed row cancels its flash immediately, including through keyboard
and pointer activation; returning does not replay it. Exactly one row/card is
active/focused. Keyboard-visible focus suppresses competing hover tint from a
stationary pointer on the old unselected row. Explicit bulk selections remain.

Successful archive/bulk targets the predecessor of the first removed displayed
record, crossing existing server paging when needed. First row falls back to the
first survivor, an empty collection has no active row. Bulk checkbox selection is
separate and clears normally. Rejected/uncertain writes do not publish success
requests. Restore retains normal collection behavior. Existing API/permissions/
atomicity/uncertain no-replay remain unchanged.

Shared Grid/Cards keyboard: Up/Down; logical LTR/RTL Left/Right; Home/End within
page; Ctrl+Home/End global; PageUp/PageDown clamped to final partial page; Enter View.
Existing Space/range selection retained. Non-interactive row click requests actual
focus; input/button/link/editable/menu/dialog events remain native. Focus runs after
Angular rendering and scrolls the target into view.

Executed full npm run check:71 files/405 tests,4 configuration/11 architecture,
type/catalog/tokens/fonts/build green; initial498.70kB/129.71kB transfer, unchanged
budgets. Meaningful tests cover loading→ready edit focus/flash/expiry/repeat, stale
authority, empty/first survivor, archive across page boundary, logical keys and
unknown totals/modifiers; previous form/CVA/validation/dirty/commands remain covered.

Actual authenticated shell browser8 EN/AR×light/dark×390×780/1440×1050: one-column
field bounds/native badges/limits/clear/mock, enabled invalid Add/first error focus,
dirty protection, pending lock, Create/Edit Grid/Cards, repeated same-record flash,
normal/reduced motion, flash expiry/no view replay, active focus, keyboard page
crossing/Home/End/logical keys/Enter and input isolation. Individual middle/first-row
archive and first-row-on-page2 predecessor are verified; bulk/restore/dependency
rejection/atomic fixture semantics, Toast/Modal/read-only/lost outcomes remain green.
Durable machine results: FORM_RECORD_RESULTS.json; reproducible driver:
web-angular/scripts/verify-country-actions-browser.mjs (HTTPS preview4220, override
ANGULAR_PREVIEW_ORIGIN). All business writes intercepted synthetic fixtures.

Shared form browser regression40 combinations (five palettes×two modes×two locales
×two widths) passes validation/focus/clear/reveal/reset/async/server errors/duplicate
submit/RTL through unchanged default form behavior. Light EN compact/wide and dark
AR compact form/flash screenshots visually reviewed. Actual native-device/touch or
full five-palette Countries parity is not established by these browser cases.

MCP Badge inputs/tokens and Table accessibility were consulted. Final Badge usage
validation returns zero metadata issues; no Table edit-result flash API is exposed.
Angular scoped keyframe names are checked by suffix in browser assertions. The
fixture uses distinct creation timestamps so predecessor order is deterministic;
input isolation clicks the actual input after modal closure rather than bypassing
the modal mask via programmatic focus. Browser execution also exposed a real shared
closing race: native Dialog onHide follows its leaving animation, and the old
return-focus callback could override newer outside search/row focus. DialogPanel
now preserves that newer outside focus, while retaining ordinary trigger return
and nested-dialog barriers. A focused wrapper regression and actual keyboard/input
journeys cover the correction. Sources: https://primeng.dev/badge ; https://primeng.dev/table ;
https://primeng.dev/dialog ; https://angular.dev/guide/components/dom-apis .
User refinement also has real browser proof with the pointer left over the old
edited cell: after ArrowDown the old row has no flash/class/animation and its cell
background equals an ordinary unselected surface, while only the new row is active
and focused. Cards also cancels flash immediately on movement. Bounded shared
:has(tr:focus-visible) rules follow documented native hover/focus semantics:
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:hover ;
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible ;
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has .
MCP metadata is not browser or business validation.

SQL-backed canonical core EN/AR resources and normal exports remain authoritative:
21sources/7267keys/20Angular namespaces, catalog
09b4a4847cb943a6461e3370393b68fe83ad9637f9ef393aa51bec428e309fc1.
Matching host publication/SQL override proof stays PROD-019. No API/entity/schema/
native runtime change; migration N/A. No hosted business writes/deployment. Retained
API1162/0/3 is earlier evidence, not a fresh live run. Full Countries Chart/managed
Crystal-PDF/XLSX Import/pilot/source/host acceptance remains Required; complete Table
matrix is FOLLOW-016. Two inherited planning warnings concern education-module and
erp-platform-template missing v2 contracts. Existing user HTTPS4210 preserved;
agent-owned preview4220 stopped after verification.
