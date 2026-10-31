# S1-A4 frozen generic reference field contract

One shared single-value ReferenceField, shared form-field lifecycle/discovery and
a dev-only form harness. No business lookup service, entity mutation, new API,
schema, grant, native UI, multi-select, tree/date/repeater or dirty editor here.
G0-G3 fixed for this technical kit. Remaining G4 release/resource checks are
PROD-002/017/019/RISK-018; retained Next environment drift remains RISK-012.

## Reuse and public surface

OptionSelect is a controlled string preference/context widget with external commit;
it cannot safely become a business CVA without mixing header and form lifecycle.
ReferenceField uses the same adopted PrimeNG Select and theme internally, existing
TextField for remote search, ActionButton/FeedbackState for controls. Extract a
generic internal FormFieldControl base and shared field chrome so TextField and
ReferenceField share NgControl observation/errors/server-error clearing, touched,
readonly/disabled guards and public focus. FormContainer discovers this generic
field token instead of hardcoding TextField. Preserve current TextField DOM/layout.
This is a generic backward-compatible extension; no second form/summary shell.

Public ReferenceId is string|number (nonblank string or finite safe integer;0 is
valid), scalar value ReferenceId|null. Typed options: value,label,disabled?,description?.
No All=0 sentinel, no loose string/number equality, no arbitrary objects or free text.
Single selection and optional clear Required. Multiple/chips/deep hierarchy are
Deferred FOLLOW-014; no inactive placeholders or vendor multi-mode forwarding.

## Caller and source ownership

Caller owns trusted opaque scopeKey including parent/context generation, committed
search, cancellation/debounce, page accumulation, selected-value resolution, API
mapping/runtime validation, permissions and dependency validators. Shared emits
search text, loadMore, retry; performs no HTTP, cache, entity lookup or list filtering.

Source envelope: query{scopeKey,search},kind loading/ready/error/forbidden,result?
with the exact repeated query, readonly options and hasMore. searchText is a controlled
input updated immediately by caller; only matching ready result for current source
and searchText supplies selectable options. Scope/parent/search replacement masks
old options synchronously. Invalid/duplicate IDs become generic error feedback.
Finite static options use the same ready envelope with hasMore=false and searchable=false;
the caller must document the actual bounded endpoint, never silently truncate.

Selected envelope independently repeats scopeKey and scalar value, with kind
loading/ready/missing/error and optional resolved option. It survives changing
search/pages in the same scope. A mismatched scope/value never supplies a caption.
Unknown/missing values never render a fabricated raw ID label. Never clear/normalize
valid form data simply because options change; parent/scope reset is an explicit
owner operation. Archived/missing dependency business validation remains owner-owned.

PrimeNG Select22 only renders selectedItem for an option it can resolve. Retain
an off-page/current/unresolved selection as a clearly labelled disabled display
option, never a selectable result or a fake remote page record. Shared handlers
only accept IDs present in the current ready result and not disabled. This also
guards queued vendor events after context/read-only/permission replacement.
Typed selected captions render as text, not HTML. Selected envelopes cannot grant access.

## Form and accessibility

CVA writeValue is silent; preserve typed ID; reset null, touched/dirty/disable/enable
follow Reactive Forms. Required semantics/other dependency rules remain validators.
Save remains enabled when incomplete; submit marks all fields touched, renders
specific messages beneath the field, summary links focus the first invalid field.
Read-only preserves display and blocks selection/clear; disabled follows form state.
Clear can intentionally create a required error. Server error clears only on an
accepted user edit; rejected/stale/disabled choices cannot mutate or clear errors.

PrimeNG Select provides combobox/listbox/keyboard semantics. Search uses existing
TextField IME handling in a header, vendor local filter disabled. Keyboard Tab,
Arrow/Enter/Escape and focus return must be measured; header search must not submit
the outer form. Retry/load-more remain visible accessible actions. Close open
panel on scope change, read-only/disabled/forbidden transition and destruction.
Labels/help/error aria-describedby/invalid/required, long text,390/1440px EN/AR,
light/dark and canonical palette/field colors Required. Body overlay remains bounded.

## Current source/API evidence and exclusions

Next MySelect uses typed option normalization/RHF and explicit ID equality but has
an optional All=0 convention not suitable for generic entity IDs. Native AppSelectField
already models parent search/loadMore/error and form-field messages. Current States
form consumes Country lookup. Countries /lookup is an unpaged active-only array;
States /lookup?countryId is parent-scoped; detail endpoints have separate contracts.
Do not invent remote paging/search support for these lookups or replace them with
management lists. Actual States + another typed business consumer remain ERP-02/S3
acceptance; this technical harness cannot close those gates or ERP-01 codegen.

Web: single field/form integration, finite/remote controlled envelope, selected
resolution, search/loadMore/feedback/accessibility Required. Native new UI Excluded,
retained source reviewed. Business CRUD/reports/import/export/offline/stateStorage
Excluded. Multi-select/date/repeater/dirty cases remain FOLLOW-014, no placeholders.
No DB/schema change, so migration and five domain UI journeys N/A on both clients.

## Verification and entry

Phase00 four books/current-only manifest/recipes and current planning checks before
bounded authorization. Pure tests validate typed IDs/envelopes/stale scope/search/
selected resolution. Component/form tests verify silent CVA writes, form reset/
disable/read-only, accepted/rejected edit, errors/summary/focus and async patches.
Dev-only harness simulates remote search/append/retry/forbidden/missing/archived,
selected off-page and parent scope. Browser EN/AR/light/dark/390/1440, keyboard,
overlay scroll/focus, rapid search and stale callbacks, load more and two independent
fields. Existing forms40/login10/context24/language20 regressions run as applicable.
Full Angular check and actual generated catalog/policies before Phase06 Verified.
New captions use canonical core EN/AR generator; strict catalog/SQL ownership stays.
No hosted SQL compatibility claim without matching API deployment (PROD-019).
Customer Education N/A technical S1; technical handoff only after Verified.
