# Company email templates — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata
| Field | Value |
| --- | --- |
| Contract version | 2.0 |
| Plan ID | company-email-templates |
| Authorized slice | S1 Company account email templates |
| Child Feature ID | company-email-templates |
| Child feature name | Company account email templates |
| Owner | Platform |
| Depends on | existing company scope, Identity email sender |
| Execution status | Closed |
| Status evidence | PLAN.md canonical roadmap |

## 1. Child boundary and outcome
One registered-template customization/reset/preview/render workflow, three initial account-message bindings. Accept independently when actual known-company delivery uses overrides and anonymous delivery uses defaults. Outside: rental/business scenarios, campaigns, global editor, native editing.

## 2. UI Pattern Gate (mandatory before implementation)
| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| platform.company-email-templates.catalog | Web | /administration/email-templates | customize/preview/reset registered email | server catalog + dialog | P-001 | MyForm sectioned editor; C-01 dialog C-02 Grid | web-next/src/platform/company-localizations/pages/CompanyLocalizationsPage.tsx | Adapted | Grid/Detail/Edit/Preview Required; Cards/Tree/Report/Import/Export/Chart Excluded | shared loading/empty/retry/forbidden; dirty discard; 409 reload preserves draft | online authoritative | sample preview; local valid mock draft only | TenantMember + exact View/Edit/Reset; trusted tenant/company | responsive field/editor stack, en/ar/theme RTL, accessible rich field and invalid focus | no arbitrary create; rich HTML field replaces caption text field |
| platform.company-email-templates.catalog | Mobile | /email-templates | inspect/preview effective template | read-only catalog/details | P-001 | shared modal/card preview | mobile-react/src/platform/tenant-administration/company-localizations/presentation/screens/CompanyLocalizationsScreen.tsx | Adapted | Table/Cards/Detail/Preview Required; Edit/Create/Tree/Report/Import/Export/Chart Excluded | shared loading/empty/retry/forbidden; dirty/conflict N/A read-only | online authoritative; no offline token/template cache | sample-only preview; editor mock Excluded | same company View; no mutation handlers | phone stacked, tablet table, touch labels, en/ar/RTL | read-only explicitly chosen by user |

## 3. Closest existing reference
Reviewed company localization Web page and CompanyLocalizationDialogs.tsx; native CompanyLocalizationsScreen.tsx. Reuse typed hooks/service, company scope/cache keys, Grid toolbar/search/server paging and shared form/confirmation. Email content and variables replace caption-specific rules, never another visual shell.

## 4. Reuse and composition contract
Web shared ContentWrapper/PageHeader/MyDataGrid/toolbarFilters/FeedbackState/ConfirmationDialog/MyForm/MyTextField/MySelect/FormSection. New generic MyRichTextField only because inventory found no editor: react-hook-form value/error/focus, localized toolbar labels, insertion and read-only. Domain rules stay in feature. Generic HTML preview sandbox component prevents scripts/network/navigation. Native AppScreen/AppPageHeader/AppListScreen/AppDataTable/AppDataCard/AppModal/AppStateView/AppText and existing preview host where compatible; no raw table/modal shells.

## 5. Screen and workspace contract
Required Web list: template name, language, subject, default/customized state, actions; language/status filters in shared toolbar, shared search/footer paging. Edit dialog: metadata/variables, subject, formatted body, sample preview, save, close, explicit reset confirmation outside form. Mobile same effective metadata and sample preview, no edit/reset. Excluded extra views/creation/CC/BCC/attachments/HTML source. Saving enabled and validates fields; token chips insert literals, never raw JSON input.

## 6. Typed transport and server criteria
GET /api/v1/company-email-templates?language=en&page=1&pageSize=10&search=&status=all; PUT /{id} {language,subject,body,expectedRevision}; POST /{id}/reset {language,expectedRevision}; POST /{id}/preview {language,subject?,body?} with sample-only values. Responses include catalog metadata/variable descriptors, effective content, customization flag and aggregate revision. View/Edit/Reset each bind exact permissions. Page size 1..100, subject 1..200/no CRLF, HTML 1..50000, language en/ar, catalog IDs only, status all/customized/default. Stable Invalid/Forbidden/Conflict/NotFound errors and field-specific validation. Platform owns company settings/children, migration, unique tenant/company root, monotonic revision/rowversion and locked transaction. No foreign module tables or Contracts for unused consumers.

### Permission Action Matrix
| Actor | Resource | Action | API/message | Exact permission | Scope | Read-only/direct guard | EN label | AR label | Denial |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| company member | CompanyEmailTemplates | list/detail/preview | GET list, POST preview | CompanyEmailTemplates:View | trusted company | safe read-only available on both clients | View email templates | عرض قوالب البريد | missing grant/foreign scope/global actor denied |
| company editor | CompanyEmailTemplates | customize | PUT template | CompanyEmailTemplates:Edit | trusted company | Web edit/save guard; Mobile Excluded | Edit email templates | تعديل قوالب البريد | read-only/missing grant denied |
| company editor | CompanyEmailTemplates | reset | POST reset | CompanyEmailTemplates:Reset | trusted company | Web confirmation/direct guard; Mobile Excluded | Reset email templates | استعادة قوالب البريد | missing grant denied |
Create/Archive/Restore/Delete are Excluded: definitions are registered, overrides reset only.

## 7. Create, edit, view, and lifecycle contract
Catalog defaults exist without rows. First customize validates safe HTML/required variables then creates aggregate/override. Edit compares expected revision; no-op no revision. Reset confirms and removes override, increments scope revision only when changed. Preview uses draft or effective content with dummy data. Mobile view only. Sender binds trusted invitation/current verified scope or shipped default; real token/link creation remains unchanged.

## 8. UX states, permissions, offline, and mock data
Shared load/empty/error/retry/forbidden. Edit/Reset independent grants and read-only guards; view users can preview. Dirty close uses existing form protection. Conflict retains draft and offers reload without silent overwrite. Online authoritative/no offline mutation. Preview sample data and valid local draft mock are synthetic, never synthetic scope/rowversion or automatic save/send. No remote preview resources.

## 9. Concurrency, transactions, and consistency
SQL company-scoped lock serializes first write/reset, expected aggregate revision plus rowversion/unique constraints. Audit and template commit atomically. Reset preserves root/revision against ABA. Cache keys include trusted tenant/company, language/search/status/page; invalidate effective details/catalog after write; scope change clears open editor/preview. Existing SMTP failure behavior retained; no claim of durable queue/deduplicated delivery.

## 10. i18n, RTL, accessibility, and responsive behavior
Paired owning core EN/AR labels; language changes direction of email body, shell follows existing theme. Lazy rich editor avoids SSR initialization; valid field error/focus behavior, labeled keyboard toolbar, no native dialogs. Grid/filter/footer narrow/large browser check. Mobile sample preview read-only, readable selectable text/fallback, phone/tablet and dark/light fit.

## 11. Vertical execution ledger (strict one-active-step gate)
| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| --- | --- | --- | --- | --- | --- |
| 1 | API | Verified | plan/preflight | source/security/renderer/DB tests and migration | owning evidence book |
| 2 | Web | Verified | API Verified | typed shared editor/Grid and browser journeys | owning evidence book |
| 3 | Mobile | Verified | Web Verified | read-only route/preview tests/contracts/export | owning evidence book |
| 4 | Integrated live verification | Verified | Mobile Verified | real API/schema/captured MIME without network and client checks | owning evidence book |
| 5 | Documentation and closure | Verified | integrated Verified | books/manifests/generated checks/customer guide | owning evidence book |

## 12. Verification contract
Domain/catalog invariants; unknown/missing token and action URL placement; malformed HTML/JS/CSS/links; one recipient; default/culture fallback; trusted company/invitation, cross-company/global denials; revision/no-op/reset/first writer and atomic audit; actual migration/live authenticated HTTP. Web tests/types/architecture/i18n/lint/build, browser EN/AR edit/preview/reset/read-only/shared controls/paging; native tests/types/contracts/i18n/export and five-point audit with edit/create Excluded. Keep inherited full-gate failures separate, PROD-026 physical acceptance deferred by user.

## 13. Child exit gate
Phase 06 Verified only with evidence; then education and reconciliation/recipe generation. Never equate DTO addition with working editor or claim production mail deliverability. No sibling placeholders.

**Next-step rule:** later stages remain queued until the preceding stage is Verified; no sibling feature runtime before integrated Verified and documentation/closure Closed.

Closure 2026-10-21: Phase06 Verified for authorized development scope, then education created. All five stages Verified; see owning evidence ledger and PROD-026/027/RISK-009/FOLLOW-006/007/008 for separate release/inherited items.
