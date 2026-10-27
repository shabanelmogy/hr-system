# Company Message Logs — api profile

## 1. Ownership

Platform technical mail/history owner. Domain attempt invariants; Application narrow read/capture/scope ports/CQRS. Infrastructure parser/SMTP adapter/isolated capture context; thin Presentation.

## 2. Current sources

Existing Identity sender and CompanyEmailTemplateStore AccountEmailRenderer are verified. ErrorLogStore supplies bounded scoped list/XLSX shape only; no copied system-wide permission.

## 3. Target contracts

GET /api/v1/message-logs criteria; GET /{id:guid}; GET /export. Metadata rows versus detail snapshot separated. No sender/retry/client capture ingress endpoints.

## 4. Authorization

TenantMember + MessageLogs:View/Export; derive actor scope/recheck active tenant/user/company membership and deny SuperAdmin/missing/foreign company.

## 5. Validation

UTC ordered bounds, page1..1000000,size1..100, search<=200/recipient<=254, known status/template IDs. Fixed cause/phase, numeric SMTP status. Subject512/snapshot65536; safe truncation.

## 6. Persistence target

Additive Platform MessageLogEntries table, Company navigation/FK, trusted tenant/company, UTC/indexes, one generated attempt ID per call. Isolated capture context, explicit company query filter; no settings table yet.

## 7. Queries/export

Newest UTC/ID fixed order; date/status/template/recipient/search criteria server-owned, projected metadata. Excel same scope/filter cap5000 with formula-safe text; snapshot detail only.

## 8. Capture lifecycle

Pending before provider; accepted only after SendAsync acceptance. Rejected/pre-transfer failure failed, pre-transfer cancellation cancelled, transfer communications/cancel uncertain. Accepted not reclassified by disconnect failure. No replay.

## 9. Sender integration

Preserve links/TLS/current caller behavior. Narrow scope resolver reused by renderer and sender; unscoped sends not assigned. Redacted final-content snapshot before storage. Bounded best-effort start/complete independent of business transaction.

## 10. Verification

Target tests: phase/cause/secret omission/scope/default snapshot/immutability/no replay/capture DB noninterference, query/Excel/ACL, real schema. No external test send; local fake transport only. Runtime not implemented.

## 11. Acceptance

Preflight only; API Active, no source/schema/test success claimed. RISK-011 capture availability and PROD-026/027 manual acceptance remain. Apply standard migration before API Verified.

Persistence relationship reconciliation: current PlatformCompany is Infrastructure-owned Identity state. Keep Domain free of Infrastructure references; configure the real Company foreign key with a unidirectional HasOne<PlatformCompany> mapping in Infrastructure. Do not move the existing company model or add a forbidden Domain navigation merely for symmetry. Read authorization reuses ICompanyAccessService rather than depending on Error Logs store.

API stage evidence2026-10-21 supersedes preflight pending wording above: actual Domain/MessageLogs, Application/Features/MessageLogs, Infrastructure/Features/MessageLogs and V1 controller registered. Standard migration applied. Final full solution1125 tests/12 assemblies pass, real SQL secret-free snapshot/FK/terminal concurrency verified. Narrow scope resolver/SMTP seam and isolated bounded5sec recording preserve caller outcomes and no replay. Web handoff: typed criteria/metadata/detailHTML/export, no settings route/table yet.
