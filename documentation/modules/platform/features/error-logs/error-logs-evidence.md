# Error Logs — Phase 00 review and evidence ledger

| Field | Value |
| --- | --- |
| Feature / plan / slice | `error-logs` / `platform-error-logs` / `Error Logs V1` |
| Owner / date | Platform / 2026-10-17 |
| Contract | `documentation/plans/business/platform-error-logs/decomposition/error-logs.md` v2.0 |
| Request / manifest | `error-logs-request.md` / `required-files.json` in this folder |
| State | API, Web, Mobile and integrated automated acceptance Verified; written education delivered |
| API routes | `/api/v1/error-logs`, `/api/v1/system-error-logs` |
| Web routes | `/advanced-tools/error-logs`, `/super-admin/error-logs`, `/super-admin/error-log-settings` |
| Mobile routes | `/advanced-tools/error-logs`, `/system-error-logs`, `/error-log-settings` |
| Import / report / chart | Excluded on API, Web and Mobile; safe XLSX export is Required and is not a managed report |
| Customer education | Required after Phase 06 Verified; planned education file is not yet evidence |

## Requirement manifest

| ID | Approved target | Source | API | Web | Mobile |
| --- | --- | --- | --- | --- | --- |
| R-01 | Capture API >=400, failed job attempts and metadata-only client errors safely. | Plan sections 1–3 | Verified | Verified | Active |
| R-02 | Separate system and current-company list/detail/export with eight exact permissions. | Plan section 4; contract section 6 | Verified | Verified | Active |
| R-03 | Global retention default 90, 1..3650 revision/audit and bounded cleanup. | Plan sections 1, 3–4 | Verified | Verified | Active |
| R-04 | Responsive, localized Grid/Cards or Table/Cards, detail/export/settings journeys. | Contract sections 2, 5, 8, 10 | Verified | Verified | Active |

## Current evidence and reuse

| ID | Verified current fact | Source | Inspection |
| --- | --- | --- | --- |
| E-01 | Host exception handler returns generic traceable ProblemDetails. | `api/ErpSystem.Api/Hosting/HostGlobalExceptionHandler.cs` | Plan `EVIDENCE.md` source audit |
| E-02 | Audit Trail owns successful data-change history, not Error Logs. | `documentation/guides/api/AUDIT_TRAIL.md` | Plan ownership review |
| E-03 | Web Audit Trail provides P-001 list/detail reference. | `web-next/src/platform/audit-trail/pages/AuditTrailPage.tsx` | Screen contract reuse audit |
| E-04 | Mobile Audit Trail provides P-001 list/detail reference. | `mobile-react/src/platform/tools/audit-trail/presentation/screens/AuditTrailScreen.tsx` | Screen contract reuse audit |
| E-05 | Platform Hangfire server composition exists. | `api/Modules/Platform/ErpSystem.Modules.Platform.Infrastructure/Hangfire/PlatformHangfireDependencyInjection.cs` | Plan `EVIDENCE.md` source audit |

## Capability and scope decisions

| Surface | API | Web | Mobile | Reason |
| --- | --- | --- | --- | --- |
| Grid/Table | Required paged query | Required Grid | Required Table | P-001 viewer |
| Cards | N/A transport | Required responsive Cards | Required Cards | Contract requires compact layout |
| Detail | Required safe projection | Required dialog | Required modal | Company sanitized; system method frames only |
| Export | Required XLSX <=5000 | Required | Required | Same scoped filter/projection |
| Retention settings | Required singleton | Required form | Required form | SuperAdmin; independent View/Edit |
| Import/report/chart/tree | Excluded | Excluded | Excluded | No diagnostic import or report catalog |
| Offline diagnostic cache | N/A server | Excluded | Excluded | Online authorization and current scope |

## Read, list and detail contract

Filters: `fromUtc,toUtc,userName,source,statusCode,search,page,pageSize`; server bounds and 1-based paging. Sort is deterministic with a stable ID tie-break. List envelope is `{items,totalCount,page,pageSize}`. Grid/Cards display UTC time, source, severity, safe actor/action/status/summary; detail shows allowed metadata. SuperAdmin may view bounded method frames; company never sees frames or system records. Shared loading, empty, error/retry and forbidden states apply. Records have no create/edit/archive/restore/bulk actions. Retention settings alone are editable with expected revision and conflict reload. Export uses current filters and cap 5000.

## Import and reporting contract

Import is Excluded independently on Web and Mobile; no file acceptance, template, endpoint, parser, batch, row-error artifact or import permission exists. Managed Crystal and browser-template reports are Excluded; the Required XLSX export is a scoped application export, not a registered report. Realtime/alerts are Excluded. These decisions come from the plan rather than from a reference feature.

## Findings and verification

| ID | Classification | Finding / owner | State |
| --- | --- | --- | --- |
| F-01 | Manual production check | Best-effort capture availability; Platform / `RISK-010`; actual production configuration / `PROD-017`. | Open |
| F-02 | Manual production check | Physical Android/iOS acceptance; Mobile / `PROD-026`. | Open |
| F-03 | Pending implementation evidence | All authorized automated stages passed; manual native and inherited release gates remain separately tracked. | Open |

Phase 00 documentation checks are recorded by their command output at registration. Platform migration `20261017114853_AddErrorLogs` was applied to the configured development database on 2026-10-17. Rebuilt focused Error Log tests passed 17/17 and the Platform module suite passed 291/291; isolated SQL integration tests passed 27/27, including bounded cleanup and concurrent settings revision/audit. The Host focused suite previously passed 26/26; its new oversized-report 413 assertion awaits rebuild. Full solution and integrated live acceptance remain pending. Phase 06 cannot be marked Verified until runtime, live schema, cross-scope and responsive UI evidence exists. Customer education remains pending until then. The current manifest lists existing files only and grows as source/test artifacts are created.




## API stage acceptance — 2026-10-17

API Verified: migration 20261017114853_AddErrorLogs applied to the configured development database; 1072 tests passed across the full solution run plus the focused architecture rerun (the only original failure was approval of the four exact new public capture types, now resolved). Live HTTP acceptance passed 27 checks including 401/403/404 isolation, JSON allowlists, 413 body limit, metadata retry deduplication, UTC, revision conflicts and XLSX. Model drift passed all 9 modules. At the API-stage handoff, Web/Mobile verification followed; the final Phase 06 decision below supersedes that transition.

## Web stage acceptance — 2026-10-17

Web Verified: full `npm run check`, production `npm run build`, service tests 3/3, reporter/telemetry tests 9/9 and fresh Playwright acceptance 3/3 passed. Browser cases cover company search/detail/XLSX, global retention field validation and stale-revision recovery while preserving the draft, and Arabic phone Cards. Inspected captures in `.codex-tmp/` show the settings metrics, company detail and RTL Cards. Final phone geometry is document height 839px / viewport 839px with a 365px internally scrolling card panel; paging remains visible.

`npm run measure:build` remains red for the seven inherited protected-shell routes tracked by `RISK-009` (2.31–2.35 MiB against 2.25 MiB). Total JS is 24 MiB under 26 MiB, shared first-load is 0.86 MiB under 1.85 MiB; no Error Logs route is listed as a budget violation. This feature pass does not make the repository release budget green.

## Mobile capture verification

Core reporter/lifetime/transport tests pass 9/9. Android export passes. Expo Doctor passes 20/21 checks and flags the pre-existing SDK57 patch set: `FOLLOW-008` owns the coordinated dependency update. Physical Android/iOS acceptance remains deferred by the requester under `PROD-026`. Runtime capture availability is recorded under `RISK-010`.

The runtime hook test was corrected for the installed React Native Testing Library v14 asynchronous render API using the official [render documentation](https://oss.callstack.com/react-native-testing-library/docs/api/render); no application runtime fix was needed for that test harness failure.

## Phase 06 verification decision — Verified (authorized development/automated scope)

On 2026-10-17 Platform engineering verified Error Logs V1 against the approved contract. API, Web and Mobile implement the required delivered surfaces; no feature-owned failing correctness check remains. A fresh Release API build passed with zero errors, followed by a repeat of all 27 authenticated HTTP checks against the authorized development database; retention remains 90 days. Mobile focused verification passes 46 tests across 9 suites plus the shared read-only date-filter test. Strict TypeScript and focused ESLint pass. Architecture, contract matrix (87 routes / 32 files / 243 endpoint members), i18n and ownership catalog (20 sources / 6,928 keys), foundation and release-source checks pass. Android Hermes export passes after the review fixes.

The full Mobile coverage run passed 551 executable tests / 181 suites; the inherited OfflineOperationsPolicyScreen suite fails to load native keyboard-controller mocks. The full Mobile gate remains subject to the inherited six Ledger Setup hook lint errors (`FOLLOW-006`). Expo Doctor is 20/21 with the existing SDK patch mismatches (`FOLLOW-008`). Web production build and full static gate pass; the seven inherited shell bundle violations remain `RISK-009`. The supplemental full Web test runner remains `FOLLOW-007`; scoped feature tests are separately green. These are repository/release findings, not a full-repository pass.

Physical Android/iOS, native file sharing, keyboard/safe area, phone/tablet/orientation/theme and real device sign-in/company switching remain **Manual release checks**, explicitly deferred by the requester under `PROD-026`. Native acceptance is not inferred from Jest, Android export or the compact browser. Production secrets/readiness is `PROD-017`. Best-effort queue/pre-authentication/native-fatal capture limits are `RISK-010`. Error Logs V1 is not a durable audit guarantee.

Five-point UI audit: record creation is internal capture (no manual record CRUD); retention editing uses dedicated numeric shared forms and revision snapshots; viewing uses shared detail fields with system-only safe frames; lists expose source/severity/time/service/action/status/client metadata in Grid/Table and Cards with server filters/paging; mock data supplies a local valid retention draft and never fabricates records or trusted identities. Web desktop and Arabic compact views were visually reviewed; physical Mobile appearance remains the named manual release check.

Native export follows official Expo SDK57 [FileSystem](https://docs.expo.dev/versions/v57.0.0/sdk/filesystem/) and [Sharing](https://docs.expo.dev/versions/v57.0.0/sdk/sharing/) contracts. Its automated tests verify binary mapping, XLSX MIME/UTI and finally cleanup; those tests do not prove the OS share sheet.

Phase 07 may now document the verified delivered behavior. Release owners must resolve the central notes before claiming the corresponding full/native/production gate.

## Phase 07 closure

The written EN/AR-oriented customer guide exists at `documentation/plans/business/platform-error-logs/education/error-logs.md` and is registered in required-files.json. It covers entry routes, exact permissions, filtering/detail/XLSX, retention/conflict recovery, cleanup, capture scope and known delivery limits. No tutorial video is required for this development slice. The plan is Closed for the requester-authorized implementation/automated scope; all centrally owned native/production/inherited release notes remain open. Final full Mobile `npm run check` reconfirmed exactly six inherited Ledger Setup lint errors and no Error Logs lint failure. Source-scoped lint and the shared filter regression test pass. Planning and all 149 documentation recipes were generated and checked successfully.
Final catalog regression: 31 CompanyLocalization API tests and all four ownership policy tests pass after adding protected Mobile permission labels. Catalog regeneration is current (20 sources / 6,928 keys).

## Corrective acceptance — 2026-10-18: persisted GUIDs and Settings navigation

**Observed and reproduced:** the live system API returned HTTP200 with 17 rows. Eight persisted Web/Mobile capture IDs failed the Web RFC UUID schema at `id`, while dates, source and severity were valid. Hash-derived .NET GUIDs do not necessarily carry RFC version/variant bits. This caused the entire typed page parse to fail and render the generic load-error state. The old browser fixture generated only RFC UUIDs and therefore did not expose the bug.

**Correction:** Web uses Zod GUID validation; Mobile validates the equivalent canonical hexadecimal GUID shape with a portable string regex. Malformed IDs still fail closed, all other required fields remain validated, existing IDs/links are preserved and server capture idempotency is unchanged. Both current client schemas parse the same live 17-row response. Client metadata EventId remains UUID-based. No table/model/domain change or new migration is required; successful live reads exercise the applied development schema. The explicit Mobile expression also avoids the test resolver selecting Expo's nested older Zod without guid(), without changing dependencies or hiding invalid input.

**Navigation:** Web reuses the existing nested Settings sidebar group; Mobile adds a permission-filtered Platform navigation registry inside the existing Settings screen and hides the old standalone drawer leaf. Each child keeps its original permission and route guard; a user with only ErrorLogSettings:View can see settings, while a viewer without it sees no empty group. The system menu roots are protected from company translation overrides. Native physical acceptance remains PROD-026.

The browser acceptance uncovered an additional visible navigation defect: unqualified feature translation keys appeared as raw systemErrorLogs.title/systemSettings.title in Shell, outside the feature namespace provider. The shell now uses translated core menu keys in both languages. Explicit accessible names/disclosure state remain on sidebar buttons when expanded as well as collapsed. Existing shared groups, routing and unsaved-change behavior are reused.

**Checks:** focused Web service/navigation tests 6/6; Mobile feature/navigation/route tests 43/43; ownership policy 4/4; strict Web/Mobile TypeScript, focused lint, both architecture gates, Mobile contract matrix and both i18n/catalog checks passed. Android export passed. Full Web npm check passed (one inherited Audit Trail hook warning). Full Mobile npm check still stops at the same six inherited Ledger Setup lint errors (FOLLOW-006), with no new feature lint errors. No new full-suite/native pass is inferred from these focused checks.

The new system browser journey verifies mixed captured IDs, system list/detail and Settings → Error Log Settings navigation. After the fix it passed; the final four-case rerun and build results are recorded below. Initial test attempts timed out on a horizontally virtualized grid action and then on untranslated menu labels; the final journey uses visible Cards actions and the corrected accessible translated menu, following the official Playwright locator contract (https://playwright.dev/docs/locators). The successful menu screenshot was visually inspected. Zod GUID semantics: https://zod.dev/api#uuids. Namespace ownership: https://react.i18next.com/guides/multiple-translation-files.

**Final corrective outcome: Verified, 2026-10-18.** Final Playwright rerun passed all 4 cases (system mixed-GUID list/detail and Settings child navigation; company filter/detail/XLSX; retention validation/conflict; Arabic compact Cards). The final menu capture `.codex-tmp/error-logs-settings-menu-en.png` was visually inspected: translated Settings parent and Error Log Settings child are visible beneath Super Admin. Web full static check passed; focused Web tests 6/6 and Mobile tests 43/43 passed; both strict typechecks, focused lint, architecture, contract and localization checks passed. Android export passed; the rebuilt API (updated embedded catalog) has zero errors and the final sequential production Web build passed. The ownership catalog is current at 20 sources / 6,932 keys. All 149 documentation recipes and planning checks pass; inherited planning migration warnings and Mobile full-lint FOLLOW-006 remain unchanged.

One overlapping production-build attempt encountered two malformed generated `.next-e2e/dev/types` files while browser verification was running. After the browser run completed, only those verified generated artifacts were removed and the production build reran sequentially with success. No application source/type safety was bypassed and no user development server was stopped. Production builds should follow, rather than overlap, browser fixture type generation in this workspace. Source whitespace checks pass. No additional database migration, identifier rewrite or deletion was performed for this correction.


## Mandatory shared components and Grid correction — 2026-10-18

The requester rejected filter appearance and clarified that shared components are mandatory: reuse existing; extend compatible shared contracts; create a reusable shared component only if none fits. The original viewer imported MyDataGrid but disabled its record navigation/activation and built local criteria/view/reset controls. This was an implementation failure against already-explicit documentation, not an absent rule. An initial correction still kept Grid search outside its own toolbar; the final correction follows the actual Countries Grid contract.

Final Web source uses PageHeader multi-view, MyDataGrid toolbarSearch/ResetButton/GridOptionsButton/GridFooter and active-record navigation. Domain filters reuse MyDateTimeField/MyTextField/MySelect through generic toolbarFilters. emptyContent renders shared FeedbackState within the standard empty overlay so failed/empty reads cannot remove criteria/reset. Cards reuses CardViewHeader with the same list state and domain controls. The shared toolbar can suppress unsupported sort controls and expose a criteria row; MySelect has a small size opt-in while defaults remain medium. No local parallel visual shell was added.

The Grid policy is enforced by check:architecture against aliased/named/default/dynamic raw MUI Grid imports/re-exports and ClientDataGrid feature imports. The internal adapter is no longer publicly exported. The gate found one legacy consumer, LocalizationDataGrid, now migrated to MyDataGrid with row edit callbacks, authorization and initial unsorted order preserved. AGENTS.md and central reuse/server-list guides record the mandatory rule and per-surface evidence matrix.

Focused tests passed 16/16 in six suites: shared criteria defaults, selector sizing, shared Grid slots/default overlay/footer/navigation, actual Error Logs Grid composition including read failure, localization editor compatibility, server response contracts and shared view persistence. Grid-policy self-tests passed 2/2. Full Web npm check passed; the new mock naming warning was removed and final focused ESLint is clean, leaving the pre-existing Audit Trail warning outside this change. Final architecture policy passes. Playwright passed 6/6 after final Grid wiring: system list/detail/settings; company search/detail/XLSX plus last-record server-page traversal and cached first-record return; retention validation/conflict; UTC/source/status/user criteria with empty recovery and Grid/Cards retention; existing Countries Grid/Cards shared controls; Arabic compact expanded criteria and Cards. Viewed EN Grid/Cards and the Countries reference captures at the same 1280x720 viewport; compact AR document height equals viewport 839px and no horizontal overflow. Final production-build/documentation results follow below.

The first navigation assertion incorrectly required HTTP when returning to a still-fresh cached first page. The trace proved page2 HTTP200 and successful return to page1; the final assertion checks the visible first page, following TanStack Query cache semantics (https://tanstack.com/query/latest/docs/framework/react/guides/caching). An earlier Arabic login helper assumed an English role label; it now resolves actual EN/AR accessible names without changing application login. An initial selector-size SSR test matched a CSS selector inside generated styles rather than a DOM class; the corrected assertion checks class attributes. These were harness corrections, not application workarounds.

Reference review separately observed a Countries development SSR prefixer fallback in earlier supplemental runs; FOLLOW-009 owns isolated reproduction. The final six-case run has no such SSR message. A successful functional reference capture does not by itself close that rendering follow-up.

UI parity audit: (1) Creation and (2) Editing add no data contract; retention remains the existing shared form and its browser validation/conflict journey passes. (3) Viewing retains permission-safe shared detail dialogs. (4) Listing/filtering now uses the exact shared Grid controls, server paging and shared Cards, with expanded responsive evidence. (5) Mock creation is Excluded for immutable diagnostic facts; deterministic browser fixtures remain tests only. Mobile source already uses AppListScreen/AppDataTable/AppDataCard/AppDateTimeField/AppSelectField/AppTextField; no Mobile runtime changes or new device verification are claimed. PROD-026 remains the existing physical-device limitation. There are no API/schema changes or new migrations for this presentation correction.

Primary framework research: MUI responsive Grid https://mui.com/material-ui/react-grid/, field sizes https://mui.com/material-ui/react-text-field/, date-field sections https://mui.com/x/react-date-pickers/fields/, Grid slots/footer/paging https://mui.com/x/react-data-grid/components/ and https://mui.com/x/react-data-grid/pagination/, accessible browser locators https://playwright.dev/docs/locators. Shared product components wrap these contracts; framework controls are not imported as feature replacements.


Final Grid build passed after the completed browser run, with no type/build bypass. Focused lint and final architecture/governance checks pass; Grid policy tests pass 2/2. The final six-browser-case run includes expanded EN Grid/Cards and AR phone verification, no raw grid fallback and successful shared record navigation. Production bundle measurement still flags the same seven protected-shell routes under RISK-009 (Error Logs is not named as a budget violation); no clean repository release-budget gate is claimed. FOLLOW-009 records earlier reference-only development SSR observations even though the final run was clean.

**Shared Grid correction verification decision: Verified for the authorized Web/development scope, 2026-10-18.** Final full Web npm check completed with zero errors and only the pre-existing Audit Trail warning; final production build, 16 focused tests, 2 policy tests, 6 browser cases, architecture/governance, 149 documentation recipes and planning checks passed. No native or whole-repository release-budget pass is inferred. RISK-009 and FOLLOW-009 remain explicitly separate from the delivered Grid correction.

## Administration / Settings navigation acceptance — 2026-10-18

The requester approved the independent Administration section after reversing the earlier Settings-tab placement. This amendment reorganizes existing destinations: operational viewers and identity administration belong to Administration; company configuration and global retention belong to Settings. It does not add a Web Settings route, tab screen, permission, API contract or schema. The approved contract is section 16 of the existing plan decomposition; current applied profiles and related company-localization/geographic-scope guides record the reconciliation.

Web reuses shared navigation sections and items. SuperAdmin system viewer and retention are independent children under separate main sections. Company viewers retain their exact permissions. A permission-guarded retention shortcut reuses the existing settings destination from the system viewer. MyDataGrid, shared filters, footer, server paging and Cards remain intact.

Mobile composes existing shared AppCard/AppText/AppButton through PlatformNavigationLinks, with separate AdministrationLinks and configuration links inside the existing Settings screen. Former standalone drawer entries are hidden while their URLs remain registered. Every child is checked against its own route policy; Users additionally requires Users:View because the existing aggregate Administration route can admit other administration permissions. The Settings entry admits holders of an existing configuration-child grant without granting any new child authority. Invitations use their exact invitation-view permission. Breadcrumbs follow Administration or Settings consistently, including company geographic scope. Closing the drawer precedes navigation.

Focused Web tests passed 20/20 across four suites. Focused Mobile navigation and route-policy tests passed 27/27 across three suites. Web full npm check passed, with the previously recorded Audit Trail hook warning. Mobile strict typecheck, changed-source lint, architecture, contract matrix (87 routes / 32 endpoint files / 243 members), and localization checks passed. Full Mobile npm check stops at exactly the six pre-existing LedgerSetupResourceScreen memoization lint errors under FOLLOW-006; later stages of that compound command are not claimed as a full pass. The current ownership catalog contains 20 sources / 6,939 keys. A Release API build incorporating the regenerated embedded catalog passed with zero errors and 73 existing warnings; Web/API catalog-bearing artifacts must be published together. This change needs no migration or database mutation.

Browser harness research used the official Playwright role locator contract (https://playwright.dev/docs/locators#locate-by-role): the expanded shell has two accessible Close navigation controls, so the test scopes the action to the banner instead of selecting ambiguously. Earlier test failures are preserved in local logs; this correction changes no application behavior. A prior supplemental Countries cold-render assertion also failed; FOLLOW-009 remains open independently of subsequent successful reference runs. Visually inspected company and system menu captures show independent Administration and Settings sections with translated labels.

UI audit: creation/editing introduce no new data controls; the existing retention validation/conflict journey remains the configuration acceptance case. Viewing retains scoped shared details. Listing/filtering preserves the established Grid/Cards shell and shared paging. Diagnostic mock creation remains Excluded; deterministic fixtures are test evidence only. Physical native acceptance remains explicitly deferred by the requester under PROD-026; no native-device pass is inferred from Jest or Android export.

**Final navigation verification: Verified for the authorized development/automated scope.** The final Playwright run passed 6/6 after the scoped role-locator correction: system menu/detail/settings navigation, company menu/filter/detail/XLSX and shared record paging, retention validation/conflict recovery, UTC/criteria/empty recovery, Countries reference Grid/Cards, and Arabic compact Cards with internal scrolling. Android Hermes export passed. After browser completion, the sequential Web production build passed without type/build bypass. Planning and all 149 documentation recipes passed; final regeneration includes this acceptance entry. Local verification logs use the `.codex-tmp/administration-nav-` prefix. No full native, whole-repository test-suite or production release-budget pass is claimed; existing PROD-026, FOLLOW-006–009 and RISK-009 remain separately owned.



## Web detail readability/copy correction - verification in progress, 2026-10-19

Shared transport/scoped formatter and existing error report unit tests pass 7/7 in three suites. Initial browser run encountered an unavailable PersonOutline import before rendering; the installed MUI v9 package exposes PersonOutlined/PersonOutlineOutlined, and the adapter now uses the verified installed PersonOutlined export. Stack wrapping is supplied through sx because the installed StackOwnProps does not expose flexWrap directly. No dependency/version change. Final browser/current type/build outcomes are recorded separately below. Copy uses the existing projected summary/metadata/sanitized method frames only; no raw exception field has been introduced. Native Mobile remains outside this Web-dialog correction.


## Detail/copy and richer diagnostics acceptance — 2026-10-19

**Verified for the authorized development/automated scope.** Final API restore/Release solution build passed (zero errors; existing analyzers remain warnings), and all 1077 solution tests passed across 12 test assemblies. New regressions cover nested/aggregate exception metadata without private messages, bounded rich storage with actual JSON encoder expansion, client-origin diagnostic rejection and safe HTTP route templates without request values. Existing architecture, scope, job capture, retention and export checks remain green. The standard module migration/apply script completed across all nine modules: no relational model change/no empty migration. A live SQL probe confirmed nvarchar(max), zero pending Platform migrations and exact persistence of 20004 characters inside a rolled-back transaction.

Authenticated live HTTP acceptance passed 28 checks on the rebuilt API using the configured development database: company/system permission denials, independent retention grants, strict metadata ingress, deduplication, UTC, filtered XLSX, and new trusted HTTP/version/trace/scope metadata persisted and retrievable only through system details. Company diagnostics remain empty and IP absent. An initial local probe ran before the new host finished startup and received connection-refused; the unchanged script passed after the listener was ready. No application workaround or deliberate failure endpoint was introduced.

Web production build and full npm check passed; the existing AuditTrailPage useMemo warning remains. Focused shared clipboard/scoped formatter/error-report tests passed 7/7. Error detail Playwright passed 3/3: complete real clipboard round trip (Windows CRLF normalized only by the assertion), denied clipboard/retry, long summary/frame wrapping, light/dark, Arabic phone, footer/close visibility and company technical-data exclusion. Launcher contrast Playwright passed 2/2 across English light/dark and Arabic phone. Browser screenshots were visually reviewed. Company UI ownership catalog checks pass at 20 sources / 6951 keys; publish the matching catalog-bearing API/Web artifacts together.

Mobile compatible detail/remote boundary suites pass 7/7, and strict typecheck passes. Native runtime UI/wire schema is unchanged: existing selectable detail renders richer allowed string-array diagnostics and still excludes unexpected company IP/diagnostics. Physical-device verification remains requester-deferred PROD-026; no physical-device or newly implemented native clipboard claim. UI audit: Creation/Editing are not applicable to immutable diagnostic facts and no new entry form is introduced; Viewing is verified per scope; Listing/Filtering keeps MyDataGrid/Cards/server paging; mock generation remains Excluded with deterministic fixtures used only for tests.

Repository-wide release gates remain distinct: RISK-009 still flags the same seven protected-shell routes at 2427434–2471137 bytes (+1294 each versus the preceding Administration build), with total JavaScript 24.09 MiB <26 and shared first load 0.86 MiB <1.85. Existing Mobile full-lint FOLLOW-006, whole-Web collection FOLLOW-007, dependency FOLLOW-008 and reference SSR FOLLOW-009 are not closed by focused acceptance. Capture remains best effort under RISK-010. Local evidence uses .codex-tmp/error-detail-* and administration-icons-*; customer education describes copy behavior, old-record limitations, safe metadata and native scope. Final documentation generation/check passes for all 157 recipes; planning checks pass with the two existing unrelated plan-contract migration warnings.


## Diagnostics section visibility correction — 2026-10-19

Root cause: the Web diagnostic heading used Technical details and the entire system section was conditional on a non-empty array. Corrected using existing FormSection/EmptyState; successful authorized system detail now always includes Error diagnostics / تشخيص الخطأ, with truthful empty guidance and identical copied report text. Company technical section/IP remains excluded; no API/capture/domain/schema/native runtime change and no migration. Official conditional-rendering behavior and exact decision are recorded in the Web book.

Acceptance: focused clipboard/formatter tests pass 7/7; Playwright passes 5/5, including populated light/dark, clipboard denial/retry, company exclusion, empty English desktop and Arabic phone with real clipboard assertions. Both new empty-state screenshots were visually reviewed; section, empty guidance and footer are readable. Catalog regenerated/checked at 20 sources / 6953 keys; the catalog-bearing API Release build passes with zero errors and 73 existing warnings. No new public boundary or dependency. Final full Web npm check passes with zero errors and the one existing AuditTrailPage hook warning; strict TypeScript passes. Documentation generation/check passes for all 157 recipes. Existing repository release/mobile notes remain unchanged; prior API/development acceptance is not recharacterized as a new full-suite run.
