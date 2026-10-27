# Message logs — Evidence

| ID | Classification | Finding | Source | Consequence |
| --- | --- | --- | --- | --- |
| E-001 | VERIFIED CURRENT | Three actual account sends and one MailKit SMTP implementation. | api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Identity/PlatformIdentityEmailSender.cs:SendConfirmationAsync/SendPasswordResetAsync/SendInvitationAsync/SendAsync | Instrument actual owner, preserve links/TLS/failures. |
| E-002 | VERIFIED CURRENT | Templates resolve persisted invitation company or matching recipient/current company membership; anonymous fallback standard. | api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Features/CompanyEmailTemplates/CompanyEmailTemplateStore.cs:AccountEmailRenderer | Reuse trusted attribution, no membership-order guessing. |
| E-003 | VERIFIED CURRENT | Invitation initial delivery occurs after transaction commit; adapter forwards persisted tenant/default company. | Application/Features/Security/Invitations/UserInvitationRequests.cs:165; Infrastructure/Features/Security/Invitations/Services/UserInvitationInfrastructureAdapters.cs:UserInvitationEmailSender | Attempt capture must not replay/send twice. |
| E-004 | VERIFIED CURRENT | Shared error-log viewer/filter/detail/export/settings patterns exist. | documentation/modules/platform/features/error-logs/required-files.json and current Web/API/native sources | Reuse shared composition, not unrelated diagnostics/business model. |
| E-005 | VERIFIED CURRENT | No SMS provider/sender found in current ERP solution; HR SendEmailNotification is a stored flag, not actual transport evidence. | source search; HR RecruitmentStage/RecruitmentSettingsStores | No fake SMS logs or copied rental domain. |
| E-006 | REQUESTED TARGET | Email only, company-only access, detail/Excel, no resend. | User answers2026-10-21 | No Super Admin entry/retry endpoint/SMS placeholder. |
| E-007 | REQUESTED TARGET | Snapshot at attempt after sensitive-link redaction; retention choices in per-company Settings. | User answers2026-10-21 | Separate dependent settings workflow, no raw account-action URL storage. |
| E-008 | ASSUMPTION | Only new verified-company attempts appear; historical/unattributed sends cannot be assigned. | Current sender/renderer facts | Explicitly describe empty/history/scope semantics before release. |
| E-009 | NOT APPLICABLE | Managed report, campaigns/new business messages/real provider testing are not initial scope. | User screenshot reference and selected detail/Excel | No report/runtime placeholders or external sends. |

Graphify query located sender/invitation/notification nodes; raw source independently verified. Documentation baseline181 recipes passed. Existing dirty workspace preserved (.codex-tmp/message-logs-initial-status.log), graph not updated.

| E-010 | UNKNOWN | Received provider/client delivery and physical native rendering are unverified production/manual evidence, not implementation semantics. | No real provider/device run requested | Existing PROD-026/027 retain ownership before release; does not change frozen development scope. |
