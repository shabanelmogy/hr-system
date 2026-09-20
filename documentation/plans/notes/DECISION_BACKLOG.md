# Decision Backlog

Use this registry for cross-plan decisions whose status must remain centrally
traceable. Open decisions may intentionally remain unresolved when they do not
block the current slice; resolved decisions stay indexed when other plans or
surfaces still depend on the recorded outcome. An open decision that blocks a
Required capability prevents an `Implementation Ready` status for that scope.

| ID | Surface | Topic | Question | Owner | Blocking? | Status | Decision trigger / due | Related plan |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
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
