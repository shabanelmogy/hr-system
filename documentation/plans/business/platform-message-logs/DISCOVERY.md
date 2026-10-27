# Message logs — Discovery

Date:2026-10-21. New Platform capability. Runtime implementation not started; product answers reconciled below. Request authorizes feature planning/implementation, so no separate permission to draft the plan is needed once decisions are settled.

## 1. Outcome
Company operators need to inspect actual outgoing email attempts, status and failure reasons using screenshot MessageLogs.jpg as illustrative reference.
## 2. Current process
Existing three account sends render current company/default templates then use MailKit SMTP. No dedicated persisted message-log feature found; historical email outcomes cannot be reconstructed.
## 3. Actors/authority
User explicitly selects each company sees only its own records. No Super Admin viewer/global bypass. Independent View/Export permissions proposed; exact settings permissions depend on retention answer.
## 4. Ownership/truth
Platform owns Identity delivery and company email templates. Provider call outcome is the truth for attempted/accepted/rejected/uncertain transport state. Logs do not replace templates or authorize link actions.
## 5. Lifecycle
Read-only attempt history, no manual create/edit/delete, no resend (user). SMTP acceptance is not confirmed inbox delivery. Cancellation/connection loss during transfer may have uncertain outcome; do not manufacture success/failure or retry automatically.
## 6. Rules/exceptions
Company attribution only from verified existing rendering/delivery context; anonymous/unattributed sends cannot be assigned to first membership or client company. Scoped bounded paging/search/filters/export. Secrets/account URLs excluded from log storage and exports. Exact capture failure policy and snapshot schema and capture policy defined by the approved contract.
## 7. Quantities
N/A accounting/inventory/money; one intended recipient on current security messages. No new paid provider or commercial quota promise.
## 8. Time
Record attempt/completion UTC through TimeProvider. Filter explicit UTC boundaries; clients label dates. Per-company settings offer disabled/30/90/custom retention; ASSUMPTION: disabled initially,90 days prefilled, enable explicitly.
## 9. Clients/journeys
Administration > Message Logs, shared Web MyDataGrid and native Table/Cards/detail. Existing Error Logs is an implementation-shape reference only. EN/AR, scoped permissions, shared filter/loading/empty/error/detail shells mandatory. Online authoritative. Runtime writes only, so create/edit/mock editor Excluded; synthetic test fixtures Required.
## 10. Integrations
User selects existing Email only; SMS at actual need/provider, no SMS placeholder or fake filter. Existing confirmation/reset/invitation remain source sends. No real external test mail authorized. No new send/retry endpoint.
## 11. Files/reports
User approves detail and Excel export only, no resend. Report button in screenshot is not a separate authorized managed-report workflow. Export same server scope/filter with explicit cap and safe text cells; no fetching-all in client. Web download/native share use existing platform helpers.
## 12. Scale/operations
Unknown production volume; bounded query/export/capture payload required. No queue/delivery guarantee inferred. Existing inherited full-gate constraints remain separate. Bounded company policy cleanup is a separate dependent workflow.
## 13. Rollout
Additive Platform schema, standard migration apply on already-authorized experimental DB. Starts new attempts only; no historical backfill. Preserve template and existing SMTP/link behavior. Forward fix and no automatic resend on uncertain outcomes.
## 14. Acceptance
Company/global/foreign-scope denials; accepted/rejected/pre-send/cancel/uncertain handling; no secrets in stored snapshot/export; actual schema; filters/paging/XLSX; Web/native five-point audit; tests/builds/live isolated local SMTP capture only. Physical native acceptance remains existing PROD-026.

## Verified facts
Single actual SMTP implementation PlatformIdentityEmailSender; current templates and persisted invitation scope; no SMS sender found. See EVIDENCE.md.
## Requested decisions
Email only; company-only access; detail/Excel; no resend. Shared components and Administration grouping from prior explicit instructions.
## Open decisions
Product currently answering snapshot content versus metadata-only and automatic per-company retention/default. They block freezing required contract; no runtime implementation dependent on them yet.
## Planning consequences
Reuse/extend actual Platform sender; no parallel sender or module. Distinguish metadata truth from final inbox delivery. Preserve trusted scope and account token confidentiality. Decomposition/permissions/manifest follow final answers.

Confirmed answer2026-10-21: retain redacted sent-attempt content; add all retention options in Settings. Technical policy: bounded best-effort capture preserves mail outcomes, state remains pending/uncertain on unknown completion; RISK-011 owns availability limits.
