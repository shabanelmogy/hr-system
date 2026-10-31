# Technical review — local form close/discard

Created after Phase06 Verified2026-10-29. Customer Education N/A technical S1.

Open /dev/form-close in a development preview. Clean Cancel closes immediately;
edit a field then Cancel opens bilingual confirmation. Cancel/Escape retains the
draft and returns focus. Discard closes only that current draft. Invalid Save
shows existing field errors and focuses the first; saving disables local close.
The neutral toolbar simulates changed draft/owner/pending after confirmation,
failed save, successful baseline reset and a nested long-content editor. These
controls are technical fixtures and excluded from production.

Consumers use FormCloseGuard through Shared public API and supply identity,
monotonic revision, active, semantic unsaved, pending and guarded close callback.
Do not derive semantic changes only from form.dirty. Include form checking in
pending. Owner successful save updates its baseline; Shared never resets data.
Existing FormContainer/TextField/ReferenceField remain form authority.

This is local close only. App routes, company/year/module/session transitions and
forced reload are not protected by installing this component; use their next exact
contract. No browser native alert/confirm or new persistence is introduced.

Report/evidence: documentation/modules/platform/features/angular-form-close-foundation/.
Run npm --prefix web-angular run check and verify:form-close-browser; use
ANGULAR_PREVIEW_ORIGIN for your preview URL and -- --focused for final8 cases.
