# Error Logs — Expo implementation profile

Phase 03 status: Mobile source and automated feature acceptance implemented on 2026-10-17. Physical Android/iOS acceptance is explicitly deferred by the requester under `PROD-026`; this profile does not claim native device verification.

## 1. Ownership
Mobile owns validated remote adapter, repository/use cases, query state and screens. API owns trusted scope and sanitization.
## 2. Screen pattern
P-001 viewer follows Audit Trail screen/detail modal, AppListScreen, AppDataTable and AppDataCard. P-005 retention uses AppForm.
## 3. Navigation
Current drawer groups operational routes under Administration and configuration under Settings. Previous direct main drawer leaves are hidden, not removed; exact child policies remain authoritative.
Company `/advanced-tools/error-logs`, SuperAdmin `/system-error-logs` and independent `/error-log-settings` use thin guarded routes, typed ROUTES, drawer/tool navigation and breadcrumb metadata. Global routes require both the SuperAdmin role and their exact View permission.
## 4. Contracts
Use the plan's typed list/detail/export/settings envelope. No client-supplied scope and no raw diagnostic values.
## 5. List
Table and Cards compose AppListScreen, AppDataTable and AppDataCard with one server list state, debounced search, 1-based API paging, UTC day filters, user/source/status controls and reset. Invalid date ranges suppress reads/export with visible feedback. Service/action, duration, client and browser appear in both views; IP is system-only. A generic backward-compatible AppDateTimeField allowWhenReadOnly option lets filters remain usable in a read-only tenant without enabling mutation fields.
Shared reuse review on 2026-10-18: ErrorLogsScreen already composes AppPageHeader/AppListScreen and shared AppDateTimeField, AppTextField, AppSelectField and AppIconButton criteria. It does not use the Web native date fields or duplicate Web header that caused the reported appearance issue. This bounded correction changes Web runtime only; Mobile contracts, creation/edit/view/list/mock decisions remain unchanged. Native physical acceptance is still PROD-026, not inferred from source inspection or Web phone screenshots.

## 6. Detail

Web diagnostics visibility correction, 2026-10-19: explicit empty-section presentation and CopyButton changes remain Web-only. Existing native selectable diagnostics and company exclusion stay unchanged; no native runtime or wire change.

The existing full-screen selectable native detail accepts the richer system diagnostic string array without a DTO or native runtime redesign. Company diagnostics and IP remain hidden even for an overbroad response; details require the independent grant. The new CopyButton is Web-only; no new native clipboard dependency.
Company modal presents sanitized fields only; SuperAdmin system modal may present safe method frames.
## 7. Settings
SuperAdmin views the singleton independently from Edit, then opens a shared AppForm dialog using RHF/Zod for 1..3650. Its revision snapshot is taken on Edit and cannot advance during a dirty background refresh. A 409 keeps the draft; explicit reload updates only the revision before review/save. Server retention field errors map beneath the input. AppForm supplies dirty/Android-back handling and registers unsaved edits for company switching. Mock data fills a local 30-day draft only.
## 8. States
Shared loading, empty, error/retry, forbidden and export feedback apply. Query keys partition user/tenant/company and company/system projection; the host clears old queries on context rotation. Queries/reporting require server-authenticated authority and pause during company switching; an offline lease never authorizes network operations.
## 9. Actions
Separate permissions for list/detail/export/settings view/edit. No record CRUD. Metadata reporter deduplicates bounded runtime/network/boundary/rejection events.
## 10. Offline
Viewer/settings/export require live authorization. No durable diagnostic cache/outbox/replay; local form draft is transient.
## 11. Security
Never send raw message, stack, URL/path, payload, credentials or scope in client reports. API projection remains authoritative.
## 12. Integration
Platform owns the typed remote/repository/application/composition boundary, route permissions and EN/AR keys. Native export downloads actual XLSX through apiService (including auth refresh and scope cancellation), verifies binary signature, writes a sensitive cache file, shares with the XLSX MIME/UTI, and deletes it in finally. Client capture uses injected transport, safe enum/GUID metadata, bounded rate/dedup and chained runtime handlers, plus network and boundary integration. Raw exception strings never enter this feature's transport.
## 13. Localization
Paired EN/AR, RTL, safe-area, keyboard and accessible 44pt actions are Required.
## 14. Verification

Shared offline-bootstrap correction on 2026-10-28 (`FOLLOW-010`) keys each
isolated native write connection before BEGIN and preserves the current database,
key and schema. Eight focused regression tests pass; the requester confirms the
app opens after Reload, verifying FOLLOW-010 for bootstrap. This does not change Error Logs' online-only authority or create a durable
diagnostic cache/outbox. The canonical Mobile readiness review owns the evidence.
The complete Mobile check now passes 194 suites / 598 tests with unchanged
coverage floors; Android export passes. The corrected code is verified in the
development bundle served through the HTTPS tunnel. Bootstrap is confirmed on the
phone; feature-specific physical journeys remain PROD-026.

Live-development maintenance on 2026-10-28 adds SDK57's development client and
an internal EAS development profile; Metro's tunnel serves a valid Android
development manifest. Build `b71a24b6-897b-41df-ba95-1c36287ed9bf` and startup
instructions are recorded in the Mobile release runbook. Fast Refresh needs
the development APK and running Metro; physical confirmation remains `PROD-026`.
No diagnostic workflow, capture authority or domain contract changes.
After adding the client, the full Mobile gate passes again (194 suites / 593
tests), Expo Doctor is 21/21, native config/dependency checks pass, production
export retains its 3,030-source boundary and all four upload-policy tests pass.
The tunnel delivers the development bundle and registers its HMR WebSocket;
these server checks do not prove a rendered phone-side refresh.
The development build completes on 2026-10-28; its APK passes ZIP integrity and
manifest checks, includes the development launcher and matches the preview signer
certificate. The canonical Mobile runbook owns download/hashes; phone installation
and visible Fast Refresh remain `PROD-026`.

Shared dependency-boundary maintenance on 2026-10-28 passes 13 policy tests and
the actual 3,030-source Android map check. Legacy Zod, deepmerge and CLI tooling
schemas are absent; only the intentional Expo Metro loader is permitted from
the CLI package. Upstream findings remain `RISK-013`/`RISK-014`, physical journeys
remain `PROD-026`, and this export does not prove signed crash-symbolication
acceptance under `PROD-013`.
The complete Mobile check is repeated successfully (194 suites / 593 tests),
with the same coverage results and unchanged floors.
It also passes on Mobile CI/EAS Node 22.23.4, with the export and focused
release-config checks. A dedicated ERP EAS project is linked; verification
isolates synthetic config identities from the real binding. Artifact/install
acceptance remains `PROD-009`; default-runtime follow-up is `RISK-015`. Four
upload-policy tests and actual 1,221-file archive inspection pass; local shared
tokens remain available and other apps/secrets are excluded. The canonical
release runbook owns the build request and preview configuration. The first
signed Android preview completes successfully on 2026-10-28 (build
`32f6f9a6-7779-4077-a42d-8d1309f32015`, version 1.0.0/code 1). Physical
installation and real symbolication remain open; the chosen preview host's
association endpoints return HTTP 401, retained under `PROD-012`.

Shared-platform maintenance on 2026-10-27 supersedes the inherited gate failures
in the older dated measurements below: `FOLLOW-006` and SDK57 patch alignment
`FOLLOW-008` are Verified. The complete Mobile check passes strict types, full
lint, architecture, contracts (90 routes / 253 endpoint members), i18n/catalog,
foundation/release source gates and 194 suites / 593 tests. Coverage remains
25.56/17.85/21.30/28.14 percent above unchanged floors. A clean 1,135-package
install matches the lockfile; dependency compatibility, disposable Android native
config, React Compiler Android export and Expo Doctor 21/21 pass. The production
dependency audit remains red for the Expo CLI/Zod path (`RISK-013`); physical
journeys remain `PROD-026` and capture availability remains `RISK-010`. No feature
UI, API contract, capture authority or schema changes in this dependency slice.

Historical feature-specific measurements:

2026-10-19 richer diagnostic compatibility: 7 detail/remote-boundary tests and strict typecheck pass. No native runtime UI or schema changed. The five-point audit is documented in error-logs-evidence.md; immutable entries have no create/edit/mock workflow. Physical device checks remain requester-deferred PROD-026, and inherited full-check failures are not closed.
Focused feature/capture/route tests pass 46/46 (25 feature/capture tests plus 21 route tests), covering safe projections, Table/Cards, current-query XLSX, malformed binary, sharing cleanup, independent permissions, invalid retention, server field errors, dirty revision preservation and conflict reload. Strict TypeScript, architecture, contract matrix (87 routes / 243 endpoint members), i18n/catalog, foundation and release-source gates passed. Android export passed; the final repeat after review fixes is recorded in the evidence ledger. The full Jest coverage run passed 551 executable tests in 181 suites; one inherited OfflineOperationsPolicyScreen suite could not load its native keyboard-controller mock (`FOLLOW-006`). Full lint retains six inherited LedgerSetupResourceScreen errors (`FOLLOW-006`); feature lint is tracked separately. Expo Doctor passes 20/21, with 15 existing SDK patch mismatches tracked in `FOLLOW-008`. Native journeys remain `PROD-026`, capture availability `RISK-010`.
Corrective verification on 2026-10-18: Mobile accepts the canonical .NET GUID shape including hash-derived persisted IDs and continues rejecting malformed IDs. The existing Settings screen composes a permission-filtered Platform child registry; no extra destination or blanket permission is introduced. Its old direct drawer leaf stays hidden and the Settings destination remains available. Focused feature/navigation/route checks pass 43/43, both client schemas accept the same live 17-row response, TypeScript/feature lint/architecture/contracts/i18n pass and Android export passes. Native physical acceptance remains PROD-026; full lint retains only the six inherited FOLLOW-006 errors.

## 15. Phase 00 handoff
Mobile implementation follows verified API and Web contracts. The required-file manifest includes actual Mobile layers, routes, runtime bridges, shared extension, contracts, translations and tests. Phase 06 distinguishes the authorized automated delivery from deferred physical acceptance and inherited release gates.


## 16. GUID compatibility and Settings navigation correction — 2026-10-18

The response boundary accepts the exact 8-4-4-4-12 hexadecimal .NET GUID shape, including existing scope-hashed IDs without RFC UUID version bits. It continues rejecting malformed values. This matches the API identity contract and preserves persisted IDs/idempotency; client event generation stays UUID-based. Zod's current documented GUID validator expresses the same contract (https://zod.dev/api#uuids); the explicit regex keeps the Mobile Jest/Expo bundled-Zod resolution compatible without dependency changes.

SystemSettingsLinks is a Platform-owned navigation registry/composition mounted inside the existing Shell Settings screen. It reuses shared Card/Button/Text and filters each link through the authoritative client route policy (SuperAdmin plus ErrorLogSettings:View). The separate visible drawer leaf is hidden while its guarded physical route remains registered; the drawer now exposes the existing Settings destination, and breadcrumbs return through Settings. Additional settings can register their own route/key/icon without inheriting access from this group. No new route, permission, database field or screen lifecycle was introduced. systemSettings keys are protected from company translation overrides. Physical native UI validation remains PROD-026.


## 17. Administration navigation — 2026-10-18

AdministrationLinks is an independent group in AppDrawerContent; PlatformNavigationLinks composes shared AppCard/AppText/AppButton, filters every child with canAccessRoute, optionally checks its exact leaf permission, closes the drawer before navigation, and omits empty groups. The Users link additionally requires Users:View because the existing /administration root has a wider fallback policy. Company/system viewers retain their original paths and authorization. Duplicate administration/advanced-tools/system-error-log main drawer leaves are hidden without deleting routes. SystemSettingsLinks reuses the same composition for retention/company settings. Settings parent entry becomes reachable for a user with any permitted configuration child while children retain exact policy and module/tenant checks. No child permission is inherited from Settings. Company configuration tabs are hidden in the old Administration tab bar but keep their deep links, and Invitations now uses its own ViewUserInvitations grant rather than Users:View. Diagnostic breadcrumbs use a non-clickable Administration group, avoiding a link to the Users aggregate for diagnostics-only users. Physical device acceptance remains PROD-026.

## Settings workspace reconciliation — 2026-10-19

The requester supersedes the earlier independent Settings section: Administration now contains one Settings destination and its existing configuration workflows are actual shared tabs. Web /administration/settings uses FormTabs; Mobile /settings uses AppFormTabs and retains local device preferences. Child authority, services, edit forms, scopes, read-only and revision/conflict behavior remain owned by this feature. Error Logs viewers stay Administration siblings; retention remains a system-only tab. Existing direct child URLs remain compatible. No API/domain/schema change or migration. Current composition and acceptance are canonical in ../platform-settings/platform-settings-review.md and platform-settings-evidence.md; older dated navigation descriptions are historical.

## Settings card presentation — 2026-10-19

The retention tab now distinguishes its primary configurable duration from four operational values using existing shared MetricCard icon/description/footer/sizing options. Values, edit/revision/permissions remain unchanged. The Settings owner records shared surface fidelity and final verification in ../platform-settings/platform-settings-evidence.md; no API/schema change. Native retention behavior unchanged; device-preference shared section correction belongs to Shell Settings.


## Web detail readability/copying scope - 2026-10-19

This correction targets the requester-provided Web dialog screenshots. Native Mobile is intentionally Excluded from this bounded Web-only correction; existing full-screen selectable detail content/permissions are unchanged. No native clipboard package or unrequested sharing workflow is introduced.


## Rich bounded diagnostics amendment - 2026-10-19 preflight

Requester asks to continue and retain the greatest useful error detail. Existing-system relationship: extend existing Platform Error Logs capture/projection; no new module or screen. Existing string-array diagnostics can carry richer bounded safe text without wire DTO or client schema changes. The current 32x120 method-name-only/4096 JSON cap is inadequate for deep exception diagnosis. Authorized change: up to eight exception nodes (including AggregateException branches), exception full type/HResult, safe numeric provider codes, stack method names/IL offset and optional source line numbers (never paths), up to 64 total frames; trusted HTTP method/route template/activity trace/span/request trace/runtime/application version/attributed tenant/company/user; Job ID/retry/runtime metadata. No exception.Message/ToString/Data, raw SQL, body, query, route values, headers, tokens, connection strings or source filenames are captured. SQL provider numerical error codes are useful without persisting private messages.

Scope/security impact matrix: system detail-only diagnostics remain system-only; company display/copy/export cannot access diagnostics or IP. Existing immutable record/retention/index/paging/dedup/nonblocking behavior stays unchanged. Diagnostics remain string[] so both clients already render and copy/view richer text; native full-screen selectable detail is Required to remain compatible, while native clipboard stays Excluded. No new field or builder control is required because this is read-only technical text, not structured business input. No creation/edit journey or mock generator change; tests supply trusted nested exceptions and long frames. Old records remain readable and cannot recover information never captured.

Data/edge contract: increase the application MethodFramesJson limit to 32768; the existing SQL column is already nvarchar(max); keep null/legacy JSON behavior; defensive sink budgets/canonical sanitization always apply, including aggregate cycles/overlong strings. Client reports cannot provide diagnostic lines. The standard Add-ErpModuleMigrations -Name ExpandErrorLogDiagnostics -Apply check found no relational change: both 4096 and 32768 map to the existing nvarchar(max). No empty migration is created. Verify the actual column, model drift and a rolled-back long-value persistence probe against the requester-authorized experimental database; no historical record rewrite. G0-G4 bounded start requirements pass: same owner/wire/security, enumerated metadata allowlist, shared presentation, compatibility and executable verification contract established before runtime. Expand current Error Logs V1 contract rather than create a parallel capability. Required acceptance: API nested/secret omission/truncation/company projection tests, migrations/model/schema, Web complete copying/long LTR wrapping/clipboard failure, native schema/projection tests and strict check, full current documentation gates. API architecture requires the reusable technical exception snapshot in BuildingBlocks, and Host/Platform consume it without cross-module Infrastructure references.


## Current detail/capture behavior - 2026-10-19

The shared Web MyForm detail uses FormSection, semantic shared DetailFields, a persistent shared CopyButton and shared clipboard transport also consumed by ErrorDialogHost. Error summary is first, request/user metadata is grouped, long identifiers wrap, diagnostics remain selectable LTR and vertically bounded inside the dialog. The whole permitted detail report is copied, including complete projected summary, local/UTC dates, status/duration (including zero), correlation and system-only diagnostics/IP. Clipboard failure is announced inline and the same button retries. Company projection and the client formatter both exclude IP/diagnostics even for an unexpectedly overbroad response. FormHeader now wraps long subtitles without losing its close control, and shared read-only FormFooter labels its existing close action correctly.

Server capture now stores eight distinct exception nodes / 64 total method frames, type/HResult/provider codes and recognized SQL numeric codes with fixed cause classifications. HTTP captures trusted method, route template (no route/query values), request/activity trace/span, runtime/application versions; jobs capture job/retry/version metadata. The sink adds attributed tenant/company/user identifiers to trusted server diagnostics only. Client-originated diagnostic arrays are discarded. Storage budget is 32768 serialized JSON characters, up to 128 lines and 512 characters per line, accounting for actual JSON encoder expansion; a DiagnosticsTruncated marker identifies a storage/frame/node limit. Legacy records keep their original limited data. Stack line numbers require available symbols; source paths and raw exception text remain excluded.

Schema finding: SQL's existing nvarchar(max) can already hold the richer payload; EF reports no relational drift for the application max-length change. The standard script applied/checks all nine registered modules without creating an empty migration. A live rollback probe round-tripped 20004 characters exactly, confirmed max_length=-1 and zero pending Platform migrations. The previous preflight expectation of an ALTER-column migration is superseded by this verified provider behavior. Reference: https://learn.microsoft.com/en-us/ef/core/modeling/entity-properties .


Verification decision: Verified for the authorized development/automated scope, 2026-10-19. Final counts and scope limits are canonical in error-logs-evidence.md, Detail/copy and richer diagnostics acceptance: 1077 API tests, 28 authenticated live HTTP checks, 7 Web unit tests, 3 detail browser cases plus 2 launcher cases, 7 native compatibility tests, strict client checks and successful Web build. No new relational migration; live 20004-character rollback probe passed. PROD-026, RISK-009/010 and inherited FOLLOW-006–009 remain independently owned.
