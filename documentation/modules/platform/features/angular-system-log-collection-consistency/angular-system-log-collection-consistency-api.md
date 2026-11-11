# System log collection consistency — API profile

## 1. Ownership and existing-system relationship

Existing Platform Audit/Error reads are the business owners. Shared Angular collections own all pagination/card presentation. BuildingBlocks may own the neutral typed filter mechanism used by both reads. Preserve independent module audit stores; no foreign table/DbContext, domain entity or schema change.

## 2. Verified source and requested outcome

Baseline: both grids lacked column filters, Error cards repeated metadata paragraphs, and known/cursor totals selected different footer markup. Implemented: six Audit filters and twelve Error filters, compact metadata cards, and one shared record-navigation layout for both pagination contracts. User explicitly requires real column filters, compact cards and one consistent shared pagination policy. This is an approved change beyond retained Next parity.

## 3. Data contract

Optional columnFilters JSON is accepted on existing GET requests for compatibility. Angular sends filtered requests through POST /system-audit-trail/query, POST /system-error-logs/query and POST /system-error-logs/export/query to avoid IIS query-string limits. Bodies are limited to32KiB; existing View/Export permissions and browser CSRF remain enforced. Criteria limits: maximum14unique fields,4rules/group,16KiB JSON,200characters/text value. Typed allowlists and exact AND/OR semantics; see the frozen contract for every field. Unknown/malformed values reject; no arbitrary SQL/property interpretation. Existing requests remain compatible.

## 4. Rules and enforcement

Apply predicates before count/Take/cursor merge/page/export. Audit UserName resolution belongs in Platform and passes resolved ids to module-owned sources; module filters remain neutral. Error IP remains system-only. Preserve dedicated5000export cap and independent View/Details/Export/Settings grants.

## 5. Platform decisions

Web collection refinement Required. Existing Next/native requests retained with optional API criteria; new native/Next UI Excluded from this Angular request. Managed RPT/PDF and consolidated Settings are independently Required successors. Import/Chart/new writes/offline Excluded.

## 6. Transport and criteria

Current GET /api/v1/system-audit-trail is cursor-paged; GET /api/v1/system-error-logs has known count/page/pageSize. Retain actual pagination, source scopes and newest-first ordering. Reset paging/cursor history on criteria changes; never filter one loaded page or fabricate total counts.

## 7. Shared composition

Reuse MyDataGrid filter APIs, CardList, RecordSummary, SurfaceCard, PageHeader, shared feedback and CollectionFooter. Extend shared presentation generically and backwards compatibly; no feature-specific footer/CSS workaround. UI components bind owner state and never HTTP.

## 8. UX and errors

Keep existing loading/empty/error/forbidden/invalid states. Compact cards retain summary/time/severity and source/service/action/status/user/duration/client/browser with permitted View. Long values remain accessible. Identical footer sizing, order, RTL and responsive wrapping across Grid/Cards and total modes.

## 9. Consistency and security

Read-only; no transactions, migrations, business writes or permission widening. Actor/query replacement aborts and masks stale data/export/detail. Validate finite payloads and match modes before database work. Preserve audit time-module-id keyset ordering.

## 10. Localization and accessibility

Reuse owner/core EN/AR labels, generators and existing UI accessibility. PrimeNG Paginator metadata is consulted; generated API validation is not browser acceptance. Verify390/1440/lightdark/keyboard and no outer scroll with synthetic rows.

## 11. Implementation preflight

G0 ownership, G1 P-001, G2 bounded typed criteria and G3 acceptance are frozen by the contract. Runtime was authorized after the524-recipe Phase00 gate and root review. The requester explicitly instructed continued implementation. Unrelated worktree/export is preserved; historical goal-tool state is not acceptance evidence.

## 12. Verification

Phase06 Verified2026-11-06 for the bounded local implementation. Full Angular check:181files/926tests,31architecture and4configuration tests, formatting/lint/strict types/catalog/tokens/fonts/build pass. Build579.49kB retains RISK-020 warning. Full API solution:1295passed/3existing environment-dependent skipped; build0errors/55warnings. Actual .NET controller/handler/store browser proof:16cases,21matching rows from63synthetic rows per owner. Error/Audit matrices8each; Countries8, States1, Districts1 and Tenants1 owner regressions pass. Evidence: verification/acceptance-2026-11-06.json. This does not prove hosted SQL execution; PROD-030 owns coordinated deployment and actual host checks.

## 13. Operations and release

No dependency install, commit/push/merge/deploy or hosted business mutation. No new database schema. Any host-only rollout/manual check receives central PROD note evidence, not an implied hosted pass. Research sources: PrimeNG current Paginator metadata and MDN CSS Grid auto-fit/minmax.

## 14. Customer education

Phase07 completed after Phase06 Verified. Arabic education: documentation/plans/business/web-angular-migration/education/angular-system-log-collection-consistency.md. It explains applied filters, compact cards, cursor totals, paging reset and permission boundaries.

## 15. Handoff

S4-A4b Verified/Closed within its bounded local acceptance; PROD-030 remains a release check. Export implementation stays preserved/Queued and not accepted. Managed Error RPT/PDF is the next exact contract, followed by Settings and separate Language/Translation under Administration. Health/docs/jobs and final comprehensive Super Admin review remain Required.

Implementation ownership: ColumnFilterSet is the neutral bounded parser; AuditColumnFilterProjection stays in BuildingBlocks Persistence; AuditTrailUserDirectory resolves display-name matches. ErrorLogFilterProjection stays in Platform Infrastructure. Filters precede count/Take/export. Deleted/orphan audit users do not match user-name filters, while listing display fallback remains unchanged. No schema/migration is introduced.

## Historical evidence availability — 2026-11-09

The [dated registry repair](../../../reporting/CURRENT_EVIDENCE_REPAIR_2026-11-09.md) retains the original missing raw-log entries in a central inventory. No runtime behavior changes in this feature. Historical claims keep their original dates and are not new execution proof. Current documentary completeness does not close hosted/native or other feature-owned acceptance; FOLLOW-025 retains historical availability.
