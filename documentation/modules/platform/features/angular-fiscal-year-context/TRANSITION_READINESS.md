# Accounting working-year context — current transition readiness

Source and API semantics are verified. GET/PUT fiscal-years/context require exact
FiscalYears:View plus TenantMember. PUT accepts only fiscalYearId and preserves
personal preference in read-only subscription mode. Available means nonarchived,
including Draft/Closing/Closed/Locked years; do not add an Open-only selection
rule from the separate SetCurrent workflow. Company Current is a default, not a
mandatory effective personal selection. Choosing Current clears an override;
null restores the default in the API, but the current Next menu exposes actual
years only. Do not invent a reset menu item merely because null is supported.

Store ordering is descending start date/id. The effective selection is a valid
personal choice when it differs from company Current, otherwise Current. An
archived/missing override falls back. Context is scoped by trusted tenant,
company and actor, not caller-provided scope. The handler holds an existing
per-user/company resource lock and Accounting unit-of-work transaction.

Preflight proof 2026-10-29:

- Existing controller + company isolation suite passes 17/17; Next service/query
  2 files/7 tests, native use-case/remote boundary 2 files/10 tests pass.
- Actual existing local API/SQL admin has two available years and a Current.
  Cookie GET200, PUT another existing candidate, subsequent GET persistence,
  restoration of original effective selection/override, unknown candidate400
  preserving the context and actual logout204 all pass. No fiscal year was
  created, company Current changed, or original preference left altered.
- This is API readiness, **not an Angular fiscal-year control implementation**.
  Redacted receipt is verification/api-preflight.json. Existing Fiscal Years
  source's pending customer acceptance remains independent; no full-feature
  closure is inherited from that reference.

The proposed runtime composition is fixed for review:

1. Accounting-owned typed contracts/service/state and public header component
   live under Angular modules/accounting. The root authenticated route composition
   supplies a component via a generic Shell injection token/slot. Shell and Shared
   import no Accounting business DTO/service. Keep Accounting lazy with the
   authenticated assembly, preserving the initial bundle budget.
2. Reuse externally committed Shared OptionSelect, ContextBadge and FeedbackState.
   Extend only generic empty-label/invalid presentation if needed. Use actual
   calendar icon, warning tone, bilingual name fallback, current annotation or
   DateOnly interval. Load the accounting namespace independently with a finite
   caption boundary. No local look-alike control/native alert/HTML validation.
3. Reuse one AuthSession serialization barrier for company/logout/year operations.
   A generic caller operation can request a trusted context transition without
   supplying a new Session or grants. Platform pauses readIdentity and protected
   content, retains last verified header, clears scoped text and excludes other
   auth mutations. Accounting performs one PUT, reconciles a failed reply by GET,
   and never repeats a possibly committed write. Platform independently rereads
   session and renews CSRF/localization before publishing resumed identity.
4. Success requires confirmed selected year plus unchanged verified actor/tenant/
   company. Another-tab scope change installs only verified API truth; the old
   year's response is discarded. A known restored old context displays a finite
   translated error; unverified outcome keeps protected work unavailable and
   returns to login. Validate raw DTOs, actual dates/status range, unique IDs,
   selected/current membership and override consistency before presentation.
5. Accounting owns its header snapshot and invalidation. Protect stale results
   with trusted identity/generation; retain the prior header value only during a
   transition for the same verified scope. Existing invalidation-only channel
   can trigger session/read refresh in other tabs after a year operation, without
   carrying a trusted year ID. Focus/visibility also refetch actual context.
6. No current editable protected route exists. FOLLOW-014 is a hard prerequisite
   before future business drafts join this barrier; retain native dirty registry.
   Fiscal-year CRUD/lifecycle/SetCurrent/reporting is Excluded from this child.

Historical Phase00 entry gate, fulfilled before runtime: canonical four applied books and manifest
registered/generated; current planning/docs checks; an explicit reviewed state
contract for the generic barrier and root slot, including disposal, uncertain
outcome and company/logout races. Only release G4 items PROD-002/017/019/RISK-018
may remain at bounded entry. Phase06 remains unverified until actual Angular UI,
fixture/live persistence, scope/tab and retained regressions pass. No education
document is authored before that acceptance.

Execution update 2026-10-29: exact bounded runtime was authorized after this gate
and STATE_CONTRACT. Phase06 is now Verified: Angular99/architecture7,
production15 and actual Angular/API/SQL/tab/reload/restoration pass. Final report,
manifest, receipts and later education supersede the preflight-only status above.
