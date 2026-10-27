# Company UI localization — Evidence and Phase 00 preflight

## 1. Approved scope
Plan platform-user-permissions-and-company-localization; S2 Company UI localization.
Requester approved company customization and en/ar only on 2026-10-17. Native acceptance explicitly scheduled under PROD-026.
API, Web and Mobile automatic verification evidence exists. Physical native acceptance remains separately scheduled under PROD-026.

## 2. Existing-system relationship
Reviewed Web global localization page/services and Mobile global localization screen/remote adapter, Platform company geographic scope, auth transition lifecycle, static/lazy i18next registration and user preference stores. Those references establish shape, not proof of new runtime behavior. Company settings require a new durable scoped root, separate from global API file resources.

## 3. Gate and risk review
G0–G4 are implemented and Phase 06 is Verified for the requester-authorized automatic scope. Business, edge and impact matrices remain in the implementation request and v2 screen contract.

Adversarial review: rejected arbitrary keys/scope spoofing/global file mutation; preserved explicit preference; reset restores shipped target; late namespaces must reapply current overlay; scope changes clear synchronously and stale responses are discarded; missing target falls back safely; no company cache survives logout. Production migrations must be reviewed independently (PROD-016). Extra languages are DEF-025.

## 4. Verification ledger
API Verified; Web Verified; Mobile automatic verification Verified; integrated automatic scope Verified; Education completed and feature Closed. Device evidence PROD-026; inherited full Mobile gate FOLLOW-006; supplementary full Web Vitest collection FOLLOW-007.
2026-10-17 preflight was finalized before runtime: four applied books, current-only required-file manifest and Phase 00 recipe. Design resolved nullable explicit preference, per-client fingerprint fallback, one composed mobile:translation source and both lazy Web module namespaces. S1 automatic acceptance closed before S2 execution; the following ledger records its completed implementation.


API stage verified 2026-10-17: 23focusedCompanyLocalization tests passed, full Platform suite 266passed beforelasttestaddition. Cataloggenerator/check:20sources/6733keys +perclientSHA256. Domainplaceholder/whitespace/default/reset/revision, Handlerinvalidkey/culture/value/version/paging andstoreaudit/no-op/stale/scope/clientfilter tests passed; read-onlysecurityreview noactionablefindings. Canonical migration20261017035730_AddCompanyUiLocalization applied todevelopmentdatabase. Infrastructurehostcatalog/store andApplicationerrors registered. Webstageactivated; liveHTTPacceptancefollowsintegration.


Web stage verified 2026-10-17: npm run check exit0 (one inherited AuditTrail hook warning), 11 focused resource/service/preference tests passed, desktop Chromium real rendered edit→runtime heading update→reset original-text journey passed (43.6s). Fixture server uses isolated .next-e2e so the existing local development instance remains usable. Source-based five-point audit: row/default forms create/edit settings through shared fields; revisions captured atopen; original/base/target view; server source/culture/status/search/paging; localmock preservesplaceholders. Native acceptance remainsPROD026. Mobile stage activated.

Web runtime follow-up verified 2026-10-17: focused bridge/resource tests passed (5 tests) and `npm run type-check` passed. The bridge only reconciles a response matching the current tenant/company, resets shipped resources on runtime failure, and emits the existing i18n language event. `useThemeSettings` already listens to that event to synchronize document direction and MUI/Emotion RTL. Super-admin runtime suppression is correct because the API TenantMember policy rejects super-admin principals. Equal base/target cultures remain an approved custom-baseline comparison mode.

Final API evidence: serial `dotnet test api/ErpSystem.sln -m:1` completed all 12 suites (1,027 passed, 0 failed); focused Platform coverage is 267. An initial parallel SQL handshake timeout was resolved by the serial run. Release host build completed with 0 warnings/0 errors; applied migrations were verified. Real HTTP acceptance completed 19 checks: save/reset/default/no-op/stale/invalid, anonymous 401, viewer 403, runtime 200, no-store, current fingerprint, Web/Mobile source isolation, and original settings restoration.

Mobile automatic evidence: 10 focused suites/28 tests passed; typecheck, architecture, contracts (84 routes/31 files), i18n (6,805 keys), foundation, release and Android export passed. The export bundled 3,000 modules in 155 seconds (9.7MB). Full Mobile check has only six pre-existing Ledger lint findings tracked by FOLLOW-006. The full suite has 173 passing suites and one inherited OfflineOperations native-binding failure before execution (523 passing tests); neither is a new S2 failure. Native five-point creation/edit/view/list/mock audit passed through API and automated source evidence; physical device coverage remains PROD-026.

Runtime integration evidence: Platform publishes company-localization changes only after commit to the company audience; Web/Mobile invalidate the scoped query prefix and retain a 60-second fallback refetch. Mobile auth refresh preserves resources for the same tenant/company/user and clears only after a validated scope change. Mobile uses an injected core i18n instance so Auth loading does not require a React Native plugin.

Final Web evidence: isolated `ERP_E2E=1 npm run build` passed with compile in 55 seconds and TypeScript in 79 seconds, and the company-localizations route is present. Two final browser scenarios passed in 47.7 seconds: English text save→runtime→reset, and Arabic default behavior with explicit EN cookie precedence plus absent-preference Arabic RTL and no body overflow at 390px. Desktop EN and phone AR screenshots were inspected. The current Web full check passed with one inherited warning; supplementary full Vitest collection remains very slow and is tracked as FOLLOW-007 rather than represented as a completed gate. Recent source fixes include Page `useMemo` four-select-all false behavior and runtime-bridge auth-owner cleanup preventing a direction remount loop. No known runtime feature regression remains.

## Phase 06 Verification & Acceptance

Decision: **Verified** for the exact requester-authorized automatic scope. API suite/migration/HTTP acceptance, Web focused/build/browser acceptance, and Mobile focused/source/export acceptance passed. This decision excludes physical native acceptance (PROD-026), the inherited Mobile full-gate findings (FOLLOW-006), and the supplementary Web full Vitest collection (FOLLOW-007).

## Phase 07 Customer Education & Closure

After Phase 06 Verified, the Arabic customer education pack was written at `documentation/plans/business/platform-user-permissions-and-company-localization/education/company-ui-localization.md`, registered in the actual-file manifest, and Phase 07 was registered for generation. It explains company scope, source/base/target/status/search/paging, edit/reset/default, explicit preference, placeholders, conflict/reload, permissions, online-only writes and update/fallback behavior. The five-point audit covers entry/edit/reopen, shipped/company viewing, table/grid/card/filter/paging and placeholder-safe mock generation on both clients through source and automatic evidence; physical phone/tablet/keyboard acceptance remains PROD-026. Closed for the authorized automatic scope; no full repository or native pass is claimed.


## Company/system catalog correction — 2026-10-17

Authorized scope: prevent system-owned UI text at companies only; a new global
Super Admin editor is Excluded by requester choice. The explicit policy is
`scripts/company-ui-scope-policy.json`. Embedded catalog schema 2 classifies all
6,805 leaves: 1,085 system leaves are excluded from company management/runtime;
5,720 company/shared leaves remain eligible (Web 15 sources / 3,274 leaves;
Mobile one mixed source / 2,446 leaves).

System-only sources, mixed navigation keys, and historical system overrides are
excluded before API text search/count/paging and runtime projection. Direct
handler/store set/reset attempts are Forbidden without revision/audit/realtime
side effects. Stored historical overrides are retained dormant. Web/Mobile
independently reject system overlays; lazy Web bundles retain their baseline.
Removed source selections wait for current settings and resolve to a returned
source before text requests. Address Types and tenant users/roles/permissions
remain customizable. Classification participates in per-client fingerprints.

Verification to date: all 12 API TRX reports pass (1,034 total, 0 failed), including
274 Platform tests and the focused company-localization regression tests. The
Release solution build passes with existing analyzer warnings. Read-only live
migration compatibility passes for all nine modules; no model/schema change or
new migration is required. Four Node policy/fingerprint regressions and catalog
check pass. Web focused runtime/source tests pass (5 tests), full Web check passes
with one existing AuditTrail hook warning, and both client type checks pass.
Mobile focused runtime/source tests pass naturally with open-handle detection
(2 suites / 7 tests); the touched test harness disables mutation GC timers.
Mobile architecture, API contracts, i18n/catalog, foundation and release-source checks pass. Final browser
and broad Mobile lint results are recorded below when complete.

Five-point UI audit: entry/edit forms and placeholder-safe mock generation retain
the existing shared controls; eligible saved values remain editable and resettable;
system values are not listed/searchable and keep shipped values in runtime; Web
Grid and Mobile Table/Cards consume the same filtered server rows; excluded source
selections cannot trigger premature requests. Physical native testing remains
PROD-026 under the user's existing deferral.

Final correction acceptance: **Verified for the authorized automatic scope**.
Playwright production-build Chromium scenarios pass: system-source and mixed-key
exclusion (including the Mobile source), company text edit/runtime/reset, and
Arabic default/RTL at 390px with explicit-preference preservation. An initial
browser-test failure was an incorrect expected option label (`Mobile interface`
versus shipped `Mobile app`); the test was corrected against the rendered source,
with no application change. Broad Mobile lint reports exactly the six existing
LedgerSetupResourceScreen memoization errors (FOLLOW-006); no new lint finding is
reported in localization sources. Architecture/contracts/i18n/foundation/release
source gates and both type checks pass. No claim of a full Mobile check or
physical-device acceptance is made. Deploy API, Web and Mobile together because
catalog scope changes their fingerprints; old clients retain shipped fallback
until matching versions are installed. No additional database migration is needed.