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

Required: retained native bearer response/session parser compatibility for explicit system scope. Excluded: new native system administration screens and offline system access. Saving a system session clears the old offline pointer and never writes a company-scoped offline lease. Existing company offline behavior remains covered.

## 6. Contracts
auth-endpoints.ts/auth-remote-data-source.ts remain current evidence; JSON bearer retained.

2026-11-09 corrective system-session increment (FOLLOW-032): eligible Super Admin authenticates without any Tenant or company. Canonical current contract and verification boundary: [system-session execution](SUPER_ADMIN_SYSTEM_SESSION_2026-11-09.md). This supersedes earlier company-only descriptions for this actor. Hosted rollout remains PROD-034; repository documentation baseline remains FOLLOW-033.

## 7. UI composition
No new form/screen/navigation; existing shared native shell unchanged.
## 8. States
Existing offline lease/error behavior retained; no new offline capability.
## 9. Scope and security
Native header-only clients require no browser Origin/CSRF token; server validation remains authoritative.
## 10. Persistence and side effects
The 2026-11-06 Hangfire embedding correction affects the browser transport only.
The dashboard remains excluded from native UI; bearer-only and realtime transport
remain unchanged. See [corrective evidence](verification/HANGFIRE_EMBEDDING_REPAIR.md).

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

System-session source, regression tests and current portable verification are registered in required-files.json. Historical R1/R2 receipts do not prove this correction; see SUPER_ADMIN_SYSTEM_SESSION_2026-11-09.md for its actual gate results.

## Current hosted runtime/key and Hub query correction — 2026-11-07

The supplied render503 is reproduced as CrystalReport.RuntimeUnavailable. The
downstream Crystal service itself returns crystal_runtime_api_key_not_configured.
The existing Publish preparation/configuration scripts restore matching private
transforms locally; actual WPP and SDK publish staging confirm both keys, enabled
integration and the correct HTTPS target. No remote deployment or native PDF is
claimed. The same investigation reproduces IIS's2048/2049query boundary with
synthetic tokens. ERP web.config now provides a finite24576envelope only for
hubs/company; other filtering/auth/CORS remains intact. Full API1342tests pass
with3existing opt-in skips, local IIS4cases pass and final script format passes.
Next/native APIs and permission semantics are unchanged; no new native screen or
database/migration is introduced. This supersedes the unsupported expiry diagnosis.

Canonical reproduction, repair, rollout and portable evidence:
documentation/modules/reporting/features/global-crystal-template-manager/RUNTIME_KEY_REPAIR_2026-11-07.md.
Publish Crystal site38634-WebDeploy (Release/x64) then ERP site84639-WebDeploy.
PROD-028/029 and PROD-003 retain real deployed/runtime acceptance requirements.
