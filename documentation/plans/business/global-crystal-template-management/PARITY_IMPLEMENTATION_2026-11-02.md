# Global Crystal Report Manager — Next.js parity and company access

Current implementation record for GCT-1. The requester-approved scope is
`PARITY_SCOPE_2026-11-01.md`. This record supersedes the narrower implementation
receipt dated 2026-11-01. Phase 06 remains **Not Verified** until integrated
hosted/browser/native acceptance; Phase 07 has not started.

## 1. Reference comparison

The actual reference is `web-next/src/modules/reporting/crystal-report-manager/`.
The Angular manager uses its own shared PrimeNG adapters and MyDataGrid. The
following behaviors are implemented, including the archive and ACL functionality
that the requester explicitly required. Rendered visual parity remains pending.

| Next.js source / journey | Angular implementation |
| --- | --- |
| CrystalReportManagerPage.tsx: entity All, status/search/server paging, title/entity/key/version/updated/status, refresh | GlobalTemplateManager + GlobalTemplateState; API lists only entities the actor may edit; opening a row does not change the All filter |
| CrystalReportImportDialog.tsx: server RPT discovery, entity/search, title/subject/file/size, registration/rejection state | Register existing reports dialog; shared server-paged grid; registered and rejected entries remain visible with actions gated |
| Existing-file registration | Source ID + expected hash; copies the existing source through inspected create; v1 draft; no local reupload, overwrite or automatic publication; refreshes list and open discovery dialog |
| CrystalReportCreateDialog.tsx: required entity/file, description counter, SummaryInfo hint, field errors and dirty guard | Shared FormContainer, OptionSelect, FileField, TextField, FormCloseGuard; enabled Save validates and focuses the first invalid field |
| CrystalReportDetailDialog.tsx: Overview / Versions / Permissions | Shared ContentTabs; overview card and current-source download; version grid; role ACL composition |
| CrystalReportVersionList.tsx: metadata/status/reason/hash/schema, source download, revalidate, explicit publish | Shared grid exposes source name, title/subject, human-readable size, SHA-256, schema/fingerprint, evidence, publication and date; immutable append preserves current publication |
| Permissions: Run / Download / Upload / Publish, role choices, save/conflict/read-only | Server-paged tenant-labelled roles; drafts persist across search/page changes; explicit removal and save; concurrency conflict discards stale draft and reloads; independent permission checks |
| Archive confirmation and archived status | Shared confirmation; expected RowVersion; audited soft archive; historical versions remain; archived templates cannot mutate, download or appear to companies |
| Success/error/conflict/session behavior | Shared notifications/feedback/unsaved navigation; actor changes cancel pending work and remove scoped drafts; conflict reloads current data |

## 2. Discovery response correction

The reported hosted GET returned HTTP 200, but its authenticated response body was
not captured. A particular hosted root cause is therefore **unverified**.

The Angular service now validates the runtime body. It supports the current
`{items,totalCount}` contract and the older bounded array contract. A legacy entry
without registration metadata has an unknown registration state, not a false
assertion that it is unregistered. Empty/invalid JSON or incompatible data produce
an explicit shared error and retry; transport failures give connection/CORS feedback.
The current API includes rejected and already registered candidates instead of
silently removing them. Search/paging are server-owned; array slicing exists only
in the legacy service compatibility adapter.

The requester must publish ErpSystem.Api with the existing Visual Studio profile
and retest this authenticated hosted request. Publication was not performed by
this work. A response with no body is not treated as an empty successful catalog.

## 3. Global grants and company consumption

Administration requires super_admin, GlobalCrystalReports:View, the persisted
owning entity Edit permission and the exact requested action. Additional actions
are GlobalCrystalReports:Archive and GlobalCrystalReportAccess:View/Edit.
ACL Edit also allows reading the ACL, including archived history; an archived ACL
stays read-only. Upload/Publish/Download require the matching report right unless
the actor has ACL Edit authority, following the approved manager policy.

The additive globally audited role-grant table references Platform role IDs.
Platform exposes a read contract with tenant-labelled choices; Reporting never
queries Platform persistence directly. Empty grants deny company access. At read
time, assigned roles are intersected with currently assignable nondeleted roles
for the trusted tenant; a foreign role ID cannot grant another tenant access.
Grant changes advance root RowVersion and share the report mutation lock.

Company consumption additionally requires trusted user/tenant/company scope,
CrystalReports:View (Download for source), owning entity View, live HTTP permission
and module-entitlement authorization, and the corresponding persisted report grant.
Only the named GlobalActorFilter is selectively disabled in the narrow read store;
tenant/company filters and global write guards remain active. Companies receive
only current valid managed publications, never deployment files, drafts, archived
templates, private history or another tenant's grants. Invalid fingerprints and
stale opaque tokens fail before private-byte/native-renderer access.

Angular provides `/reports/global` through the existing GlobalReportView and shared
ReportWorkspace, with authorized entity selection, PDF preview and permitted current
source download. Existing Next.js and Mobile consumer availability now supports
this company policy and scopes cached catalogs to user/tenant/company. No new
Next.js or Mobile administration screen is included.

## 4. Shared presentation corrections

Collection toolbar projection owns generic flex wrapping/gaps, filter padding and
responsive selector width. OptionSelect floating labels use the owning surface;
the application topbar sets its actual palette background, including monochrome
and dark mode. DialogPanel provides reusable wide layout and body spacing.
ContentTabs wraps the installed PrimeNG Tabs API, and byte-size formatting belongs
to shared data utilities. Archived status uses the existing muted foreground token.
No Countries-only presentation override or browser-native workflow was added.

PrimeNG MCP was unavailable; installed 22.1.4 declarations, official documentation,
Angular checks and DOM tests were used. This is not a claim of MCP validation.

## 5. Verification and acceptance limits

Current machine-readable results, source hashes and portable command receipts are
registered under the feature's `verification/` directory. Real SQL tests exercise
tenant-role isolation, grant replacement and stale writes, audited archive, hidden
drafts, append-only history and forbidden company writes. Direct configured database
inspection verifies the applied access migration, all three global tables, grant
columns, filtered unique index and foreign key without writing business data.

Final browser acceptance is still open: EN/AR, RTL/LTR, wide/small layouts, all five
palettes in light/dark modes, grid controls/paging, tabs, discovery, ACL changes and
company journeys. Angular was stopped and was not restarted, preserving the user's
instruction. Earlier isolated screenshots do not validate the latest complete UI.
No real compatible native RPT/PDF success is claimed by mocked renderer tests.

FOLLOW-024 owns these remaining checks and hosted discovery verification.
PROD-028/PROD-025/RISK-008 retain their independent native reporting acceptance.

## 6. References used

- [Angular HttpClient runtime-response typing](https://angular.dev/guide/http/making-requests)
- [PrimeNG Dialog](https://primeng.dev/dialog), [Select](https://primeng.dev/select), [Table](https://primeng.dev/table), [Tabs](https://primeng.dev/tabs)
- [EF Core selective named-filter disabling](https://learn.microsoft.com/en-us/ef/core/querying/filters)
- [Zod runtime schemas](https://zod.dev/api)

## 7. Handoff

Publish ErpSystem.Api through the configured profile and refresh the authenticated
session so startup permission synchronization and renewed claims include the new
actions. Registration creates an unpublished version; publication is explicit.
Grant Run to the intended tenant roles before expecting company catalog entries;
grant Download separately for source access. Use a compatible inspected RPT for
the native acceptance journey. There was no remote application publication,
Angular server start, commit or push in this work.

## 8. Recorded technical results

1212 API tests passed, 0 failed, 3 existing opt-in browser skips across 12 projects; Reporting 177; architecture 70. Angular full check: 497 tests/89 files, 26 architecture cases, format/lint/strict types/templates/catalog and production build passed. Next reporting: 30 tests plus permission-catalog parity, type-check and architecture passed. Mobile full check: 601 tests/195 suites passed; repository-wide coverage remains limited (28.34% lines), not feature-specific acceptance.
