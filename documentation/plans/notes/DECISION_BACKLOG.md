# Decision Backlog

Use this registry for cross-plan decisions whose status must remain centrally
traceable. Open decisions may intentionally remain unresolved when they do not
block the current slice; resolved decisions stay indexed when other plans or
surfaces still depend on the recorded outcome. An open decision that blocks a
Required capability prevents an `Implementation Ready` status for that scope.

| ID | Surface | Topic | Question | Owner | Blocking? | Status | Decision trigger / due | Related plan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEC-025 | Cross-platform | Angular direct API architecture | Requester explicitly rejected BFF and unnecessary complexity on 2026-10-28. Angular calls existing .NET API directly; no new gateway/YARP/Redis/session-store requirement. Existing Next handlers remain Next-only. | ERP owner + API/Security + Web Architecture | No — direction resolved; DEC-027 binds actual auth | Closed | Reopen only on an explicitly approved architecture change | `web-angular-migration` |
| DEC-027 | Cross-platform | Angular direct authentication binding | D17 API Cookies implemented and verified in R1/R2: actual password/select/reload/expiry/refresh/switch/logout, origin/CSRF/JWT/live SQL and retained bearer isolation; final Release 1157 passed. | API/Security + Web Architecture | No — bounded API contract/proof resolved; Angular consumer/deployment remains separate | Closed | Reopen only if browser transport/security/hosting topology changes; consume verified contract for Angular foundation/login | `web-angular-migration`; `documentation/modules/platform/features/platform-browser-authentication/verification/BROWSER_IMPLEMENTATION_REPORT.md` |
| DEC-026 | Web | Screen pattern identifier collision | Resolve Active P-008 Global Scoped Context Selector versus Candidate P-008 Transactional Document and register unambiguous Angular adaptations. | Documentation owner + Web Architecture | Yes — affected UI contracts | Open | Before binding affected Angular screen contracts; unrelated source behavior is unchanged | `web-angular-migration`; `documentation/guides/shared/SCREEN_PATTERN_CATALOG.md` |
| DEC-021 | Cross-platform | Direct user permission grant scope | Resolved 2026-10-17: direct business permission grants are company-specific within the Tenant and add to inherited roles; requester explicitly authorized implementation of this recommendation. | Product + Platform | No — resolved | Resolved | Reopen only if Tenant-wide direct grants or direct deny becomes a new requirement; see `documentation/plans/business/platform-user-permissions-and-company-localization/SPEC_SUMMARY.md` | `platform-user-permissions-and-company-localization` |
| DEC-001 | Cross-platform | HR MVP scope | Does the first HR MVP include Leave only or Attendance as well? | Product + HR | Yes — affected HR expansion | Open | Before expanding the HR MVP scope | `enterprise-saas-core` |
| DEC-002 | Cross-platform | Payroll ownership | Is Payroll a first-party product capability or an integration with an external provider? | Product + Accounting/HR Architecture | Yes — payroll stream | Open | Before Payroll planning starts | `enterprise-saas-core` |
| DEC-003 | Cross-platform | SaaS billing model | Are Enterprise contracts handled manually or through self-service billing? | Product + Platform/Accounting | Yes — commercial/billing stream | Open | Before billing/subscription monetization implementation | `enterprise-saas-core` |
| DEC-004 | Mobile | Mobile product boundary | Is Mobile Employee Self-Service only, or must it support full administration? | Product + Mobile | Yes — mobile expansion | Open | Before broad admin surfaces are added to Mobile | `enterprise-saas-core` |
| DEC-005 | Cross-platform | SSO provider | Which provider is first: Microsoft Entra ID or generic OIDC? | Product + Platform Security | Yes — enterprise SSO | Open | Before enterprise SSO implementation | `enterprise-saas-core` |
| DEC-006 | Cross-platform | Countries/data governance | Which countries, data-residency obligations, and legal retention requirements are targeted first? | Product + Security/Compliance | Yes — country rollout | Open | Before external country rollout or retention commitments | `enterprise-saas-core` |
| DEC-007 | Cross-platform | Accounting launch jurisdiction | Which jurisdiction(s), statutory accounting rules, financial-record retention obligations, and mandatory document/chart constraints apply to the first Accounting production launch? | Product + Accounting + Compliance | Yes — jurisdiction-dependent Accounting release | Open | Before jurisdiction-dependent Accounting production launch | `accounting-core-gl` |
| DEC-008 | Cross-platform | Accounting book and currency model | One functional currency and one primary book per company in V1; multi-currency transactions use historical rate series plus applied-rate snapshot; optional reporting currency translates from history/policy at report time; no stored reporting amount per journal line; additional adjustment books deferred. | Accounting Product + Architecture | No — resolved for Core GL V1 | Resolved | Reopen only if true parallel books or stored reporting ledger becomes Required | `accounting-core-gl` |
| DEC-009 | Cross-platform | Branch and intercompany balancing | Branch remains analysis/authorization context in Core GL V1. Branch-balanced ledgers and intercompany auto-balancing are Deferred. | Accounting Product + Architecture | No — deferred capability | Resolved | Reopen when interbranch/intercompany becomes Required | `accounting-core-gl` |
| DEC-010 | Cross-platform | Accounting separation of duties | Approval is configurable per journal; self-approval defaults Blocked with optional Allowed/AllowedWithOverride; Approve/Post are separate permissions; flexible versioned policies; reopen/late-posting is separately authorized, reasoned and audited. | Product + Security + Finance | No — baseline resolved | Resolved | Reopen for stricter jurisdiction/company policy | `accounting-core-gl` |
| DEC-011 | API | Mediator library | Stay on MediatR 12.5.0 (last release before the commercial licence model), move to an MIT source-generated mediator, or use an in-house dispatcher over the existing pipeline behaviors? | Owner + API Architecture | No — until a MediatR upgrade is needed | Open | Before any MediatR upgrade or the second product | `erp-platform-template` |
| DEC-012 | Cross-platform | JWT issuer/audience rename | The example configuration now uses `ErpSystem` / `ErpSystem.Clients` (2026-10-06). When do live environments still configured with `HrManagementSystem` / `HrManagementSystem.Clients` switch: now (every session signs in again) or in a planned release with dual acceptance? | Owner + Platform Security | No — cosmetic until release | Open | Next planned production release | `erp-platform-template` |
| DEC-013 | Cross-platform | Commercial libraries in core | Which of Syncfusion (API + web), Mescius ActiveReportsJS, Crystal Reports generator and EFCore.BulkExtensions stay in core, move to optional modules, or are replaced? | Owner + Architecture + Legal | Yes — second product / template release | Open | Before a second product ships from the template | `erp-platform-template` |
| DEC-014 | Web + Mobile | Shared package consumption | Do `web-next` and `mobile-react` consume `packages/*` as `file:` dependencies (no CI change) or through a root npm workspace? Proposed (2026-10-01): `file:` dependency installed as a copy (`install-links=true` in each app's `.npmrc`), with compiled `dist/lib` committed in the package — no Next.js/Metro root changes and no CI restructuring. | Web + Mobile leads | Yes — tokens adoption (S3/S4) | Open | Approve when applying `S3-S4-UNIFIED-THEME.md` | `erp-platform-template` |
| DEC-015 | Cross-platform | Collaboration scope | Is V1 record chatter only (comments, mentions, followers, activities on records), or also direct/group chat? | Product | No — S8 not started | Open | Before the chatter business plan | `erp-platform-template` |
| DEC-016 | Cross-platform | Education integrations | Are teachers HR employees (optional link), are guardians Contacts parties via projection, and are fees Accounting invoices (Deferred)? | Product + Education + HR/Accounting owners | Yes — Education G0/G2 | Open | Before Education slice E0 | `education-module` |
| DEC-017 | Documentation | Generated phase packets | Keep the 101 generated packets committed (current `-Check` model) or generate them on demand and let CI verify only manifests and fingerprints? | Documentation owner | No | Resolved 2026-10-12 — keep the packets committed (owner decision); `-Check` stays the CI model | Before the next documentation-system change | `erp-platform-template` |
| DEC-018 | Documentation | Archive folder | Delete `documentation/old files/` (git history preserves it) or keep it renamed as `archive/`? | Documentation owner | No | Resolved 2026-10-12 — deleted; git history keeps it, and an architecture test prevents the folder from returning | Clean-up step DOC-7 | `erp-platform-template` |
| DEC-019 | API | Record scope across roles | When a user holds several roles with different record-scope levels for one resource, does the widest or the narrowest level apply? Recommended: widest, matching how permissions combine. | Platform Security + Product | Yes — S7 G2 | Open | Before S7 implementation | `erp-platform-template` |
| DEC-020 | API | Team scope source | Is `Team` record scope derived from HR reporting lines only, or also from configurable groups? Recommended: HR reporting lines first. | Product + HR | No — Team level only | Open | Before the HR Team reference implementation | `erp-platform-template` |
| DEC-023 | Cross-platform | Error-log ingestion sources | Resolved 2026-10-17: V1 captures API, background-job, Web and Mobile error outcomes. Client ingress is metadata-only and sanitized; no raw stack storage. | Product + Platform | No — resolved | Resolved | Reopen only for a new capture source or third-party collector | `platform-error-logs`; `business/platform-error-logs/PLAN.md` |
| DEC-022 | Cross-platform | Error-log lifecycle/retention | Resolved 2026-10-17: append-only list/detail/Excel export, no manual edit/delete, allowlisted/redacted metadata, global SuperAdmin retention default 90 days and valid range 1..3650; cleanup is bounded/periodic. | Product + Platform | No — resolved | Resolved | Reopen only for a legal/operational retention policy change | `platform-error-logs`; `business/platform-error-logs/PLAN.md` |
| DEC-024 | Cross-platform | Company message logs initial scope | Resolved2026-10-21: existing Email only, company-only visibility, details/redacted-attempt content/Excel, no resend. Settings expose disabled/30/90/custom retention; initial disabled/90 is the announced reversible assumption. | Product + Platform | No — resolved | Resolved | Reopen for SMS/provider callbacks/resend or a different deletion default | `platform-message-logs` |

### DEC-025 — Angular browser backend boundary

Source/context: 2026-10-28 planning of a separate Angular client with Next retained.
The initial independent BFF proposal was explicitly rejected by the requester,
who also asked to avoid complexity. Closure evidence: direct user instructions
"بلاش منه" and "مش عايز تعقيد"; D08/D13 record direct Angular-to-API architecture.
No BFF host, Next BFF dependency or new gateway/session infrastructure is planned
for Angular. This decision is resolved, not deferred. No runtime was changed.
Impact: required browser outcomes still need actual direct API bindings; DEC-027
owns that remaining review. Reopen only on a separately approved architecture
change. Canonical plan: `documentation/plans/business/web-angular-migration/PLAN.md`.

### DEC-027 — Direct API authentication

R2 closure on 2026-10-28: actual browser routes/Cookies/security and SQL session
binding are implemented. Trusted Chromium/Identity/SQL proves the Required API
journey and negative boundaries; retained Next 38/native 1 focused regressions pass.
Final Release gate: 1157 passed, zero failed/skipped. DEC-027 is Closed for the API
binding decision and proof. Actual Angular UI/cross-tab coordination, production
origins/proxy checks and external-provider availability remain separately owned;
none reopens persistence selection. Canonical current proof:
`documentation/modules/platform/features/platform-browser-authentication/verification/BROWSER_IMPLEMENTATION_REPORT.md`.

Historical baseline and progression:

Source/context: explicit no-BFF direction under DEC-025, 2026-10-28. Owner/status
and exact trigger are in the canonical row. Impact: Next's cookie/session helpers
cannot simply be imported into Angular; choosing browser token persistence or
assuming API cookie support without evidence could change the security model.
Not implemented now because this task updates planning only. Target: S0 auth
contract, before S2 runtime. Close with source-backed endpoint/credential/origin
mapping and focused auth, refresh, logout, scope and applicable CSRF tests.
Use the existing API/identity capability where suitable; no speculative server or
identity rewrite. Canonical plan: `documentation/plans/business/web-angular-migration/PLAN.md`.

S0 investigation completed 2026-10-28: current endpoint/credential/origin map,
alternatives, bounded API browser-cookie extension, source gaps and
verification are in `business/web-angular-migration/AUTHENTICATION_PREFLIGHT.md`.
31 Platform policy/helper tests and 50 retained Web tests passed; no live cookie,
browser/SQL auth or new API binding was verified. The requester subsequently
selected secure API Cookies under D17. Persistence preference is resolved and
must not be asked again. BROWSER_AUTHENTICATION_CONTRACT owns the target transport;
RISK-018 owns discovered source/contract discrepancies. DEC-027 remains Open for
the exact slice/preflight and implementation proof, not for persistence selection.

Phase 00 package is now registered for S0-AUTH preflight only under
`documentation/modules/platform/features/platform-browser-authentication/`.
Three Phase 00 integration probes subsequently passed: actual JWT/chunk capacity,
real SQL Identity/EF concurrency and trusted Chromium HTTPS/CORS/antiforgery.
Selected bounds and the remaining adapter/deployment acceptance are canonical in
`documentation/modules/platform/features/platform-browser-authentication/verification/PREFLIGHT_PROOF_REPORT.md`.
Primitive feasibility is resolved; actual session policy/endpoint binding and exact
runtime gate remain pending. One Active preparation owner does not close this note.

Subsequent requester authorization activates S0-AUTH-R1 session correctness inside
the same feature. SESSION_RUNTIME_READINESS.md records its passed G0-G3 and exact
bounded runtime authority; actual session adapter repair/SQL tests are recorded in
verification/SESSION_IMPLEMENTATION_REPORT.md. This is not browser binding: Cookie
routes/HTTP acceptance remain pending, so DEC-027 stays Open without re-opening D17.

### DEC-026 — Screen pattern identity

Source/context: the current catalog assigns P-008 to an Active context selector
and a Candidate transactional document. Owner/status/trigger are in the row.
Impact: future contracts can bind the wrong reference. Resolution is not bundled
with this migration draft because it changes shared catalog identity and links.
Target: affected G3/feature contract entry. Close by updating the canonical catalog,
reuse references and affected contracts, then running planning/documentation checks.
Canonical sources: `documentation/guides/shared/SCREEN_PATTERN_CATALOG.md` and
`documentation/plans/business/web-angular-migration/ANGULAR_ARCHITECTURE.md`.
