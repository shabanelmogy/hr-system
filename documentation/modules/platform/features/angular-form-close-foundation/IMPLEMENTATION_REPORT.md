# S1-A5 — Shared local form-close and discard protection

Phase06: **Verified** on2026-10-29 for the exact bounded local kit. Global route,
company/year/module/session transition protection remains FOLLOW-014/015 and is
not implied by this proof. No business editor/API/schema/native UI changed.
Source baseline main a2c56412 plus preceding migration working-tree increments.

## Delivered behavior

FormCloseGuard is a public Shared adapter for caller-owned identity, monotonically
changing revision, active/open, semantic unsaved and pending state. LocalCloseController
opens one consent for the current draft, blocks busy/inactive/invalid owners,
closes a clean editor once, and accepts dirty discard only for the exact captured
identity/revision/token. Duplicate requests cannot stack confirmations. Keep editing
and Escape retain values. Changed identity/revision, becoming clean, parent close,
pending transition or destruction invalidate outstanding consent. A queued old click
cannot close a later draft. Owner callback must recheck its identity/revision.

Shared never resets or saves a form, never assumes form.dirty proves semantic
unsaved data, and never interprets cancellation as rollback. The caller compares
its baseline and resets it only after its accepted save. Failed save retains data.
FormContainer remains the sole validation/summary/first-error-focus/submit authority;
its checking state participates in caller close pending. Invalid Save stays enabled.

DialogPanel extracts the existing ChoiceDialog modal frame over actual PrimeNG
Dialog22.1.4. It owns bilingual title/description, header IDs, pending close/Escape,
modal/body append, focus trap, bounded dimensions/scroll and projected footer.
ChoiceDialog reuses it with its public selection/labels/events intact; callbacks
also reject hidden/busy/unregistered choices. New ConfirmationDialog composes
that same frame and Shared ActionButton. The safe Cancel action receives initial
focus; closing restores the originating control only when connected/enabled and
not behind another visible dialog. No feature-local form or dialog shell was added.

The development-only /dev/form-close neutral harness composes current FormContainer,
TextField/ReferenceField and Shared modal. It simulates explicit baseline/revision,
owner replacement, pending state, delayed success/error and nested long content.
Production route replacement excludes it. No fake entity CRUD or HTTP is present.

## Verification actually executed

| Gate | Actual result |
| --- | --- |
| Entry |309 registered Phase00 recipes and planning passed before runtime; exact bounded G0-G3/release-only G4 recorded |
| New unit coverage |11 tests across controller/component files: duplicate/clean/dirty/current/stale consent, busy/revision/identity/teardown, guarded existing choice and confirmation handlers |
| Final complete Angular check |31 files/138 tests;10 architecture/4 config; strict app/spec types, catalog/fonts/tokens and production build pass |
| Build |440.64kB initial /116.75kB estimated transfer; existing500kB initial warning budget retained |
| Browser matrix |40 cases:5 palettes×light/dark×EN/AR×390/1440; header/footer/ARIA/bounds/no page overflow |
| Final interaction refinement |8 complete cases after stable source: enabled invalid Save/field errors, keep/discard/Escape/Tab trap, stale owner/revision/pending, failed/successful save baseline, nested long-modal focus/scroll and top-dialog Escape |
| Retained browser regressions |Forms40, Reference8 focused, login10, context24, language20 pass |
| Network/native dialogs |Neutral harness zero /api/ requests and zero native dialogs; retained API reads are intercepted fixtures |
| Canonical |Four applied books/current manifest/recipes and portable results/captures regenerated and checked at closure |

API localization tests were not rerun: no canonical API catalog/resource changed in
this slice. Existing core captions are included in generated bootstrap only; catalog
fingerprint remains b5f21c3a41caf897daa75240d11a69b01a82011a8b913c72f99b592a4c744d8c.
No EF/domain change; DB migration/five business UI journeys/full API gates N/A.
Retained Next/native source is reviewed, no new runtime acceptance claimed for them.

## Source fidelity, findings and prevention

Next MyForm/useFormDialogState/DiscardChangesDialog and native useDiscardChanges
separate local close from global unsaved registry/navigation. The Angular adapter
preserves that boundary and strengthens stale consent by caller identity/revision.
It reuses the current Angular theme and PrimeNG shared frame. It does not copy the
MUI confirmation form/automatic Enter-to-confirm, xs width or warning-icon layout;
Cancel-first keyboard behavior and explicit discard are intentional generic adaptations.
ChoiceDialog scope/login regression10 passed after extraction; labels/layout remain
the existing Angular shared frame. Actual business forms remain later consumers.

The browser locator initially matched both the modal header Cancel aria-label and
footer Cancel. Scoping to shared dialog-actions resolves that test ambiguity without
changing user behavior. An early reference regression overlapped a live export edit
and dev reload; it was rerun after source stabilization and all8 cases passed.
Do not change a served module while collecting acceptance. An initial preview
request preceded server readiness; wait for actual listener before browser runs.
The interrupted first long browser process is superseded by complete40+final8 results.

Existing development NG0912 AuthenticatedApplication/ModuleWorkspace wrapper collision
and Node MODULE_TYPELESS fixture warning remain inherited; FOLLOW-015 owns the former.
They are not concealed by these focused passes. RISK-012 retained Next install drift
and PROD-002/017/019/RISK-018 release gates keep their separate scope/status.

## Reproduce and handoff

Run npm --prefix web-angular run check. Start the hosted-target preview normally;
set ANGULAR_PREVIEW_ORIGIN if using a nondefault test port, then run
npm --prefix web-angular run verify:form-close-browser, and repeat with -- --focused.
Driver defaults to https://localhost:4220; user preview normally uses4210.
Portable evidence is verification/; cache/logs are not required on another device.
No remote deployment, commit or push occurred. PrimeUI key/Cookies/secrets remain local.
Customer Education N/A technical S1; verified technical guide is in the central plan.

Primary references used: [PrimeNG Dialog](https://primeng.dev/dialog),
[Angular input contracts](https://angular.dev/guide/components/inputs),
[Playwright actionability](https://playwright.dev/docs/actionability) and
[locator scoping](https://playwright.dev/docs/locators). Actual installed types/source
and executable cases, rather than documentation alone, prove current behavior.
