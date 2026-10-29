# Platform Browser Authentication — Applied mobile Profile

## 1. Ownership
Existing native remote auth and secure-session owner consume Platform bearer contracts.
## 2. Approved scope
New native Cookie transport/UI Excluded; shared-session regression Required for S0-AUTH-R1 adapter repair; no native wire change.
## 3. Domain
Session/company truth remains Platform; native cannot grant authority locally.
## 4. Rules
Preserve selection/refresh/switch/logout wire and secure-storage policy.
## 5. Client decisions
Every new visual view Excluded; no native conversion/Cookie fallback.
## 6. Contracts
auth-endpoints.ts/auth-remote-data-source.ts remain current evidence; JSON bearer retained.
## 7. UI composition
No new form/screen/navigation; existing shared native shell unchanged.
## 8. States
Existing offline lease/error behavior retained; no new offline capability.
## 9. Scope and security
Native header-only clients require no browser Origin/CSRF token; server validation remains authoritative.
## 10. Persistence and side effects
No native schema/storage/data migration; context reset revalidated if shared auth changes.
## 11. Verification
Current R2 native auth data-source regression passed (one test: switch waits for refresh). Existing bearer wire unchanged; actual device evidence remains later. See verification/BROWSER_IMPLEMENTATION_REPORT.md. No native runtime source changed.
## 12. Reuse
Reuse current native auth owner; no parallel browser repository.
## 13. Localization/accessibility
No new native strings/layout/RTL/style edits.
## 14. Delivery
Mobile stage Queued after Web Verified; focused retained auth regression passed for the current API increment, device acceptance pending.
## 15. Evidence and closure
Existing native source/tests in manifest; no native runtime or Phase 06 closure claim.
