# Angular Web Migration — Source Route Inventory

Snapshot: 2026-10-28 working tree. All entries below are source-presence evidence only. Workflow completeness, optional views and actual API contracts require individual reconciliation in S0. Angular acceptance is not started. Public paths are derived by removing Next route groups; dynamic segments are retained as patterns. Reconcile against redirects, route guards and the generated ownership manifest before freezing the ledger.

## Page routes

| ID | Public route pattern | Source owner | Proposed workstream | Source adapter | Acceptance |
| --- | --- | --- | --- | --- | --- |
| W001 | `/accept-invitation` | platform | S2 | [source](<../../../../web-next/src/app/(auth)/accept-invitation/page.tsx>) | Not started; reconcile source |
| W002 | `/change-password` | platform | S2 | [source](<../../../../web-next/src/app/(auth)/change-password/page.tsx>) | Not started; reconcile source |
| W003 | `/confirm-email` | platform | S2 | [source](<../../../../web-next/src/app/(auth)/confirm-email/page.tsx>) | Not started; reconcile source |
| W004 | `/forget-password` | platform | S2 | [source](<../../../../web-next/src/app/(auth)/forget-password/page.tsx>) | Not started; reconcile source |
| W005 | `/login` | platform | S2 | [source](<../../../../web-next/src/app/(auth)/login/page.tsx>) | Not started; reconcile source |
| W006 | `/register` | platform | S2 | [source](<../../../../web-next/src/app/(auth)/register/page.tsx>) | Not started; reconcile source |
| W007 | `/resend-email-confirmation` | platform | S2 | [source](<../../../../web-next/src/app/(auth)/resend-email-confirmation/page.tsx>) | Not started; reconcile source |
| W008 | `/reset-password` | platform | S2 | [source](<../../../../web-next/src/app/(auth)/reset-password/page.tsx>) | Not started; reconcile source |
| W009 | `/finance/ledger-setup/account-determination` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/account-determination/page.tsx>) | Not started; reconcile source |
| W010 | `/finance/ledger-setup/accounts` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/accounts/page.tsx>) | Not started; reconcile source |
| W011 | `/finance/ledger-setup/books` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/books/page.tsx>) | Not started; reconcile source |
| W012 | `/finance/ledger-setup/company-settings` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/company-settings/page.tsx>) | Not started; reconcile source |
| W013 | `/finance/ledger-setup/currencies` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/currencies/page.tsx>) | Not started; reconcile source |
| W014 | `/finance/ledger-setup/dimensions` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/dimensions/page.tsx>) | Not started; reconcile source |
| W015 | `/finance/ledger-setup/exchange-rates` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/exchange-rates/page.tsx>) | Not started; reconcile source |
| W016 | `/finance/ledger-setup/fiscal-years` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/fiscal-years/page.tsx>) | Not started; reconcile source |
| W017 | `/finance/ledger-setup/hierarchy-levels` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/hierarchy-levels/page.tsx>) | Not started; reconcile source |
| W018 | `/finance/ledger-setup/journals` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/journals/page.tsx>) | Not started; reconcile source |
| W019 | `/finance/ledger-setup` | accounting | S5 | [source](<../../../../web-next/src/app/(main)/(modules)/(accounting)/finance/ledger-setup/page.tsx>) | Not started; reconcile source |
| W020 | `/appointments` | crm | S8 (proof S0/S3) | [source](<../../../../web-next/src/app/(main)/(modules)/(crm)/appointments/page.tsx>) | Not started; reconcile source |
| W021 | `/attendance-devices` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/attendance-devices/page.tsx>) | Not started; reconcile source |
| W022 | `/attendance-devices/pull-runs` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/attendance-devices/pull-runs/page.tsx>) | Not started; reconcile source |
| W023 | `/attendance-devices/punches` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/attendance-devices/punches/page.tsx>) | Not started; reconcile source |
| W024 | `/attendance-devices/users` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/attendance-devices/users/page.tsx>) | Not started; reconcile source |
| W025 | `/recruitment` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/recruitment/page.tsx>) | Not started; reconcile source |
| W026 | `/workforce-planning/budgets` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/workforce-planning/budgets/page.tsx>) | Not started; reconcile source |
| W027 | `/workforce-planning/envelope-amendments` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/workforce-planning/envelope-amendments/page.tsx>) | Not started; reconcile source |
| W028 | `/workforce-planning` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/workforce-planning/page.tsx>) | Not started; reconcile source |
| W029 | `/workforce-planning/plans` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/workforce-planning/plans/page.tsx>) | Not started; reconcile source |
| W030 | `/workforce-planning/position-envelopes` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/workforce-planning/position-envelopes/page.tsx>) | Not started; reconcile source |
| W031 | `/workforce-planning/staffing-requests` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/workforce-planning/staffing-requests/page.tsx>) | Not started; reconcile source |
| W032 | `/workforce-planning/trace` | hr | S7 | [source](<../../../../web-next/src/app/(main)/(modules)/(hr)/workforce-planning/trace/page.tsx>) | Not started; reconcile source |
| W033 | `/advanced-tools/api-endpoints` | platform | S4 | [source](<../../../../web-next/src/app/(main)/(platform)/advanced-tools/api-endpoints/page.tsx>) | Not started; reconcile source |
| W034 | `/advanced-tools/audit-trail` | platform | S4 | [source](<../../../../web-next/src/app/(main)/(platform)/advanced-tools/audit-trail/page.tsx>) | Not started; reconcile source |
| W035 | `/advanced-tools/error-logs` | platform | S4 | [source](<../../../../web-next/src/app/(main)/(platform)/advanced-tools/error-logs/page.tsx>) | Not started; reconcile source |
| W036 | `/advanced-tools/hangfire-dashboard` | platform | S4 | [source](<../../../../web-next/src/app/(main)/(platform)/advanced-tools/hangfire-dashboard/page.tsx>) | Not started; reconcile source |
| W037 | `/advanced-tools/health-check` | platform | S4 | [source](<../../../../web-next/src/app/(main)/(platform)/advanced-tools/health-check/page.tsx>) | Not started; reconcile source |
| W038 | `/advanced-tools/localization-api` | platform | S4 | [source](<../../../../web-next/src/app/(main)/(platform)/advanced-tools/localization-api/page.tsx>) | Not started; reconcile source |
| W039 | `/apps/[moduleCode]/[submoduleCode]` | platform | S2 | [source](<../../../../web-next/src/app/(main)/(platform)/apps/[moduleCode]/[submoduleCode]/page.tsx>) | Not started; reconcile source |
| W040 | `/apps/[moduleCode]` | platform | S2 | [source](<../../../../web-next/src/app/(main)/(platform)/apps/[moduleCode]/page.tsx>) | Not started; reconcile source |
| W041 | `/apps` | platform | S2 | [source](<../../../../web-next/src/app/(main)/(platform)/apps/page.tsx>) | Not started; reconcile source |
| W042 | `/files` | platform | S8 (proof S0) | [source](<../../../../web-next/src/app/(main)/(platform)/files/page.tsx>) | Not started; reconcile source |
| W043 | `/files/view/[...fileParams]` | platform | S8 (proof S0) | [source](<../../../../web-next/src/app/(main)/(platform)/files/view/[...fileParams]/page.tsx>) | Not started; reconcile source |
| W044 | `/profile` | platform | S4 | [source](<../../../../web-next/src/app/(main)/(platform)/profile/page.tsx>) | Not started; reconcile source |
| W045 | `/` | shell | S2 | [source](<../../../../web-next/src/app/(main)/(shell)/page.tsx>) | Not started; reconcile source |
| W046 | `/route-unavailable` | shell | S2 | [source](<../../../../web-next/src/app/(main)/(shell)/route-unavailable/page.tsx>) | Not started; reconcile source |
| W047 | `/administration/company-localizations` | platform | S4 | [source](<../../../../web-next/src/app/(main)/administration/(platform)/company-localizations/page.tsx>) | Not started; reconcile source |
| W048 | `/administration/email-templates` | platform | S4 | [source](<../../../../web-next/src/app/(main)/administration/(platform)/email-templates/page.tsx>) | Not started; reconcile source |
| W049 | `/administration/invitations` | platform | S4 | [source](<../../../../web-next/src/app/(main)/administration/(platform)/invitations/page.tsx>) | Not started; reconcile source |
| W050 | `/administration/manage-role-permissions/[id]` | platform | S4 | [source](<../../../../web-next/src/app/(main)/administration/(platform)/manage-role-permissions/[id]/page.tsx>) | Not started; reconcile source |
| W051 | `/administration/message-logs` | platform | S4 | [source](<../../../../web-next/src/app/(main)/administration/(platform)/message-logs/page.tsx>) | Not started; reconcile source |
| W052 | `/administration/offline-operations` | platform | S4 | [source](<../../../../web-next/src/app/(main)/administration/(platform)/offline-operations/page.tsx>) | Not started; reconcile source |
| W053 | `/administration/roles` | platform | S4 | [source](<../../../../web-next/src/app/(main)/administration/(platform)/roles/page.tsx>) | Not started; reconcile source |
| W054 | `/administration/settings` | platform | S4 | [source](<../../../../web-next/src/app/(main)/administration/(platform)/settings/page.tsx>) | Not started; reconcile source |
| W055 | `/administration/users` | platform | S4 | [source](<../../../../web-next/src/app/(main)/administration/(platform)/users/page.tsx>) | Not started; reconcile source |
| W056 | `/administration/crystal-reports` | reporting | S8 (proof S0/S3) | [source](<../../../../web-next/src/app/(main)/administration/(reporting)/crystal-reports/page.tsx>) | Not started; reconcile source |
| W057 | `/basic-data/address-types` | reference-data | S4 | [source](<../../../../web-next/src/app/(main)/basic-data/(reference-data)/address-types/page.tsx>) | Not started; reconcile source |
| W058 | `/basic-data` | shell | S2 | [source](<../../../../web-next/src/app/(main)/basic-data/(shell)/page.tsx>) | Not started; reconcile source |
| W059 | `/basic-data/organizational-structure/branches` | hr | S6 | [source](<../../../../web-next/src/app/(main)/basic-data/organizational-structure/(hr)/branches/page.tsx>) | Not started; reconcile source |
| W060 | `/basic-data/organizational-structure/cost-centers` | hr | S6 | [source](<../../../../web-next/src/app/(main)/basic-data/organizational-structure/(hr)/cost-centers/page.tsx>) | Not started; reconcile source |
| W061 | `/basic-data/organizational-structure/departments` | hr | S6 | [source](<../../../../web-next/src/app/(main)/basic-data/organizational-structure/(hr)/departments/page.tsx>) | Not started; reconcile source |
| W062 | `/basic-data/organizational-structure/divisions` | hr | S6 | [source](<../../../../web-next/src/app/(main)/basic-data/organizational-structure/(hr)/divisions/page.tsx>) | Not started; reconcile source |
| W063 | `/basic-data/organizational-structure/job-descriptions` | hr | S6 | [source](<../../../../web-next/src/app/(main)/basic-data/organizational-structure/(hr)/job-descriptions/page.tsx>) | Not started; reconcile source |
| W064 | `/basic-data/organizational-structure/job-levels` | hr | S6 | [source](<../../../../web-next/src/app/(main)/basic-data/organizational-structure/(hr)/job-levels/page.tsx>) | Not started; reconcile source |
| W065 | `/basic-data/organizational-structure/job-titles` | hr | S6 | [source](<../../../../web-next/src/app/(main)/basic-data/organizational-structure/(hr)/job-titles/page.tsx>) | Not started; reconcile source |
| W066 | `/basic-data/organizational-structure/positions` | hr | S6 | [source](<../../../../web-next/src/app/(main)/basic-data/organizational-structure/(hr)/positions/page.tsx>) | Not started; reconcile source |
| W067 | `/basic-data/organizational-structure/geographic-scope` | platform | S4 | [source](<../../../../web-next/src/app/(main)/basic-data/organizational-structure/(platform)/geographic-scope/page.tsx>) | Not started; reconcile source |
| W068 | `/super-admin/audit-trail` | platform | S4 | [source](<../../../../web-next/src/app/(main)/super-admin/(platform)/audit-trail/page.tsx>) | Not started; reconcile source |
| W069 | `/super-admin/error-log-settings` | platform | S4 | [source](<../../../../web-next/src/app/(main)/super-admin/(platform)/error-log-settings/page.tsx>) | Not started; reconcile source |
| W070 | `/super-admin/error-logs` | platform | S4 | [source](<../../../../web-next/src/app/(main)/super-admin/(platform)/error-logs/page.tsx>) | Not started; reconcile source |
| W071 | `/super-admin` | platform | S4 | [source](<../../../../web-next/src/app/(main)/super-admin/(platform)/page.tsx>) | Not started; reconcile source |
| W072 | `/super-admin/tenant-admins` | platform | S4 | [source](<../../../../web-next/src/app/(main)/super-admin/(platform)/tenant-admins/page.tsx>) | Not started; reconcile source |
| W073 | `/super-admin/tenants` | platform | S4 | [source](<../../../../web-next/src/app/(main)/super-admin/(platform)/tenants/page.tsx>) | Not started; reconcile source |
| W074 | `/super-admin/ui-texts` | platform | S4 | [source](<../../../../web-next/src/app/(main)/super-admin/(platform)/ui-texts/page.tsx>) | Not started; reconcile source |
| W075 | `/super-admin/geography/countries` | reference-data | S3 | [source](<../../../../web-next/src/app/(main)/super-admin/(reference-data)/geography/countries/page.tsx>) | Not started; reconcile source |
| W076 | `/super-admin/geography/districts` | reference-data | S3 | [source](<../../../../web-next/src/app/(main)/super-admin/(reference-data)/geography/districts/page.tsx>) | Not started; reconcile source |
| W077 | `/super-admin/geography/states` | reference-data | S3 | [source](<../../../../web-next/src/app/(main)/super-admin/(reference-data)/geography/states/page.tsx>) | Not started; reconcile source |
| W078 | `/[...missing]` | platform | S4 | [source](<../../../../web-next/src/app/[...missing]/page.tsx>) | Not started; reconcile source |

## Existing Next server handlers — direct API outcome reconciliation

| Next source | Target obligation |
| --- | --- |
| [source](<../../../../web-next/src/app/api/[...path]/route.ts>) | Retained for Next only. Map required Angular browser outcome to an actual API endpoint or hosting config; auth under DEC-027. No BFF port. |
| [source](<../../../../web-next/src/app/api/auth/logout/route.ts>) | Retained for Next only. Map required Angular browser outcome to an actual API endpoint or hosting config; auth under DEC-027. No BFF port. |
| [source](<../../../../web-next/src/app/api/auth/realtime-token/route.ts>) | Retained for Next only. Map required Angular browser outcome to an actual API endpoint or hosting config; auth under DEC-027. No BFF port. |
| [source](<../../../../web-next/src/app/api/auth/session/route.ts>) | Retained for Next only. Map required Angular browser outcome to an actual API endpoint or hosting config; auth under DEC-027. No BFF port. |
| [source](<../../../../web-next/src/app/api/hubs/[...path]/route.ts>) | Retained for Next only. Map required Angular browser outcome to an actual API endpoint or hosting config; auth under DEC-027. No BFF port. |
| [source](<../../../../web-next/src/app/api/security/csp-report/route.ts>) | Retained for Next only. Map required Angular browser outcome to an actual API endpoint or hosting config; auth under DEC-027. No BFF port. |
| [source](<../../../../web-next/src/app/api/telemetry/client/route.ts>) | Retained for Next only. Map required Angular browser outcome to an actual API endpoint or hosting config; auth under DEC-027. No BFF port. |
| [source](<../../../../web-next/src/app/hangfire/[[...path]]/route.ts>) | Retained for Next only. Map required Angular browser outcome to an actual API endpoint or hosting config; auth under DEC-027. No BFF port. |

## Inventory reconciliation requirements

- A page adapter may dispatch several ledger resources or tabs; inspect its real feature registry and child screens. A single route is not necessarily one feature.
- Reports, imports, cards, charts, dialogs, structured builders and row actions may share a route; discover them through the owning required-files manifest and source.
- Distinguish implemented, partial, placeholder, navigation-only, redirect and intentionally unavailable behavior. Planned Accounting/HR capabilities are not current source parity.
- Inspect route.ts, layouts, error/loading boundaries, proxy, service worker, redirects and API endpoint constants separately. Root and authenticated/auth-only layouts also need parity.
- Source owner here is inferred from route-group markers and must be reconciled with the generated architecture manifest before G0 closes.
- Future live acceptance records must contain source baseline, target route, contract ID, views/actions, scope, test evidence and unresolved differences.


## Requester scope correction —2026-10-30 DEC-028

ActiveReports viewer/designer/SDK and associated authoring/licensing work are
Excluded from Angular migration by explicit requester instruction. References to
existing Next/native/API implementations are source evidence only and do not
reinstate that target. Current Angular reporting uses managed Crystal/PDF. Other
reporting manager, permissions, binary transport and PDF lifecycle requirements
remain governed by their owning contracts. No ActiveReports runtime placeholder.
