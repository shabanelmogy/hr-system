# User permission grants and company UI localization — Decision log

| ID | State | Decision | Basis |
| --- | --- | --- | --- |
| D-001 | Confirmed | Additive user grants; roles remain effective; no direct deny. | Explicit requester choice, 2026-10-17. |
| D-002 | Confirmed | UI text/default language independently per company within a Tenant. | Explicit requester choice, 2026-10-17. |
| D-003 | Confirmed | English/Arabic V1; additional languages tracked as DEF-025. | Explicit requester choice, 2026-10-17. |
| DEC-021 | Confirmed | Company-scoped direct grants for company business operations; inherited role grants preserved. | Explicit requester implementation authorization, 2026-10-17. |

A-001–A-003 are explicit implementation defaults under the approved specification:
user preference before company default; shipped text with company overrides/reset;
Web/Mobile consumption and online administration. Master plan and both runtime capabilities
were authorized on 2026-10-17; per-feature gates and verification still apply.
