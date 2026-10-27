# Company email templates — API profile

## 1. Ownership
Platform vertical slice; no new module or foreign Infrastructure dependency. Domain owns catalog/invariants/root; Application owns CQRS and narrow reader/writer/content/render ports.

## 2. Runtime sources
Application/Features/CompanyEmailTemplates: contracts/requests/validation/handlers. Infrastructure/Features/CompanyEmailTemplates: content policy/configuration/store/renderer. Presentation V1 controller. DbContext/DI/permissions register them. Existing Identity sender and invitation adapter bind delivery. Manifest contains exact paths and tests.

## 3. Transport
Base /api/v1/company-email-templates: GET language/status/search/page/pageSize returns complete editable effective rows including variables/revision. PUT /{id}: language/subject/body/expectedRevision. POST /{id}/reset: language/expectedRevision. POST /{id}/preview: language with optional draft subject/body, returns subject/html/text. No GET detail, arbitrary create/delete or send endpoint. Catalog email-confirmation/password-reset/user-invitation; en/ar.

## 4. Scope and authorization
TenantMember and exact View/Edit/Reset; preview uses View. Actor supplies trusted tenant/company; store rechecks active membership and denies global/absent/foreign scope. Client company IDs cannot override authority. Both clients register all three independent permission labels.

## 5. Validation/rendering
Field-addressable FluentValidation. Subject required <=200/no control chars, body required <=50000. FIRST_NAME in subject/body; ACTION_URL exactly once in body as entire anchor href. HtmlSanitizer 9.2.1039/AngleSharp enforce formatting tags/href only; ordinary links absolute HTTPS/no credentials/tokens. Scripts/styles/forms/images/iframes/events/resources rejected. Encode dynamic names; replace action before name to avoid recursive injection. Server action URL may be HTTP only for loopback development. Output includes lang/dir/mobile viewport; text preserves block boundaries/action URL.

## 6. Persistence
Unique tenant/company root with revision/rowversion and owned unique settings/template/language children. Explicit company query filter; trusted lookup still binds tenant/company. Migration 20261020201511_AddCompanyEmailTemplates and snapshot generated/applied using Add-ErpModuleMigrations.ps1 -Name AddCompanyEmailTemplates -Configuration Release -Apply. Real SQL integration exercises schema, first writer and audit. No unapplied model change at handoff.

## 7. Query behavior
Code defaults overlaid by requested company/language override. Status all/default/customized; case-insensitive ID/name/subject search; stable ID ordering. Page starts at1, size1..100. Complete list rows avoid redundant detail query. No live rendered tokens persisted.

## 8. Consistency
Scoped SQL application lock plus expected revision, rowversion and unique constraint. Aggregate/audit atomic. No-op keeps revision, reset retains root and monotonic revision preventing ABA. Stable localized invalid/forbidden/conflict responses. Failures propagate; preview success never implies delivery.

## 9. Sender binding
Persisted invitation TenantId/DefaultCompanyId verified. Implicit scope requires recipientUserId==actor.UserId plus current active membership; other/anonymous context standard. Request culture selects en/ar, English fallback. Existing link/token generation and SMTP failure/TLS behavior retained. CreateMessage produces one To, subject and HTML/plain alternatives, no CC/BCC. Sample preview uses Alex/أحمد and example.invalid without transport/recipient lookup.

## 10. Verification
Final Release build/full serial solution tests:1109 passed across12 assemblies, zero failures/skips. Domain/content/store tests cover unsafe markup/URLs/positions, defaults/cultures, injection, revisions/no-op/reset/ABA/scope. SQL tests prove one first-writer commit plus audit. Actual MIME capture proves one recipient and HTML/text/subject; comparison normalizes transport CRLF without altering outgoing serialization. Live HTTP21 checks passed; original content restored. Logs: .codex-tmp/email-api-verified-tests.log, email-api-verified-build.log, email-migrations.log, email-live-http-final.log. Durable source tests are in manifest.

## 11. Acceptance/operations
API Verified; development schema applied. No external SMTP send. PROD-027 owns provider/received-mail acceptance, PROD-026 native device and PROD-017 production provisioning. No tokens or delivered bodies logged. No new transport queue/deduplication/credentials UI. Embedded localization catalog must match final client catalog after locale changes.


Message Logs relationship2026-10-21: trusted company resolution extracted into IAccountEmailScopeResolver/AccountEmailScopeResolver and reused by renderer and actual sender. Template language/content/link/fallback contracts and both template UIs are unchanged. Sender now records bounded secret-free observational company attempts through the separate message-logs slice and uses a narrow SMTP transport seam; no replay or global template editor introduced. Current delivery tests are rerun with that slice.
