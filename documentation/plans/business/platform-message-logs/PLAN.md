# Company message logs — Master plan

## 0. Plan metadata
| Field | Value |
| --- | --- |
| Plan ID | platform-message-logs |
| Owning module | Platform |
| Status | Implementation Ready |
| Planning method version | 2.0 |
| Last reviewed |2026-10-21 |

User explicitly authorizes feature implementation and answers scope; planning is included. Existing development DB application authorization and deferred physical native acceptance remain. No production deployment or real external test email.

## Outcome/authority
Inspect verified-company email attempts and redacted sent-attempt snapshots, using existing Administration UI. Actual sender outcome is truth. Platform registry/template/current context remain their owners; log is observational, never a second sending engine. Existing source inventory/decisions/spec precede this plan.

## Required scope
S1 Message Logs V1: actual current account Email attempts, company-only View/Export, exact metadata/snapshot, shared Web Grid/Cards/native Table/Cards/detail and filtered Excel. S2 Company Message Log Settings: per-company Settings tab, View/Edit, explicit disable/enable and30/90/custom1..3650 days, concurrency/audit/bounded cleanup. No global viewer or bypass. No historical backfill.

Excluded independently on Web/Mobile: compose/create/edit log, manual delete, resend/retry, SMS provider/filter placeholder, Report/Chart/Import/Tree, CC/BCC fields for current one-recipient messages, live account links/tokens, attachments/remote resources. Future work requires a real consumer and authorization, no runtime placeholders.

## Domain/business decisions
Log attempt has generated ID, trusted tenant/company, optional initiating user/correlation, registered template/culture, UTC start/completion/duration, email/recipient, bounded subject and redacted HTML snapshot, snapshot truncation marker, state/phase/fixed cause/SMTP numeric code. One attempt per actual caller invocation, not deduplicated across legitimate repeated sends. In-flight record starts pending; completion accepted, failed, cancelled or uncertain. Accepted means server accepted upload. Disconnect failure after acceptance remains accepted, existing caller exception behavior retained. Communication/cancellation during upload is uncertain unless server explicitly rejects. No automatic retry. No raw provider response/exception text/secrets.

Capture runs in separate isolated context with bounded best-effort writes so logging failure cannot invalidate accepted mail or corrupt business DbContext; fixed operational warning only. Process failure before persistence may omit history; pending after crash does not assert delivery. RISK-011 is release/availability limit, not a promise of compliance-grade durability. Snapshot is generated from final HTML with account action removed and all links deactivated; no current-template re-render when viewing history. No recipient lookup or secret available from browser export.

Reuse existing trusted rendering scope through a narrow shared Platform application port; do not duplicate company inference in a log. Anonymous/unattributed sends remain outside company history. Logged snapshot preserved when templates later change. Reads/export derive scope and active membership, no client authority. Stable newest-UTC/ID order; filters bounded; export max5000 rows, reject larger result and ask narrower filter. Content detail only, not list/export; no executable Excel formulas.

Settings default disabled/90 days (announced assumption), enable and adjust1..3650, preset30/90/custom. Root unique tenant/company and monotonic revision/rowversion; SQL lock prevents first-writer race; no-op preserves revision; audit and policy atomic. Cleanup runs bounded hourly, uses persisted enabled policy and exact tenant/company keys, UTC cutoff exclusive; no mutation on disabled policy. Shorter policy affects next cleanup, cannot undo deleted history. Concurrency rechecks policy before delete under same scoped lock.

## Product/privacy/commercial applicability
Screenshot is illustrative; shared components govern final UI. Both clients Required, online authoritative; no durable client cache/outbox. Log includes recipient/name/subject personal data for authorized company troubleshooting; action secrets removed before storage, safe HTML host, exact ACL also on export. No legal-retention/compliance promise; production privacy/provider review remains existing notes. No new paid provider/campaign/subscription rule or accounting/stock effect.

### Feature Decomposition Gate
| Slice | Decision | Feature ID | Screen/Workflow Contract | Boundary |
| --- | --- | --- | --- | --- |
| S1 Message Logs V1 | Decompose | message-logs | documentation/plans/business/platform-message-logs/decomposition/message-logs.md | Attempt capture/read/detail/export. |
| S1 Message Logs V1 | Decompose | message-log-settings | documentation/plans/business/platform-message-logs/decomposition/message-log-settings.md | Dependent settings/purge workflow, separate user job. |

## Canonical roadmap
**ACTIVE_FEATURE_STEP:** message-logs
| Order | Feature ID | Status | Contract | Entry/exit |
| --- | --- | --- | --- | --- |
|1|message-logs|Active|decomposition/message-logs.md|API→Web→Mobile→integrated→docs Closed|
|2|message-log-settings|Queued|decomposition/message-log-settings.md|Message logs Closed; own five stages before closure|

Only current child scaffold/runtime; no S2 placeholder table/UI/worker before S1 closes. Full capability accepted only after both children.

## Gates and adversarial review
G0: one owner, source/spec/user scope settled. G1: transitions/permissions/data/scope rules and exclusion matrices complete. G2: isolated capture, parser snapshot, narrow resolver/read ports, additive schema/indexes/constraints, concurrency/no replay defined. G3: reviewed P-001 lists/detail and P-005 settings, full per-platform states and shared controls, explicit disabled policy UI. G4: ordered children/vertical stages, actual migrations/schema, hostile snapshot/SMTP phase/scope/conflict/XLSX tests, live isolated development acceptance and education. Challenges resolved: SMTP accepted is not delivered; crash/cancel uncertainty honest; logging failure cannot trigger resend; unscoped sends not guessed; shortened retention explicit/locked; unchanged templates cannot rewrite history. No blocking Required question.

## Verification/rollout
Apply each owning migration through standard module script on authorized experimental DB. Additive rollout starts new attempts only. Test state/phase classification, no live tokens in DB/detail/export, no remote preview navigation, failed-capture noninterference, active membership/global/foreign-company denials, criteria validation and row cap, actual XLSX and SQL concurrency. Web/nav/shared Grid/Cards/filter/footer/detail/export and native parity/permissions/online tests, EN/AR/RTL/narrow view; full platform gates and documented inherited failures. Settings second child tests exact cutoff/disabled/batches/competing edits/no-op/audit. Phase06 Verified before customer guide. PROD-026 native and PROD-027 provider/manual checks remain; no real external send. Forward fix preserves schema; disabling policy stops future cleanup, cannot restore deleted rows.

Persistence relationship reconciliation: current PlatformCompany is Infrastructure-owned Identity state. Keep Domain free of Infrastructure references; configure the real Company foreign key in Infrastructure using a unidirectional `HasOne` mapping for `PlatformCompany`. Do not move the existing company model or add a forbidden Domain navigation merely for symmetry. Read authorization reuses ICompanyAccessService rather than depending on Error Logs store.
