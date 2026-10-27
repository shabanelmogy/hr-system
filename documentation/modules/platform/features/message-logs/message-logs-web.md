# Company Message Logs — web profile

## 1. Ownership

Platform message-logs public feature boundary; typed types/services/hooks/components/pages. Service only transport; no API calls in visual components.

## 2. Current reuse inventory

Review current ErrorLogsPage and shared Header/Grid/Cards/form/DetailFields/CopyButton/safe preview/download before runtime. No new list/detail shell justified.

## 3. Navigation target

Administration > Message Logs /administration/message-logs, company-only exact View, separate Export. No SuperAdmin link. Settings queued sibling.

## 4. List target

P-001 shared PageHeader views/MyDataGrid/CardViewHeader/EntityCard/CardViewPagination and one server state. Preserve search/options/footer/record navigation. Criteria in toolbarFilters; no local filter/sort.

## 5. Forms/detail

Read-only shared MyForm/FormSection/DetailFields, safe HTML snapshot and persistent CopyButton. No entry/edit form. Export shared authenticated binary helper.

## 6. Snapshot presentation

Actual recorded subject/HTML after secret redaction, not live template re-render. Shared inert SafeHtmlPreview, no remote resources/link actions. Truncation marker honest.

## 7. Filters

Shared date fields with UTC conversion, status/template selects, recipient input and debounced search; invalid range suppresses query, reset page on criteria change.

## 8. Preview/copy

Historical snapshot loaded by ID only with View; copy includes permitted metadata and redacted plain content, no active actionURL or credentials.

## 9. Permissions

Exact route/query/direct handler checks, read-only history naturally supported, separate Export; disabled requests without company/global scope.

## 10. Cache

User/tenant/company/criteria and detail ID keys; context remount closes dialog and stale detail. Online authoritative; no persistent local body cache.

## 11. States

Shared pending/empty/error/retry/forbidden; Grid criteria remain reachable after empty/failure. Download feedback and row-cap message.

## 12. Locale/layout

Paired owning EN/AR, theme RTL and safe technical LTR. Narrow internal scroll, semantic status chips, accessible detail/copy/filter controls.

## 13. Verification target

Typed contract/service tests, scope/filter/XLSX/detail regressions and browser Grid/Cards/controls/paging/RTL/narrow. Full check/build and measured budget, no runtime success claimed.

## 14. Acceptance

Web queued until API Verified. RISK-009 existing shell budget and FOLLOW-007 full runner kept separate. No arbitrary Report/Chart/Import/native browser dialogs.

Web runtime evidence2026-10-21: public typed feature/service/query/controller/criteria utilities and shared Grid/Cards/detail now exist. Read-only MyForm/DetailFields, CopyButton full redacted report, generic SafeHtmlPreview scroll mode, shared ResetButton public export; Grid search/options/footer remain visible and criteria occupy toolbarFilters. Scope-safe placeholder metadata preserves paging without leaking previous rows. New route-scoped platform-messages namespace avoids loading body labels in unrelated shell routes; core contains only menu title. Two EN/AR browser journeys passed page/record navigation, filter/Cards/export, complete historical body scrolling and copy, RTL/narrow view. Eight focused/related unit cases passed. Final full check/build/measurement pending before stage exit.
