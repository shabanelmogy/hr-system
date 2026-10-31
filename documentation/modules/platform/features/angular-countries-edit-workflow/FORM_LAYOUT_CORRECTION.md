# D29 bounded form presentation correction — 2026-10-30

Requester explicitly changes Add presentation to one field per row and requests a
character-limit badge and improved layout. Reopen only the existing S3-A3 Web
presentation correction; original Create/Edit command acceptance stays historical
Verified. No new business fields/rules/API/schema/native or live writes.

Reuse the current TextField.showCounter/maxLength and FormContainer's single-column
content projection. Extend the shared counter with an optional native Badge
presentation, preserving the existing inline default and validation/CVA/IME/clear
behavior. Native Badge is loaded only when requested so login's initial budget is
preserved. Feature supplies limits100/100/2/3/10/3 from its validation contract;
zero/at-limit/over-limit programmatic values and clear reflect actual input length.
No silent truncation of programmatically loaded data or disabling invalid Save.

Remove the feature-local two-column shell and project each shared field directly.
Add a generic formTools projection to the shared footer for development-only mock
generation, distinct from Cancel and primary action. Primary submit uses Add label/
icon for create and Save/check for edit. Shared dialog footer has opaque background
and contained/sticky actions on compact scroll; new default props remain compatible
with existing login/plain forms. Error summary, first-invalid focus, dirty guards,
pending lock and uncertain no-replay behavior stay unchanged.

Consult current PrimeNG MCP Badge metadata before implementation. Required proof:
shared counter/CVA/accessibility/default compatibility and actual eight EN/AR,
light/dark,390/1440 Add/Edit cases with field order/one-column bounds, limits/badges,
clear/mock/pending/validation/errors, scroll/actions and no page overflow; full
Angular checks, retained login/shared form compatibility as appropriate. Complete
original command browser remains Required after layout changes. SQL-backed captions
remain canonical; no feature-local text map. No full Countries/pilot/host claim.

## D30–D32 — shared record feedback and keyboard correction

Requester additionally requires an edited-record flash, the edited row remaining
active, previous-row selection after archive and enabled keyboard navigation.
These are bounded shared collection/controller changes within the same active Web
correction; lifecycle command ownership and prior archive contract remain intact.

Reuse current Next MyDataGrid edited-row animation (1.2s twice, info/success themed
colors), Angular collection controller/focus request and existing row keyboard
handlers. Current PrimeNG Table metadata exposes no edit-result flash API; inspected
installed Table source has no corresponding native capability. Extend the shared
adapter, never introduce a feature-local animation or raw grid. Reduced motion uses
a brief static highlight. The shared ephemeral record request captures query/scope,
ID or previous global index and is consumed once only after authoritative ready
data; failed/uncertain/stale operations never emit success feedback. A repeated edit
of the same record creates a fresh request. Refresh does not replay an old flash.

Archive/bulk success selects the predecessor of the first removed row in display
order, crossing the server page boundary through the existing controller. First-row
fallback is first remaining row; empty collections have no active row. Keep filters
and server ordering; do not fetch all rows or invent an index for an edited ID that
is no longer visible in its current criteria/page. Active record navigation is
distinct from bulk checkbox selection, which still clears on successful mutation.

Share keyboard target resolution in Grid/Cards: up/down and logical left/right,
Home/End within page, Ctrl+Home/End globally, clamped PageUp/PageDown and Enter View.
Mouse row activation requests real row focus. Preserve Space selection, range
selection and native input/menu/dialog keyboard handling; never steal typing from
interactive descendants. Required meaningful controller/request/keyboard tests and
actual browser proof include edited focus/flash/replay expiry, reduced motion,
predecessor and page-boundary selection, keyboard page crossing and input isolation.

Verification-discovered shared focus edge: native Dialog onHide follows its leaving
animation. Its existing shared return-focus callback must preserve an already
focused outside input/refreshed row, while retaining ordinary trigger restoration
and nested-dialog barriers. Native focusOnShow is a separate opening behavior and
does not solve this closing race. Include a focused wrapper test and actual search
click/ArrowDown after closing View in the same bounded keyboard correction.

Latest requester refinement: leaving a row through keyboard navigation must remove
that old row's edit flash immediately; returning does not replay it. Exactly one
record remains active/focused. A stationary pointer must not leave a competing
hover tint on the old row while another row has keyboard-visible focus. Keep actual
bulk checkbox selections independent. Verify both Grid/Cards flash cancellation,
single active/focus and the rendered old hovered cell versus ordinary surface.
