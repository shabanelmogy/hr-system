# Company email templates — Implementation request

Mode: new feature. Plan company-email-templates, authorized S1 Company account email templates. Single feature, exact version 2.0 contract at documentation/plans/business/company-email-templates/decomposition/company-email-templates.md. Owner Platform. User authorizes implementation/planning, no external sends or production deployment.

## Existing-System Relationship Review
Independent same-module slice, extend current PlatformIdentityEmailSender rendering and invitation adapter company binding; reuse PlatformDbContext scope/transaction/audit, existing company localization UI structure, existing SMTP/token/link generation. No foreign HR persistence or new module. Current-source evidence is central EVIDENCE.md; target rules are PLAN.md and contract.

## Business Rules Matrix
| Rule | Owner | Enforcement | Outcome/test |
| --- | --- | --- | --- |
| Trusted company + membership and exact actions | Platform | authorization/store | forbidden; foreign/global/missing grant tests |
| Registered definitions, en/ar and required action variable | Domain | aggregate/catalog policy | invalid; missing/unknown token tests |
| Safe HTML/URLs and encoded values | Platform renderer | parser plus placement validation | field error; injection/URL tests |
| Monotonic expected revision, no-op/reset/atomic audit | Domain + store | lock/concurrency/transaction | 409 or one commit; first-writer/reset/audit tests |
| Known scope template or standard fallback | existing sender | trusted context/invitation adapter | captured company/default cultures and one recipient |

## Edge Cases & Validation
Missing company uses default, never first membership. Unknown definition/language denied. Blank/oversize subject/body field validation. Script/events/remote resources/unsafe URL rejected/sanitized authoritatively. Action placeholder malformed/missing/duplicated denied. Stale revision retains draft. First-write/reset races serialized. Transport failure preserves current failure behavior. Missing View/role or global actor denied. No-op avoids revision/audit. Offline edits Excluded. Money/stock/import/report N/A because account template configuration only.

## Impact Matrix
API Add narrow CQRS/catalog/renderer/store/controller/schema/tests; Extend Identity sender and invitation adapter/DI/permissions/locales. Web Add feature and generic lazy rich field/preview; Reuse Grid/form/feedback, Extend Administration navigation/route permissions/locales/catalog. Mobile Add clean read-only feature and native shared preview composition; Extend route/navigation/locale/matrix. Persistence Add Platform migration. Audit Reuse atomic SecurityAuditEvents. External providers Reuse SMTP, no extra recipient or external test send. HR/campaigns/files N/A outside scope.

## Phase 00 decision
Preflight complete; baseline 173 recipes passed. Four applied books and final current-evidence manifest registered before runtime. API active, Web/native/integrated/docs queued. Runtime paths added to manifest only when they exist. Customer education waits for Phase 06 Verified. Explicit Required/Excluded platform capabilities and tests are in the contract; no placeholders or inferred approvals.
