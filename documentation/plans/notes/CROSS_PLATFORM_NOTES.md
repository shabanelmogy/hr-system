# Cross-Platform Notes Index

Use this index for notes whose resolution requires coordinated API + Web + Mobile
decisions.

Typical examples:
- shared business rule or lifecycle changes;
- request/response contract changes consumed by both clients;
- permissions or tenant/company ownership changes;
- offline policy changes;
- realtime/notification contracts;
- report/import/export contracts;
- migration/backfill that changes client assumptions.

## Tracked cross-platform notes

| Note ID | Type | Area | Summary | Surfaces | Canonical registry |
| --- | --- | --- | --- | --- | --- |
| DEC-023 | Decision | Error-log sources | Confirm first-release capture sources. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-022 | Decision | Error-log retention | Confirm lifecycle, retention and export scope. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-021 | Decision | Direct user grants | Resolved: company-specific additive business grants; role permissions preserved. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEF-025 | Deferred | Additional UI languages | English/Arabic first; reopen language creation only on explicit additional-language scope. | API + Web + Mobile | `DEFERRED_ITEMS.md` |
| PROD-008 | Production | Demo Login | Product currently permits Production Demo Login; preview bootstrap remains a separate API deployment concern. | API + Web | `PRODUCTION_NOTES.md` |
| PROD-010 | Production | Hosted authenticated E2E | Release-like Mobile journeys depend on deployed API/session/data behavior. | API + Mobile | `PRODUCTION_NOTES.md` |
| PROD-011 | Production | API contract drift | Hosted Swagger and mobile contract evidence must move together after endpoint/version changes. | API + Mobile | `PRODUCTION_NOTES.md` |
| PROD-020 | Production | Managed Crystal publication | Feature report views require publication plus `Run` access; source/report files alone are insufficient release evidence. | API + Web + Mobile | `PRODUCTION_NOTES.md` |
| PROD-021 | Production | Address Type company expansion | Existing-environment rollout requires a data-safe migration sequence and client context refresh. | API + Web + Mobile | `PRODUCTION_NOTES.md` |
| PROD-025 | Production | Managed Crystal runtime | API, runtime, Web and Mobile release evidence must use matching entity contracts and a real deployed AR/EN render. | API + Runtime + Web + Mobile | `PRODUCTION_NOTES.md` |
| DEF-002 | Deferred | Reporting/charts | Whole-dataset contracts reopen only when a real client/reporting need proves them necessary. | API + Web | `DEFERRED_ITEMS.md` |
| DEF-008 | Deferred | Workforce governance | Delegated SoD affects API authorization and both client action visibility. | API + Web + Mobile | `DEFERRED_ITEMS.md` |
| DEF-017 | Deferred | Work Location | Separate Work Location ownership waits for a lifecycle that Branch/BranchAddress cannot represent. | API + Web + Mobile | `DEFERRED_ITEMS.md` |
| DEF-018 | Deferred | Branch authorization | Branch/location target access waits for a branch-restricted business workflow. | API + Web + Mobile | `DEFERRED_ITEMS.md` |
| DEF-019 | Deferred | Geographic effective dating | Temporal relationships are added only when a workflow requires historical truth. | API + Web + Mobile | `DEFERRED_ITEMS.md` |
| DEF-020 | Deferred | Employee/emergency addresses | Privacy-governed employee address surfaces wait for the owning HR feature. | API + Web + Mobile | `DEFERRED_ITEMS.md` |
| DEF-021 | Deferred | Address formatting | Country-specific formatting/validation waits for country rollout requirements. | API + Web + Mobile | `DEFERRED_ITEMS.md` |
| DEF-022 | Deferred | PIM/Catalog boundary | Catalog extraction waits for complexity that justifies a new bounded context. | API + Web + Mobile | `DEFERRED_ITEMS.md` |
| DEF-023 | Deferred | Attendance geofence | Geofence radius waits for mobile attendance capture. | API + Mobile | `DEFERRED_ITEMS.md` |
| DEF-024 | Deferred | Employee management | Employee screens, direct manager, and import/export wait for the Employee slice. | API + Web + Mobile | `DEFERRED_ITEMS.md` |
| RISK-005 | Risk | Platform post-commit effects | Future critical external effects require transactional outbox semantics. | API + Web + Mobile | `KNOWN_RISKS.md` |
| FOLLOW-003 | Follow-up | Contract parity | Exhaustive generated Web/API contract diff remains future governance work. | API + Web | `FOLLOW_UPS.md` |
| DEC-001 | Decision | HR MVP | Leave-only versus Attendance scope remains open for the affected HR expansion. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-002 | Decision | Payroll ownership | First-party Payroll versus provider integration remains open. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-003 | Decision | Billing model | Manual enterprise contracts versus self-service billing remains open. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-005 | Decision | SSO | Entra ID versus generic OIDC first-provider choice remains open. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-006 | Decision | Country/compliance | Initial countries, residency, and retention obligations remain open. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-007 | Decision | Accounting jurisdiction | First-launch accounting/statutory/retention baseline must be selected before a jurisdiction-dependent release. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-008 | Decision | Accounting books/currency | Resolved for Core GL V1: one functional currency + one primary book, historical FX with applied-rate snapshot, report-time reporting-currency translation; adjustment books Deferred. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-009 | Decision | Accounting branch/intercompany | Resolved/Deferred for Core GL V1: Branch remains analysis/authorization context; branch-balanced/intercompany auto-balancing waits for a separate requirement. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| DEC-010 | Decision | Accounting SoD | Resolved baseline: configurable approval, self-approval default Blocked, separate Approve/Post permissions, versioned policy, audited reopen/late-posting. | API + Web + Mobile | `DECISION_BACKLOG.md` |
| RISK-006 | Risk | Accounting migration | Future opening/legacy migration needs trial reconciliation and exception evidence. | API + Web + Mobile | `KNOWN_RISKS.md` |
| RISK-007 | Risk | Accounting scale | Representative posting and GL/Trial Balance scale remains unmeasured before production approval. | API + Web + Mobile | `KNOWN_RISKS.md` |
| PROD-026 | Production | Company administration | Native acceptance deferred by explicit requester instruction; implement both features and automated checks now. | Product owner + QA | `PRODUCTION_NOTES.md` |
| FOLLOW-007 | Follow-up | Full Web test runner | Supplemental full Vitest completion requires a dedicated collection/runtime investigation; scoped feature checks remain separately recorded. | Web + QA | `FOLLOW_UPS.md` |
| RISK-010 | Risk | Error Logs capture availability | Bounded sink and native/runtime availability limits. | API + Web + Mobile | `KNOWN_RISKS.md` |

`PROD-027` — Company account email provider/client acceptance; canonical ownership, trigger and production gate are in PRODUCTION_NOTES.md.

`DEC-024` — Company message logs scope; canonical decision in DECISION_BACKLOG.md. `RISK-011` — Observational capture availability/uncertain SMTP outcome; canonical risk in KNOWN_RISKS.md.
