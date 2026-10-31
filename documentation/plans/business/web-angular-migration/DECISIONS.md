# Angular 22 and PrimeNG Web Migration — Decisions

| ID | Status / authority | Boundary | Verification |
| --- | --- | --- | --- |
| D01 | Requester selected | Angular 22 + PrimeNG, licensed stable compatible patches. | Target peer/entitlement check at foundation entry. |
| D02 | Requester confirmed | Separate Angular app; keep Next.js. | Independent builds/URLs; no removal milestone. |
| D03 | Requester confirmed | Functional parity before redesign/new business. | Feature acceptance matrix. |
| D04 | Requester confirmed | No customers yet. | Reconfirm before external release. |
| D05 | Proposed | web-angular folder; SPA/lazy routes. | Foundation/hosting review. |
| D06 | Requester approved 2026-10-28 | Local Angular Signals/computed for simple state; scoped NgRx SignalStore for complex feature workflows; no mandatory traditional NgRx Store. Keep similar features consistent and server-cache/scope policy explicit. | State-complexity decision in each feature contract; scope/cancellation/realtime tests. |
| D07 | Proposed | Typed Reactive Forms and generic shared error/focus/dirty behavior. | Zoneless edit/repeater/server-error tests. |
| D08 | Requester approved 2026-10-28; DEC-025 Closed | No BFF. Angular calls the existing .NET API directly; no new YARP/gateway/Redis/session-store requirement. Keep Next's existing handlers for Next only. | DEC-027 fixes the direct auth contract before implementation; no silent token-storage decision. |
| D09 | Open: DEC-026 | Resolve duplicate P-008 meaning; register Angular references. | Before affected UI contracts. |
| D10 | Open proof: RISK-017 | Select compatible licensed Angular adapters for each integration. | Specialist acceptance spikes. |
| D11 | Proposed | One feature active at a time after authorization. | Central execution contract and checks. |
| D12 | Requester confirmed | Strong modular organization and same shared-component-first policy. | ANGULAR_ARCHITECTURE; shared controls and enforceable anti-bypass checks before broad conversion. |
| D13 | Requester confirmed 2026-10-28 | Avoid unnecessary complexity; prefer existing framework/API capabilities, scoped reuse and minimal dependencies. | No speculative services, generic engines or empty abstraction layers; each addition needs a concrete consumer/requirement. |
| D14 | Requester approved 2026-10-28 | Include ERP reliability/productivity recommendations as Required applicable acceptance: typed contracts, shared lookups, keyboard/structured editing, safe writes, precision/time, lifecycle/audit, volume/diagnostics and recovery. | ERP_ACCEPTANCE ERP-01..ERP-12; source-backed gaps gate the affected owner; no blanket domain rewrite or new infrastructure. |
| D15 | Requester-approved assessment under D14; generator choice pending proof | Required representative OpenAPI client-generation proof, then one pinned generator if suitable or an explicit tested typed-service fallback. | S0 proof before broad transport rollout; FOLLOW-003 remains canonical for broader contract automation. |
| D16 | Requester approved 2026-10-28 after the Sigma source review | Adopt SIG-01..SIG-08 as Required applicable acceptance: lookup bootstrap/watch, navigation request lifetime, loading ownership, attachment lifecycle, draft/confirmation safety, list URL criteria, shared compatibility and scroll ownership. | SIGMA_ACCEPTANCE owns details and external source provenance; S1 harnesses and first real consumers prove behavior under Angular 22/Strict/Zoneless. No runtime authorization or gate closure. |
| D17 | Requester approved 2026-10-28 through the explicit browser-persistence choice | Preserve reload continuity with secure HttpOnly Cookies inside the existing Platform API; retain JSON/bearer routes for Next/Mobile. Persistent JS-readable token storage and memory-only re-login behavior are not the selected path. | BROWSER_AUTHENTICATION_CONTRACT defines the bounded target transport. DEC-027 remains Open for slice contract/proof; RISK-018 gates affected guarantees. No new BFF/server/identity system; runtime entry follows the exact slice gates. |

## D08 — BFF excluded by requester

The requester explicitly rejected BFF and asked to avoid complexity. Angular uses
the existing ERP API directly. The earlier independent .NET BFF recommendation is
superseded, not deferred. Existing Next behavior is retained. DEC-027 records the
remaining direct cookie/token/session binding, which requires review of actual
API capability before implementation and does not authorize an identity rewrite.

## D06 — Approved state-management policy

The requester explicitly approved the discussed policy on 2026-10-28. Simple
component state uses Angular Signals/computed. A simple shared state may use an
owner-scoped Angular service with private writable signals, public readonly
signals and explicit methods. Complex feature workflows use scoped NgRx
SignalStore to standardize state, derivations and orchestration. Similar
features use the same selected pattern; AI-generated code is held to that rule.

Traditional NgRx Store (actions/reducers/effects) is not a baseline dependency or
a universal global store. Introducing it requires a concrete workflow need,
architecture review and an explicit recorded decision. Root state remains small
and owner-defined. Cache, invalidation, cancellation, stale-response rejection,
scope isolation and no implicit write replay remain independent requirements.

Each feature contract records the chosen mechanism, its lifetime/owner, complexity
reason and verification. This approval settles D06 only; it does not approve the
whole Draft or authorize runtime implementation.

## D16 — Approved Sigma acceptance integration

The requester explicitly approved including all eight recommendations after the
source-only review of `F:/My Work/Sigma/SiGmaAngularFrontEnd`. Required behavior,
owners, exact acceptance and external references are in
[SIGMA_ACCEPTANCE](SIGMA_ACCEPTANCE.md); ROADMAP owns timing. These are acceptance
details for the existing migration, not a port of Sigma architecture or business.
ERP functional/security ownership, Angular 22, Strict/Zoneless, D06, shared tokens
and direct API/no-BFF remain authoritative. Sigma's source/test definitions do
not prove ERP runtime, and its package versions/constants/auth are not adopted.
This approval integrates the requirements into planning only; G0-G4, central
decisions and per-feature execution authorization remain unchanged.

## D17 — Approved secure API Cookies

The requester explicitly selected secure Cookies inside the current API after
reviewing the persistence alternatives. This resolves browser-persistence choice;
do not ask for it again. Angular remains a direct API client and keeps session
continuity after reload. The API owns HttpOnly credential issuance/deletion;
JavaScript receives sanitized session metadata and restricted selection challenges.

[BROWSER_AUTHENTICATION_CONTRACT](BROWSER_AUTHENTICATION_CONTRACT.md) records the
target routes, cookie/origin/antiforgery boundaries, existing bearer compatibility,
required session reconciliation and acceptance. Concrete mechanisms still need
Phase 00 and the exact execution contract; approval does not claim those mechanisms
exist or their tests pass. Subsequent R1/R2 real SQL/Chromium evidence closes
DEC-027 for the API binding; its current report owns that result. RISK-018 retains
provider/ancestry/actual-consumer boundaries. No additional persistence-preference
approval is needed.

## D18 — Preserve database-backed UI translation

The requester explicitly reaffirmed translation persistence while authorizing
continuation. [LOCALIZATION_PARITY](LOCALIZATION_PARITY.md) freezes the existing
company/system SQL ownership, keys/catalog fingerprint, runtime layers, revision/
conflict/reset, permission and audit behavior. Angular reuses these APIs and keys.
S1-A0 implements the technical runtime/service only; actual login/context/Settings
save and reload acceptance is Required under FOLLOW-012 at S2/S4.

## D19 — Reusable template: shared first, PrimeNG native features and MCP first

Requester explicitly reaffirmed 2026-10-30 that recurring appearance and behavior
must be shared so later feature work concentrates on business capability. Before
implementing a control, consult PrimeNG MCP and prefer the installed library's
built-in properties/components/templates. Extend the existing shared component
only for a documented gap. Grid layout, native advanced filters and Grid options
belong to the generic shared kit; Countries owns data/permissions/callbacks.
The requested Grid options modal and collection-card internal padding are explicit
shared presentation refinements. Preserve reference appearance elsewhere and
record intentional differences. Installation and workstation handoff are in
`documentation/guides/web/architecture/ANGULAR_PRIMENG_WORKFLOW.md`.
Requester follow-up: move Countries Status out of the options modal into the
main data toolbar. Keep business criteria separate from presentation settings.

## D20 — Complete the remaining Countries views after the Grid correction

Requester explicitly requested Chart, managed Report and Import after reviewing
pagination, full column titles and scrolling on 2026-10-30. Prepare and execute
those exact existing children sequentially after corrected read/source acceptance;
create/edit and lifecycle stay Required/Queued and remain part of full pilot exit.
Chart is a page-scoped read adapter and does not need lifecycle UI as a dependency.
Report retains the existing Reporting owner. Import retains Countries:Create and
the current API's validation/atomicity/uncertain-submission contract. No action or
view is represented by a placeholder; each child still needs its Phase00 gate.

## D21 — Add and row actions, and read dialog refinement

Latest requester review explicitly requires the missing Add and row action buttons
and a better arranged read dialog without automatic focus. Finish the current
pagination/read-dialog correction, then execute existing S3-A3 create/edit and
S3-A4 lifecycle in sequence so those controls have real handlers. Chart/Report/
Import remain Required and follow within Countries; this refines D20 ordering.
Shared row action presentation must be reused in Grid and Cards. Permission and
read-only guards stay feature-owned and server-authoritative. No placeholder action
or unsolicited live business mutation is authorized by UI development.

## D22 — One native PrimeNG pagination control by default

Requester explicitly rejected the simultaneous record-navigation and page-navigation
bars. The shared collection default is now one PrimeNG Paginator, using its native
page links, first/previous/next/last, row-count selector and current-page report.
The initial implementation hid Countries record controls. The requester clarified
this was not intended; D23 below supersedes that interpretation. Consult PrimeNG
MCP before changing this layout; do not rebuild native page controls.

## D23 — Keep row navigation inside the single native paginator

The requester clarified that first/previous/next/last **record** controls must work
even on page 1 of 1. Removing the duplicated pagination did not authorize removing
record navigation. Countries Grid and Cards explicitly enable the existing shared
`recordNavigation` option. The shared footer projects its record controls through
PrimeNG Paginator's documented `templateLeft`; there is one paginator and one
footer, with separately named record controls and native page controls. Other
consumers retain the backward-compatible default false.

Use the existing collection controller for active record, boundaries, focus and
remote page transitions. Within-page record movement issues no HTTP request;
cross-page movement requests the authoritative target page then focuses its target
record. Pending/forbidden states and first/last boundaries remain guarded. Verify
one-page and multi-page flows, Grid/Cards, EN/AR, compact/wide and light/dark.

## D24 — One visible record indicator and one native arrow set

The requester rejected D23's simultaneous record counter, page report, page links
and second arrow set. Sharing one footer was insufficient: there must be one
visible navigation indicator. Countries record mode now uses PrimeNG Paginator's
native first/previous/next/last buttons and one current-record/total report.
There are no page-number links or separate page report/arrows in that mode.

The native component navigates an individual-record index (`rows=1` as a UI
navigation unit); the collection controller retains the authoritative server page
size. Native change events map to `navigateIndex`, which moves locally or requests
the target server page. The existing shared row-size selector is projected through
the documented native `templateRight` slot. Unknown-total record mode retains one
fallback record group/count and the same size selector, without page controls.

Default page mode for consumers without record navigation retains native page
links/report/rows selector. This is a shared presentation correction; no API,
permissions, query criteria, persistence, translation keys or business writes.

## Hosted test API preference — requester confirmed 2026-10-29

Use the existing https://shabanhrms.runasp.net API as the intended Angular test
backend so the requester can also test mobile against the hosted environment.
This does not request a new Angular frontend hosting site. Current source still
binds local7037; hosted health200 but csrf403/Authentication.BrowserOriginDenied is
an observed unresolved binding issue under PROD-019/017, not a completed switch.
Preserve the approved secure Cookie/no-BFF contract and prove actual browser
origin/HTTPS/session behavior before claiming hosted acceptance. See RESUME.md.

## D25 — Center navigation, edge settings and non-disruptive focus checks

Requester refinements keep the one native record indicator/arrow set centered
independently of side content. The row-size dropdown belongs at the logical edge
with total page count as metadata, without another page navigator. Compact
viewports may place edge settings on a second row while retaining centered
navigation and no horizontal page overflow. The numeric dropdown value is centered
horizontally and vertically in the complete control; the caret remains at its edge.
Use generic shared OptionSelect options and documented native size/Pass Through.

The first click anywhere also exposed the AuthSession focus-hint issue. Preserve
verified identity and rendered data while revalidating an unchanged visibility
hint; actual changes/failures and external invalidations retain the secure
coordinator. Company-context canonical books and PROD-019 own this correction.

## D26 — Complete actions, shared feedback and bulk before view review

Requester2026-10-30 requires real Create/Edit/Archive/Restore and bulk archive, then an explicit remaining-step review. Shared native PrimeNG success Toast is enabled; general errors use shared Modal, field validation remains beneath fields/shared summary. Translate Actions through existing core actions.buttons. Every recurring control stays shared; use MCP before shared edits. S3-A3/S3-A4 exact order and gates retained; Chart/managed Report/Import remain Required queued children. No live business writes authorized for verification.

## D27 — Pin the action title with its cells and preserve compact source behavior

Requester2026-10-30 requires the translated Actions header and body to remain fixed together during horizontal scrolling. Shared MyDataGrid uses the same native FrozenColumn edge for both; exclude frozen headers from the reference relative-position rule. Installed22.1.4 computes RTL left offsets from previous DOM siblings, so the trailing action cell needs a bounded shared left=0 correction to keep leading selection clickable. Document the native metadata/source gap and verify actual EN/AR clicks/alignment without force at both scroll extremes.

Source Next MobileHeaderLayout uses iconOnlyAdd below600px. Shared PageHeader.primaryAction now owns that responsive choice using existing ActionButton/BreakpointObserver, retaining accessible text and a full wider caption. Feature pages provide label/icon/permission/callback only. Header styling correction preserves theme and native controls.

## D28 — General context menu and exact cell-value filter

Requester2026-10-30 prioritizes a reusable context menu with Filter by this value on the selected cell. Reuse native PrimeNG ContextMenu through a shared generic wrapper, extend MyDataGrid and its existing controlled GridFilters; no local remote-page filtering or feature-local menu. Exact frozen scope is angular-grid-capabilities/CELL_CONTEXT_FILTER_CONTRACT.md. S3-A4 actions remain Verified/Closed; S1-A14 bounded context capability is sole Active, remaining matrix not accepted; Chart returns Queued until this requested correction completes. No new API/schema/native or live writes.

## D29 — One field per row and shared character-limit badges

Requester2026-10-30 asks to improve Add form, one field per row and permitted-character counters as badges. Exact bounded correction: angular-countries-edit-workflow/FORM_LAYOUT_CORRECTION.md. Reuse TextField counters and FormContainer projection; native Badge variant only as shared reusable presentation, preserve defaults. Reopen only S3-A3 Web correction; prior command acceptance retained, chart returns Queued. No API/schema/native/runtime business rule change.

## D30–D32 — Edited flash, active-record continuity and keyboard

Requester requires edited row flash and active selection, previous visible row after archive, and keyboard record navigation. Implement through scoped shared record feedback/controller/focus and generic Grid/Cards styles, preserving current source Next flash timing and reduced motion. Exact bounded semantics/test contract extends FORM_LAYOUT_CORRECTION.md; active execution stays S3-A3 Web correction, no second active feature or API/schema/native work. Checkbox multi-selection remains distinct.

Requester keyboard refinement: focus and the single active-row indicator move together. Leaving a row immediately cancels its old edit flash without replay on return; a stationary pointer must not preserve a competing old-row hover tint during keyboard-visible focus. Verify actual Grid/Card focus/classes and old-cell computed surface color. Closing-dialog return focus must preserve newer outside input/record focus. These remain bounded D32 shared interaction corrections, not a second selection/pagination model.


## D33 — Cards toolbar and native shared Chart completion

Requester2026-10-31 requires Cards search/status/sort/direction/reset in one row,
header Filter toggles the full toolbar and retains its state with Grid. Use a
shared native-backed arrow plus compact bilingual direction text/full accessible
name; reduce Search max400px and widen Sort By220px. Compact uses contained scrolling.
Final requester choice: Chart has no toolbar/header Filter or scope paragraph;
it inherits Grid/Cards criteria and starts on page1. Keep matching-total versus
loaded-page metrics honest. These choices supersede intermediate Chart-filter text.

Use native PrimeNG Chart with exact Chart.js4.6.1, current-source semantics/layout,
shared lazy presentation and a bounded outside-slice label gap only. Current-source
engine comparisons, actual canvases and source-style card measurements are recorded;
full five-view pixel/source acceptance remains S3-A8. S3-A5 Verified/Closed2026-10-31.
After all Views, complete the whole Countries pilot before applying the reusable
template to States/Districts; full Table powers remain Required. ActiveReports Excluded.


## D34 — Countries Report reuses global Reporting and independent criteria

S3-A6 composes the existing Reporting owner inside Countries, one PageHeader and
controlled280px/compact sidebar. Report authority is super_admin + GlobalCrystalReports:View,
workspace still Countries:View; no tenant entitlement or new per-user Run grant.
Preserve approved S3-A0 applied-versus-draft criteria and explicit Reset render.
Header Refresh explicitly regenerates unchanged sources; immutable actor replacement
clears applied/draft/selection. Shared form/workspace/PDF extensions preserve defaults.
Bounded behavior Verified; full five-view pixel/source/host acceptance remains S3-A8.
No ActiveReports, API/schema/native runtime, package or translation key addition.
