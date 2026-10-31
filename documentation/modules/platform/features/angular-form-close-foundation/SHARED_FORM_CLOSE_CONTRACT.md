# Frozen S1-A5 local form-close / discard contract

This is one local form-close technical kit. No business CRUD/API/schema/grant,
global route guard, company/year/module/session transition registration, request
cache, attachment deletion, persistent draft or native UI is added. FOLLOW-014/015
retain global unsaved workflows and other editors. This file freezes a target;
runtime is still blocked until exact bounded entry after registered Phase00 checks.

## Source evidence and reuse decision

Next MyForm composes its shared FormContainer/Header/Content/Footer. FormContainer
delegates local dirty/submit/close to useFormDialogState, composes DiscardChangesDialog,
and separately registers with UnsavedChangesContext. The latter owns document links,
history traversal, beforeunload and app-wide requestDiscard. Those are different
lifetimes from local form close. Native useDiscardChanges blocks busy close and
owns local keep/discard state. These are retained source, not new Angular proof.

Angular FormContainer already owns submit/async validation/duplicate guard, fields,
summary/error/focus and local busy rendering. ChoiceDialog is an actual scope-option
PrimeNG Dialog with selection/reset and Continue; it is not a business form/confirmation
shell. No existing generic confirmation/dialog shell or unsaved registry was found
in current shared/ui. Keep ChoiceDialog public contract and session callers intact.

Generic reusable extension: extract the existing common modal frame into a shared
DialogPanel (title/description/open/pending/close and projected content/footer).
ChoiceDialog consumes it without selection/public behavior changes. A new generic
ConfirmationDialog composes that same frame and ActionButton; local form-close
adapter composes the confirmation and current FormContainer. Do not create a local
dialog look-alike or fork the form summary/submit system. Reuse AppIcon/tokens/locales.
No generic form editor dialog beyond this close/confirmation composition is implied.

## Local state and consent

Caller supplies an opaque editor identity, monotonically changing draft revision,
active/open, unsaved semantic state, pending operation state and final close callback.
Caller owns baseline equality and successful-save reset. Form.dirty alone cannot
prove semantic unsaved data. Shared never clears a form or mutates domain draft data.

requestClose: inactive or pending returns false; clean active emits one close;
dirty active opens one owned confirmation. Repeated close requests cannot stack
dialogs or close twice. Keep editing closes confirmation only. Escape/close control
on confirmation means keep editing. Confirm discards only for the captured identity
and revision, still active, still same unsaved draft and not pending; otherwise no
close. The caller's closing identity must still match at callback time.

Any identity/revision replacement, parent close, destroyed component or pending
transition invalidates outstanding consent and closes the confirmation. If data
becomes clean during a prompt, cancel the stale prompt; a new explicit close can
close the clean editor. A late click/output from an old dialog cannot affect a new
draft. Do not reset a new draft or accept an old confirmation across a later edit.

Pending save blocks all local dismissal and duplicate discard. Field validation
checking is pending for close decisions. Invalid Save stays enabled and uses the
existing FormContainer messages/focus. Submit failure retains draft/close state;
only owning successful-save callback updates the baseline. Cancellation does not
prove rollback, no automatic retry/replay is added. Readonly/clean view may close.

## Modal, keyboard and scroll contract

Actual PrimeNG Dialog owns modal/focus-trap semantics, header ID, z-index and bounded
viewport. Shared frame consistently controls close/Escape/mask according to pending,
body append, block-scroll, responsive maximum dimensions and content/footer slots.
Explicit cancel/keep button is the initial safe focus in discard confirmation;
destructive action must never auto-fire on opening Enter. Escape keeps editing.
Close/return focus must work when launched inside an editor or an existing dialog;
disabled/busy buttons remain guarded in handlers. Reuse Shared ActionButton focus().

On390/1440 EN/AR/light/dark and all palettes, heading/footer remain reachable,
long content scrolls inside modal, no page-wide overflow, focus stays within top
dialog and returns to originating close control when keeping. Final accepted close
lets owner choose its next focus. ChoiceDialog existing scope selection/keyboard/
pending/login behavior must remain measured after shell extraction.

## Localization and target fixture

Reuse existing messages.unsavedChangesTitle/unsavedChangesConfirm/discardChanges,
actions.cancel/close from canonical core EN/AR. Add new captions only if actual
behavior requires them, through current catalog generator and strict matching.
SQL override persistence remains current mechanism; no new text store.

Only a development-excluded /dev/form-close neutral harness is permitted after
runtime entry: existing FormContainer/TextField/ReferenceField, explicit dirty
baseline/revision, delayed save/error and owner replacement controls. It verifies
local close outcomes, not a business entity or application routing. All business
Grid/Cards/Tree/Chart/Report/Import/Export/offline views Excluded; technical form and
confirmation Required on Web. Native new UI Excluded; existing implementation retained.
Global navigation/context/forced browser reload are Deferred under FOLLOW-014/015;
no native beforeunload/alert/confirm is introduced to simulate them.

## Required verification after exact runtime entry

Pure controller tests: clean/dirty/keep/discard, duplicate requests, changed identity/
revision, pending transitions, teardown, one close only. Component tests: confirmation
handler guards, modal Escape/cancel, existing text/reference errors and enabled invalid
submit. Browser40 palette/mode/language/390-1440 geometry plus8 full flows: validation,
keep/confirm, stale draft/owner/pending, async save error/success and nested focus/
scroll. Existing forms40/reference focused8/login10/context24/language20 regressions
as affected by shared shell extraction. Full Angular check and catalog/central docs.
API localization tests only if generated resource changes. No live business or native
journey claim from fixture. Phase06 before technical education and closure.
