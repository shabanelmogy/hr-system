# Company UI localization — mobile

Mobile implementation status: Implemented; automatic verification passed. Physical native acceptance remains deferred.
## 1. Ownership
Mobile owns the Expo Clean Architecture route, remote adapter, queries, list/cards/forms and runtime overlay.
## 2. Scope
Mobile uses the single registered `mobile:translation` catalog source and EN/AR overlays only.
## 3. Contracts
The client uses the shared scoped API contracts and does not send tenant/company identifiers.
## 4. Querying
Current-company query keys and invalidation are required; no durable offline override cache is permitted.
## 5. UI composition
Required composition is `AppListScreen`, table/cards, `AppForm`, shared confirmation/feedback and bounded server paging.
## 6. Permissions
The screen must distinguish View/Edit/Reset/SetDefault and preserve server authorization as authority.
## 7. States
Loading, empty, error/retry, conflict, dirty edits, read-only and transient runtime failure are required.
## 8. Runtime overlay
Apply only matching authenticated company runtime data; reset before switch/logout and discard stale requests.
## 9. Resource registration
Scope correction: generated key-level ownership guards the mixed translation namespace before applying any company overlay. Countries/States/Districts, Super Admin dashboards and tenant-management keys retain their shipped values; shared controls, Address Types and tenant users/roles/permissions stay eligible. The screen consumes API-filtered sources and resets a removed selection without sending that excluded source. No new route or styling shell is introduced.

The composed EN/AR translation baseline must be restored before applying registered override leaves.
## 10. Language/RTL
Explicit user choice precedes company default then English; direction follows the established localization provider.
## 11. Testing
Scope-correction verification: runtime/source focused tests pass naturally (2 suites/7 tests with open-handle detection), typecheck and architecture/contracts/i18n/foundation/release-source checks pass. Broad lint reports the same six pre-existing LedgerSetupResourceScreen errors tracked as FOLLOW-006. This correction adds no native API/style and does not claim physical acceptance.

Ten focused suites/28 tests, typecheck, architecture, contracts (84 routes/31 files), i18n (6,805 keys), foundation, release and Android export passed. Full Mobile check has only the six pre-existing Ledger lint findings (FOLLOW-006); the full suite has 173 passing suites and one inherited OfflineOperations native-binding failure (523 passing tests).
## 12. Device acceptance
Native acceptance is explicitly deferred to PROD-026.
## 13. Intentional differences
Mobile cards are Required for the bounded text comparison; Web cards are Excluded.
## 14. Delivery
Mobile automatic stage is complete; Phase 06 is Verified for the authorized automatic scope and is not physical-device acceptance.
## 15. Evidence and closure
FOLLOW-006 remains an inherited full-mobile gate item; it is not a feature pass or failure claim.



Navigation reconciliation (2026-10-18): the existing company configuration destination is grouped under Settings, independent from Administration operational viewers. Physical route, exact permissions, company scope and save/dirty contracts are unchanged. Mobile Settings parent is reachable for a user holding a configuration-child view grant; the child remains separately guarded. Navigation evidence: documentation/modules/platform/features/error-logs/error-logs-evidence.md.

## Settings workspace reconciliation — 2026-10-19

The requester supersedes the earlier independent Settings section: Administration now contains one Settings destination and its existing configuration workflows are actual shared tabs. Web /administration/settings uses FormTabs; Mobile /settings uses AppFormTabs and retains local device preferences. Child authority, services, edit forms, scopes, read-only and revision/conflict behavior remain owned by this feature. Error Logs viewers stay Administration siblings; retention remains a system-only tab. Existing direct child URLs remain compatible. No API/domain/schema change or migration. Current composition and acceptance are canonical in ../platform-settings/platform-settings-review.md and platform-settings-evidence.md; older dated navigation descriptions are historical.

System UI extension (2026-10-19): the catalog protocol is now version 3 and includes explicit nullable systemPermissions per registered entry; authority metadata participates in client fingerprints. Company/shared/system eligibility and actor-derived company contracts remain unchanged. The existing editor/controller and runtime registry support a separately authorized global mode/layer, documented by feature system-ui-localization; global responses never simulate company scope. Additional Web criteria use shared MyDataGrid.toolbarFilters, and native Table/Cards/forms retain their shared composition. New global scopes/labels are excluded from company customization. Publish matching API/Web/Mobile catalog artifacts together.
