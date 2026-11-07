# Tenant Administrators acceptance — 2026-11-06

Phase06: **Verified within the authorized Angular client contract**. Phase07:
Arabic customer education complete. Parent Super Admin goal remains Active.

## Actual implementation and source comparison

Reference: current web-next TenantAdminManagementPage/AdminCard/TenantAdminForm,
existing TenantAdmin API/Identity adapter and frozen S4-A2 contract. The client
provides the complete unpaged Cards list; first/last/username/email/password,
multiple Tenant assignments/default and edit-only disabled state; fresh detail;
create/update and explicitly confirmed archive. Disabled precedes locked, then
active. Default repairs to first remaining selection; unavailable saved IDs are
retained until explicitly removed. No Grid/search/pager/report/import/export or
restore UI is invented.

Shared CardList fit layout/minCardWidth320 reproduces source auto-fit320 arrangement;
its defaults remain unchanged. Shared Angular header/card/field/action presentation
and inner scroll follow requester-approved shared-first, compact-header/no-outer-scroll
rules; MUI wrappers are not copied. Same-viewport Next source was actually served
from current source, not a screenshot mock. Reference8captures and Angular8captures
cover both languages/modes/widths. Representative pairs were visually inspected.
The whole-Super-Admin final field/action/visual audit remains a separate Required
parent deliverable and is not claimed closed by this child.

## Checks and observed fixes

- Full npm run check:772tests/142files;30architecture/4configuration; format,
  typed lint, catalog/tokens/fonts/types and production build pass. Initial578.42kB,
  estimated transfer148.32kB; unchanged500kB warning remains RISK-020.
- Browser8positive and32negative cases pass. Positive covers statuses/default chips,
  all fields, keyboard MultiSelect, default repair, dirty consent, create, fresh
  edit/blank-password omission, disabled update, delete cancel/confirm and overflow.
  Negative covers read-only/list/lookup/detail403/recovery, duplicate email/username,
  password/seat/field errors, pending/uncertain and rejected mutations/deletes.
- Existing Tenant Management, States and Districts each pass a fresh full-journey
  smoke regression after the shared CardList extension.
- Hosted read-only: collection200/1record, detail200, complete Tenant lookup200/1record,
  owned session logout204. No business mutations.
- Independent scoped source review and visual follow-up: no unresolved P1/P2.
- MCP validates MultiSelect usage metadata, not runtime layout or accessibility.
  Actual browser proves focusable combobox error/help/invalid/required association.
- Browser lifecycle correction waits for the body-attached listbox to leave before
  reopening. Current official MultiSelect docs describe ArrowDown opening and Escape
  closing/focus return: https://primeng.dev/multiselect. This was a harness race.
- A local display:block override displaced vendor chips/dropdown. Geometry assertion
  failed before removing it and passed afterwards. Source auto-fit card geometry
  also has an observed failing/passing browser check. No vendor patch or engine.
- Reference harness now waits for current Next app readiness and matches its actual
  dialog accessible name including subtitle/close; no Next runtime change required.
  The local reference fixture has no SQL localization runtime/user-photo endpoint;
  those requests use existing bundled-caption/photo fallback. This comparison does
  not claim hosted localization publication or account-photo acceptance. The owned
  temporary Next/fixture servers were stopped and generated Next type-path changes
  were restored after captures.

## Five-point UI audit and scope

| Journey | Angular | Existing native |
| --- | --- | --- |
| Create | All8draft fields through dedicated inputs; disabled switch edit-only | Retained; new native work Excluded |
| Edit | Fresh detail, blank password omitted, selected/default assignments retained | Retained |
| View | Cards display identity/status and default Tenant chips | Retained |
| List/filter | All getAll records, no invented page/filter controls | Retained |
| Mock generator | Excluded by actual source; fixtures are test-only | No new generator |

No account creation/password reset/archive on hosted data, schema/migration,
production publication or native-device acceptance. PROD-019 catalog publication,
PROD-028/025 reporting and RISK-020 remain external exact scopes. No commit/push/merge.
Portable JSON/captures/source hashes live in verification/; raw local logs in
.codex-tmp/tenant-admins-*. Final parent audit and operational siblings remain Required.
