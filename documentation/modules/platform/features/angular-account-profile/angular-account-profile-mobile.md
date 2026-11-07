# Angular own-account — retained Mobile profile

## 1. Scope

Angular-only migration; no new Mobile runtime/API/domain/schema change.

## 2. Source

mobile-react/src/platform/auth remains the native account/session owner.

## 3. Ownership

Platform identity remains authoritative. This child adds an Angular consumer.

## 4. Data

Existing profile/photo/password contracts unchanged.

## 5. Capabilities

New native Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded;
existing native own-account behavior retained.

## 6. Transport

Native transport unchanged; browser Cookie/CSRF is not copied into native code.

## 7. UI

No new native controls or wrappers in this slice.

## 8. Lifetime

Existing authenticated session ownership retained.

## 9. Validation

Server authoritative; no native policy/schema changes.

## 10. Offline

Existing policy retained. No password outbox/queued writes.

## 11. Localization

No new native texts required for Angular-only work.

## 12. Verification

Retained-source impact review; device tests only if native source changes.

## 13. Operations

No native release or remote account mutation.

## 14. Preflight

Both native account/password screen rows explicitly Excluded for new work.
No domain/API change requires new structured-data native UI.

## 15. Handoff

The bounded Angular account runtime is verified in the owning final receipt.
Native ProfileScreen/profile-endpoints were reviewed and retained. This is not
new native device acceptance or whole-Super-Admin completion.
