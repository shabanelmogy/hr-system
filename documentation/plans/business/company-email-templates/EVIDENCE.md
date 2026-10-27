# Company email templates — Evidence ledger

Discovery snapshot: 2026-10-20 before runtime changes. Historical CURRENT means verified at discovery; final implementation evidence is recorded below and in the owning feature ledger.

| ID | Classification | Finding | Source | Consequence |
| --- | --- | --- | --- | --- |
| E-001 | VERIFIED CURRENT | Three hardcoded account subjects/bodies and TLS SMTP. | api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Identity/PlatformIdentityEmailSender.cs:107, SendConfirmationAsync/SendPasswordResetAsync/SendInvitationAsync/SendAsync | Extend current owner, preserve server links. |
| E-002 | VERIFIED CURRENT | Confirmation/resend/reset call sender. | api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Identity/PlatformIdentityAuthenticationAdapters.cs:542 | Anonymous scope fallback required. |
| E-003 | VERIFIED CURRENT | Invitation adapter receives persisted invitation, drops scope from sender arguments today. | api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Features/Security/Invitations/Services/UserInvitationInfrastructureAdapters.cs:176 | Forward persisted tenant/default-company. |
| E-004 | VERIFIED CURRENT | Company localization demonstrates scoped locked revision and atomic audit. | api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Features/CompanyLocalization/CompanyLocalizationStore.cs | Reuse transaction/scope infrastructure. |
| E-005 | VERIFIED CURRENT | Shared Grid/form/fields/tabs exist; no rich editor found in source/package searches. | web-next/src/shared/components/forms; web-next/package.json; mobile-react/src/shared/components/forms | Reuse shells; add generic rich HTML field. |
| E-006 | VERIFIED CURRENT | Settings already permission-filters company tabs. | web-next/src/platform/settings/settingsTabs.ts | Add an independent Administration entry, not a Settings tab (user correction). |
| E-007 | VERIFIED CURRENT | HR RecruitmentStage stores EmailTemplate, not evidence of general delivery. | api/Modules/HR/ErpSystem.Modules.HR.Domain/Recruitment/Entities/RecruitmentStage.cs:45 | HR integration outside S1. |
| E-008 | REQUESTED TARGET | Company-only three initial messages, Web editor/native preview, safe fallback. | User answers 2026-10-20 | Frozen scope. |
| E-009 | ASSUMPTION | Current request culture selects sending language. | No requested preferred-language profile | Verify en/ar capture. |
| E-010 | UNKNOWN | Production deliverability and physical native appearance unverified. | No production send/device requested | PROD-017/PROD-026; received-provider acceptance subsequently registered as PROD-027. |
| E-011 | NOT APPLICABLE | Rental examples/marketing are not selected first use cases. | User says images illustrative and chooses existing messages | No unrelated entities. |

Baseline: 173 documentation recipes passed, .codex-tmp/email-initial-documentation-check.log. Graphify located sender/auth/invitation then actual source was verified. Dirty workspace/graph preserved. No runtime implementation claimed at discovery.


## Final implementation evidence — 2026-10-21
E-012 VERIFIED CURRENT: sender delegates to registered renderer; persisted invitation scope forwarded, recipient/session membership verified, standard fallback preserved. Current source replaces the preflight hardcoded bodies described in E-001/E-003.
E-013 VERIFIED CURRENT: shared Web editor/preview and native read-only Table/Cards/preview implemented, exact company permissions/routes and bilingual resources registered. New reusable rich field/preview host added after inventory.
E-014 VERIFIED CURRENT: migration applied, SQL concurrency/audit test,1109 API tests,12 final scoped Web tests/two browser journeys,44 native tests, builds/export and21 live HTTP checks passed. Final client/API catalog fingerprint and runtime request passed.
E-015 RELEASE/INHERITED: PROD-026/027 and RISK-009/FOLLOW-006/007/008 retain separate ownership. See company-email-templates-evidence.md for exact counts, artifact paths and five-point audit. No external SMTP delivery claimed.
