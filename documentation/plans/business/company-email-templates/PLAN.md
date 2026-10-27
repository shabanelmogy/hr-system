# Company email templates — Master plan

## 0. Plan metadata
| Field | Value |
| --- | --- |
| Plan ID | company-email-templates |
| Owning module | Platform |
| Status | Closed |
| Planning method version | 2.0 |
| Last reviewed | 2026-10-21 |

Authorization: requester asks to create templates, independently customized per company, initially confirmation/reset/invitation; Web edit and preview, Mobile preview only. Requester explicitly accepts shipped defaults when no verified company exists. Planning and implementation are authorized. Existing experimental database migration authorization and PROD-026 physical native deferral persist; no production deployment or external test email.

## Exact authorized scope
S1 Company account email templates is a Single feature: one registered-template edit/reset/preview/render workflow with three definitions integrated into existing Identity delivery. Owner Platform, extending its MailKit sender, not a new module. Required: en/ar subject/rich HTML body, allowlisted variables with insertion/sample descriptions, company overrides, sanitized sample preview, optimistic concurrency, atomic audit and actual delivery binding. Administration > Email Templates hosts the shared Web Grid/editor; native Table/Cards show details and preview only.

Excluded: arbitrary template creation/deletion, campaigns/bulk delivery, real-send test action, attachments, CC/BCC on account-security messages, HTML source mode, remote images/tracking/styles, scripts/executable expressions, global editable templates, SMTP configuration UI, rental-specific scenarios. Future use cases register definitions and bindings when real consumers exist; HR recruitment settings remain HR-owned.

## Current owner and relationship
At discovery PlatformIdentityEmailSender owned all three hardcoded subjects/bodies, server-generated links and SMTP/TLS. Add a new Platform slice and extend that sender's rendering. Invitations supply persisted TenantId/DefaultCompanyId. Confirmation/reset can precede authentication: never infer company from first membership or client payload. See EVIDENCE.md.

## Rules and lifecycle
- Catalog IDs email-confirmation, password-reset, user-invitation; en/ar defaults and labels, registered allowed/required variables. No executable templating language.
- Mandatory action URL occurs exactly once as the action anchor href, never in subject/another URL. Link host/path/token remains existing trusted server generation. Ordinary values HTML-encoded; subjects reject CR/LF.
- Company settings aggregate holds monotonic revision and child overrides keyed template/language; unique tenant/company root, row version, SQL application lock, expected revision and atomic security audit. First edit creates root/child; reset removes child, preserves root revision against ABA. No-op preserves revision. Stale writes return 409, preserve draft.
- Server parser-based sanitization with strict formatting tags/attributes/schemes; reject relative/non-HTTPS ordinary links, remote resources/forms/iframes/events. Re-sanitize effective content during render. Preview uses sample-only names and example.invalid URLs, no real tokens or recipient queries.
- Account emails have exactly one intended recipient: CC/BCC excluded to avoid leaking account-action links. Future business templates may define another recipient policy independently.
- Resolve invitation company from persisted tenant/default company and verify it; other sends use current authenticated company only with verified membership, otherwise shipped defaults. No arbitrary company request argument. Database failures do not masquerade as successful delivery.
- Editing/preview culture explicit en/ar. Sending uses current request UI culture, English fallback; missing language override uses that language's shipped default. HTML direction follows language.
- TenantMember and CompanyEmailTemplates:View/Edit/Reset; Preview requires View. Server derives scope and rechecks membership. No SuperAdmin bypass or global editor. Existing direct-user/role authorization preserved.
- Subject <=200 chars, HTML <=50000, three definitions/two cultures initially; bounded server-side catalog search. No offline mutations or fabricated mock identities. Save enabled for field validation; existing MyForm owns focus/dirty/conflict behavior.

## Client and applicability
P-001 catalog/Grid with shared form dialog, reusable rich HTML field and sample preview. Web edits/previews, Mobile read-only Table/Cards and preview. No chart/report/import/export/tree. Shared library inventory found no existing rich editor; add one lazy-loaded generic field, keep feature rules outside shared code. See exact sources and states in decomposition contract.
Product/design: images are illustrative, existing shared UI prevails. Privacy: no real tokens in preview/logs, no extra recipients/tracking; audit templates only. Commercial: existing SMTP only, no new campaign/fees/retention promises. No accounting/stock posting. Physical native/production provisioning remain existing release constraints.

### Feature Decomposition Gate
| Slice | Decision | Feature ID | Screen/Workflow Contract | Boundary |
| --- | --- | --- | --- | --- |
| S1 Company account email templates | Single feature | company-email-templates | documentation/plans/business/company-email-templates/decomposition/company-email-templates.md | One company template workflow, three catalog bindings. |

**ACTIVE_FEATURE_STEP:** None
| Order | Feature ID | Status | Contract |
| --- | --- | --- | --- |
| 1 | company-email-templates | Closed | decomposition/company-email-templates.md |

## Gates and acceptance
G0 pass: user scope/ownership and evidence. G1 pass: registered lifecycle, independent permissions, recipient/scope/fallback rules, no unresolved product question. G2 pass: company aggregate/revision/lock/audit, typed CQRS ports, sanitizer/render contract, existing SMTP. G3 pass: explicitly different Web/native capabilities and completed shared-component UI Pattern Gate. G4 pass for development/automated scope: migration/schema checks, injection/token/denial/concurrency/fallback tests, browser journeys and captured MIME messages without network, forward fix and education. Existing PROD-026, RISK-009, FOLLOW-006/007/008 remain distinct inherited/release constraints, not passed gates.

Execute API → Web → Mobile → integrated live verification → documentation/closure, one active stage. Apply migration before claiming schema verified. Verify shared Grid toolbar/paging, validation/dirty/conflict and RTL/narrow layouts. Native five-point audit classifies creation/edit/mock as Excluded by explicit product decision. Test scope spoofing, first writer/stale/reset/no-op, malformed HTML/URLs, required/unknown variables, exact recipient, trusted invitation scope and anonymous fallback in both cultures. No external test send. Additive tables survive rollback; explicit reset restores shipped contents, forward fixes preserve company isolation. Phase 06 evidence precedes customer education/closure.


## Verified development delivery and closure — 2026-10-21
All five vertical stages Verified; contract Closed. Phase06 Verified before customer guide creation; Phase07 Closed after canonical reconciliation. API1109/12 assemblies, final scoped Web12 tests/two EN/AR browser journeys, native44/nine suites, real SQL migration/concurrency/audit and21 live HTTP cases passed. Full Web check/build and native types/architecture/contracts/i18n/export pass. Current client/API localization fingerprint/runtime request passed. Runtime sources, four books, actual-file manifest and eight generated packets are registered.

Release/inherited separation: same seven protected-shell bundle overages RISK-009; initial newly exceeded Ledger Setup routes corrected without raising budgets. Native full lint six inherited errors FOLLOW-006, Expo Doctor15 patch mismatches FOLLOW-008; scoped checks pass. Physical native PROD-026 and approved-provider received-mail PROD-027 remain open. No production release or external mail sent. Customer education: education/company-email-templates.md.
