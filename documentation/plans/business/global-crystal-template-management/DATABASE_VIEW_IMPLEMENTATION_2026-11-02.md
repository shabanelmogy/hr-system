# Database Views implementation and verification — 2026-11-02

Extends active GCT-1 under DATABASE_VIEW_DISCOVERY_2026-11-02.md; approved by the
requester: database-backed selection, one all-column View per entity and LEFT JOIN
of reviewed navigation relationships. This is a completed technical slice; real
hosted/native acceptance remains FOLLOW-024/PROD-028, not closed by fixtures.

## Current implementation Database View discovery and prepared LEFT JOIN Views — 2026-11-02

This current GCT-1 revision supersedes manual typing in section20. Angular selects a
real database View through the existing shared searchable/paged ReferenceField,
with refresh, explicit empty/error/retry, disabled incompatibility reasons and
identity/source cancellation. No shared control was duplicated. Native RPT design,
upload, inspection, publication, ACL and immutable binding remain unchanged.

Reporting GET manage/database-views requires super_admin, Global View/Create and
the source entity Edit before ReferenceData metadata access. The public Contracts
port excludes tenant/company, cross-database, unresolved, UDF and unrelated sources.
List and inspection read metadata only. Eligible unbound or incompatible Views are
disabled; Save re-inspects authoritatively. Search/page/timeout/response bounds apply.

ReferenceData migration20261102143015_AddGlobalReferenceReportViews creates
ref.vw_Countries (Countries LEFT JOIN States), ref.vw_States (States LEFT JOIN Country)
and ref.vw_Districts (Districts LEFT JOIN State LEFT JOIN Country). All current root
physical columns are explicitly enumerated; navigation fields use State_/Country_
prefixes. Root and related soft deletion are respected; missing related rows do not
remove roots. Countries repeat per state intentionally. Existing object collisions
fail without overwriting. SCHEMABINDING means future table-column changes require a
reviewed migration to the Views; newly added fields are not picked up automatically.

The configured Development database was migrated using the repository script and
inspected: three schema-bound Views; root/view columns Countries18/40, States16/40,
Districts16/56; zero missing root columns. Wider SQL metadata does not change the
managed Crystal schema: backend projects only its approved6/7/8 fields in exact order.
District AddressesCount is populated by ReferenceData using its existing trusted
tenant/company filters, only during execution. No tenant Address join enters a global
View. SQL tests verify separate company counts, joins, filtering and fingerprints.

Technical evidence: ERP1244 passed/0 failed/3 existing opt-in browser skips across12
projects (Reporting207, Architecture70, Integration189);9 module models have no drift.
Angular full gate509 tests/91 files and26 architecture cases passes, including format,
lint, strict types/templates/catalog and production build. Browser fixtures pass8
production plus8 existing-development cases, EN/AR/light/dark/desktop/mobile, including
disabled choices, invalid View correction, draft navigation and download. No dev
server was started or restarted. PrimeNG MCP is unavailable; installed shared Select
behavior and official documentation were checked; no MCP validation is claimed.

Creation/edit/view/list/mock audit: create uses searchable metadata selection; edit
preserves immutable binding; detail shows ViewName; the manager keeps draft/source
state; fixtures model compatible, disabled, empty and unavailable outcomes. Angular
administration is Required. Next/Mobile administration is Excluded, and their existing
consumer payloads and report schema stay compatible; no new management controls or
client suite rerun is claimed. Prior Next/Mobile receipts are historical baselines.

Current receipt: verification/database-view-discovery/verification.json. The earlier
HTTP401 is not diagnosed or declared fixed by the subsequent HTTP400 InvalidView.
No hosted application deployment or positive native-valid RPT/PDF acceptance occurred.
FOLLOW-024/PROD-028 remain Open; Phase06 Not Verified, Phase07 not started, Builder DEF-027.

## Verification boundaries and research

The first SQL fixture incorrectly invoked tracked Remove on a Country with required
children. EF rejected that setup before report reading. The fixture now sets the
soft-delete flag to exercise View predicates, consistent with the existing owner
policy; no unrelated delete behavior was changed. The final two focused SQL tests
and full suite pass. A first Angular full check timed out in an unrelated App hook
while SQL work ran concurrently; the complete gate rerun alone passes, without
changing test timeouts. Existing analyzer and Node module-type warnings remain.

Sources: SQL Server CREATE VIEW/SCHEMABINDING documentation
(https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql),
dependency metadata (https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-sql-expression-dependencies-transact-sql),
EF query/soft-delete filters (https://learn.microsoft.com/en-us/ef/core/querying/filters),
PrimeNG Select (https://primeng.dev/select). These explain platform behavior;
the checked source, isolated SQL tests and browser receipts establish this implementation.

## Publication and next exact action

Requester publishes ErpSystem.Api/Angular using existing profiles. The configured
Development database already has the three prepared Views. Any distinct Host
database must receive the committed ReferenceData migration through the existing
deployment/migration workflow. Select Reference data, the approved structure and its
matching ref.vw_* View, then create the metadata draft and download the Designer ZIP.
Design against the approved XSD in Crystal Designer, add Language, upload/inspect,
publish and grant roles. Wider SQL fields require an explicit future approved source
contract expansion (DEF-027); they are not automatically added to the current XSD.
