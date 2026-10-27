# Company email templates — domain review

## 1. Scope and authority
Reviewed 2026-10-21. Implemented Platform S1: confirmation, password reset and invitation, company-only EN/AR customization. Canonical plan/contract own user decisions. Screenshots illustrate the concept, not rental/fine business scope.

## 2. Verified current behavior
Both clients expose Administration > Email Templates. Web edits/previews/resets; native lists/previews only. Code-owned defaults exist without database rows. List returns complete editable rows and variable descriptors; no separate detail endpoint.

## 3. Ownership and relationships
Platform owns Domain/Application/Infrastructure/Presentation. Existing PlatformIdentityEmailSender keeps link/token/SMTP/TLS authority and uses IAccountEmailRenderer. Persisted invitation tenant/default company is verified. Implicit session scope requires recipient identity match and active membership. Anonymous/ambiguous contexts use defaults, never first-membership inference. HR recruitment remains HR-owned.

## 4. Aggregate lifecycle
CompanyEmailTemplateSettings root owns overrides keyed template/language. Unique tenant/company, rowversion, expected monotonic revision and SQL scoped lock protect first write/reset. Template mutation and before/after audit commit atomically. Reset removes override but preserves root/revision against ABA. No-op keeps revision; stale writes conflict.

## 5. Security and content
TenantMember plus independent CompanyEmailTemplates:View/Edit/Reset. Server rechecks company access, no global editor/bypass. Subject <=200/no controls, body <=50000. FIRST_NAME and exactly one ACTION_URL anchor href only. Parser allowlist rejects executable markup/resources/unsafe URLs; dynamic values encoded. One intended recipient, no CC/BCC. Preview uses dummy names/example.invalid, no tokens/recipient lookup/SMTP.

## 6. Applicability
Web Grid/detail/edit/reset/preview Required; Cards/Tree/Chart/Report/Import/Export Excluded. Native Table/Cards/detail/preview Required; create/edit/reset Excluded by user decision. Arbitrary definitions, campaigns, attachments, tracking, HTML source, global editor and rental scenarios Excluded. New actual consumers require authorized registry/binding extensions.

## 7. Shared composition
Web reuses ContentWrapper/PageHeader/MyDataGrid/toolbarFilters/feedback/confirmation/MyForm/MyTextField/MySelect/FormSection. Company localization supplies scope/editing discipline; Countries supplies action-cell pattern. New generic lazy MyRichTextField and SafeHtmlPreview contain no email business rules. Native reuses AppScreen/AppListScreen/AppDataTable/AppDataCard/AppFilterFormButton/AppModal/AppStateView plus generic AppHtmlPreview. Paired EN/AR labels.

## 8. Schema and delivery evidence
Migration 20261020201511_AddCompanyEmailTemplates generated/applied through the standard module script to authorized development DB. Real SQL tests verify tables/concurrency/audit/reset/no-op. Live authenticated HTTP verifies content/preview/save/reset and restores original content. Actual sender MIME builder captured without network, verifying subject/HTML/plain text/one recipient. No external delivery claimed.

## 9. Acceptance and five-point audit
API: 1109 tests/12 assemblies, zero failures/skips. Web: full check/build, five unit cases and two EN/AR browser journeys passed. Native: 44 tests/nine suites, types/architecture/contracts/i18n/Android export passed. Web creation means customizing an existing definition, not creating a catalog entry; edit/view/list/filter/sample journeys implemented. Native creation/edit Excluded; view/list/filter/sample implemented. Physical acceptance PROD-026. Full native lint FOLLOW-006, compatibility FOLLOW-008, full Web Vitest FOLLOW-007 and bundle RISK-009 remain separately recorded.

## 10. Closure and limits
Phase 06 Verified for authorized development/automated scope precedes education. Canonical books/source manifest/generated packets own handoff. PROD-027 owns approved SMTP/provider/received-client acceptance. Same renderer supplies preview and messages, but email clients may vary spacing/fonts. No durable queue, exactly-once transport or inbox-placement guarantee. Reset restores defaults; additive schema and forward fixes preserve company isolation.


Message Logs relationship2026-10-21: trusted company resolution extracted into IAccountEmailScopeResolver/AccountEmailScopeResolver and reused by renderer and actual sender. Template language/content/link/fallback contracts and both template UIs are unchanged. Sender now records bounded secret-free observational company attempts through the separate message-logs slice and uses a narrow SMTP transport seam; no replay or global template editor introduced. Current delivery tests are rerun with that slice.
