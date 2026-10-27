# Company email templates — Web profile

## 1. Ownership
src/platform/company-email-templates owns typed contracts, validation, services, hooks and UI. Only services call apiService. Thin App Router adapter; server owns business policy.

## 2. Reviewed reuse
Company localization scope/editing reference; Countries GridActionsCellItem reference. ContentWrapper/PageHeader/MyDataGrid/FeedbackState/ConfirmationDialog/MyForm/MyTextField/MySelect/FormSection reused. Inventory found no suitable editor; new generic shared public sub-APIs avoid local copies.

## 3. Navigation
Administration > Email Templates, /administration/email-templates, not Settings. Exact View grant/current company/global denial. Independent Edit/Reset and read-only guards. Generic role Reset action label corrected from Reset text.

## 4. Grid
MyDataGrid owns toolbar/search/options/footer/record navigation. Server rows/count/paging, language/status toolbarFilters and emptyContent. Name/subject/status-chip/icon-action columns, double-click detail. No local filtering/sorting or replacement shell. Three rows use record navigation; next-page absent on single page. Shared page sizes10/25/50.

## 5. Forms
MyForm with RHF/separate Zod schema/zodResolver. Save enabled, shared field error/focus/dirty-discard. Request.Subject/Body aliases mapped. Shared confirmation handles reset. View-only mode permits preview without Save.

## 6. Rich field
shared/components/forms/rich-text/MyRichTextField uses Tiptap3.32.0, lazy dynamic boundary and immediatelyRender:false. Generic value/change/blur/ref/error/readOnly/direction/insertion contract. Bold/italic/underline/lists/undo/redo active state via useEditorState. Feature supplies business tokens; server validates content. No broad forms-barrel eager editor import.

## 7. Variables/mock
Descriptors show localized names/tokens/sample values. FIRST_NAME can append to subject; body cursor insertion supports action anchor. Local mock changes valid sample subject only, no fabricated scope/revision or save/send. No HTML/JSON source, CC/BCC or attachments UI.

## 8. Final preview
Current unsaved draft renders on server into final subject/HTML with sample substitutions, language/direction. Scroll/focus result. Changed draft invalidates snapshot until refreshed. Generic SafeHtmlPreview is inert sandbox/CSP iframe, no network/script/navigation. Same content renderer supplies mail; spacing/fonts may vary by recipient application. No actual send.

## 9. Permission/context defense
Route/hook/direct callbacks enforce exact grants. Queries disabled for missing/global scope. User/tenant/company workspace key closes old dialog on scope change. Server remains authority.

## 10. Cache/concurrency
Keys include user/tenant/company/language/search/status/page/size. Scoped invalidation on save/reset. Expected revision prevents overwrite; conflict preserves draft and offers reload through dirty protection. Reset failure remains visible. List full rows remove separate detail request.

## 11. Feedback
Shared loading/empty/error/retry/forbidden, beneath-field errors, preview pending state, discard/reset confirmations. No alert/confirm/native validation dialog.

## 12. Locale/layout/accessibility
Paired core/platform-auth EN/AR. Theme RTL shell; selected email language controls body. Labeled toolbar, active aria state, first-invalid focus and accessible preview region. Large/narrow EN/AR browser checks, internal scroll. Company-only labels excluded from global Super Admin localization metadata.

## 13. Verification
Five schema/service cases, full npm check and production build passed. Two Playwright EN/AR journeys: invalid focus, editor typing/strong state/undo/redo, unsaved final sample preview/save/reset/shared footer/record navigation/narrow layout. Captures .codex-tmp/email-template-preview-en.png and ar.png plus email-templates-en.png/ar.png. Source tests in manifest, temporary screenshots not required source files.

## 14. Acceptance/performance
Web Verified for development scope. Feature-local lazy editor boundary retained. Final metrics recorded in RISK-009; build success does not erase repository release budget failure. FOLLOW-007 tracks inherited full Vitest collection issue; focused suites explicitly pass. PROD-026/027 retain physical native/provider acceptance.


Message Logs relationship2026-10-21: trusted company resolution extracted into IAccountEmailScopeResolver/AccountEmailScopeResolver and reused by renderer and actual sender. Template language/content/link/fallback contracts and both template UIs are unchanged. Sender now records bounded secret-free observational company attempts through the separate message-logs slice and uses a narrow SMTP transport seam; no replay or global template editor introduced. Current delivery tests are rerun with that slice.
