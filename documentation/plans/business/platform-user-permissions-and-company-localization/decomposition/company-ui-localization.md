# Company UI localization — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata

| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `platform-user-permissions-and-company-localization` |
| Authorized slice | `S2 Company UI localization` |
| Child Feature ID | `company-ui-localization` |
| Child feature name | `Company UI localization` |
| Owner | `Platform` |
| Depends on | `S1 Company user permission grants; active tenant/company session; Platform module catalog` |
| Execution status | Closed |
| Status evidence | EXECUTION.md; applied evidence Phase 06 Verified and customer education; PROD-026/FOLLOW-006/FOLLOW-007 remain separately owned |

## 1. Child boundary and outcome

Platform owns one `CompanyLocalizationSettings` aggregate per trusted Tenant/company. It stores a default language (`en` or `ar`) and one aggregate revision for company UI overrides. The delivered outcome is a company administrator can select that default and set/reset validated, company-specific UI text overrides from the shipped Web and Mobile catalogs; authenticated runtime clients receive only their current company’s overrides.

Overrides are identified by client source, culture, and exact registered key. The shipped embedded client catalog remains the base. The existing global file-backed Localization API editor remains a separate Platform advanced-tool workflow and is not migrated, reused as storage, or changed by this child.

Explicitly outside this child: global localization resource editing; arbitrary tenant/company selection in request input; filesystem writes; server-side translation generation; user/company permission grants; durable offline caching of runtime overrides; device/native acceptance evidence (`PROD-026`).

## 2. UI Pattern Gate (mandatory before implementation)

| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `platform.company-localizations.editor` | Web | `/administration/company-localizations` | Set current-company default UI language and customize shipped text | Bounded server-paged translation rows plus settings | P-001 | Settings section plus MyForm row editor and shared reset confirmation | `web-next/src/platform/advanced-tools/localization/pages/LocalizationPage.tsx`; `web-next/src/shared/components/forms/dialog/MyForm.tsx` | Adapted | Grid/Table Required; Cards/Tree/Report/Import/Export/Chart Excluded; Detail Required | Shared loading/empty/error/retry; guarded forbidden; dirty row/form; revision conflict reload | Online authoritative | Local draft suffix on shipped text; placeholders retained; no fabricated key/version | `CompanyLocalizations:*`; trusted current Tenant/company | Contained grid scroll at small widths; logical RTL; keyboard labels and error focus | Existing editor is global file resource; this is company-scoped server paging and reset |
| `platform.company-localizations.editor` | Mobile | `/administration/company-localizations` | Set current-company default UI language and customize shipped text | Bounded server-paged translation rows plus settings | P-001 | Stacked settings and AppForm edit dialog; shared reset confirmation | `mobile-react/src/platform/tools/localization/presentation/screens/LocalizationManagementScreen.tsx`; `mobile-react/src/shared/components/forms/AppForm.tsx` | Adapted | Table/List Required; Cards Required; Tree/Detail/Report/Import/Export/Chart Excluded | Shared loading/empty/error/retry; guarded forbidden; dirty form; revision conflict reload | Online authoritative | Local draft suffix on shipped text; placeholders retained; no fabricated scope/key/version | `CompanyLocalizations:*`; trusted current Tenant/company | Phone/tablet, safe area/keyboard, EN/AR, RTL and 44pt actions | Existing tool edits global files; this screen is current-company settings and overrides |

## 3. Closest existing reference

| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Global Web localization editor | `web-next/src/platform/advanced-tools/localization/pages/LocalizationPage.tsx`; `web-next/src/platform/advanced-tools/localization/hooks/useLocalizationQueries.ts` | Server query/mutation boundary, loading/error row workflow | New client source/culture/key model, server paging, current-company scope, revision and reset; no global file mutation |
| Global Mobile localization editor | `mobile-react/src/platform/tools/localization/presentation/screens/LocalizationManagementScreen.tsx`; `mobile-react/src/platform/tools/localization/data/remote/localization-remote-data-source.ts` | Online-only repository/remote parsing and platform tool composition | New tenant-administration owner, company scope, default setting, revision, paging and reset |
| Company-scoped Platform feature | `mobile-react/src/platform/tenant-administration/company-geographic-scope/presentation/screens/CompanyGeographicScopeScreen.tsx` | Current-company route ownership, Platform feature layout, guarded save/query flow | Text rows are shipped-catalog projections rather than country selection |

## 4. Reuse and composition contract

| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web page/list state | `web-next/src/shared/components`; existing `LocalizationPage` | Reuse/adapt | Shared page header, state feedback, bounded Grid/Card renderer and server-paged controller; no local full-catalog filtering |
| Web edit form | `web-next/src/shared/components/forms/dialog/MyForm.tsx`, `FormContainer`, `FormHeader`, `FormContent`, `FormFooter` | Reuse | One RHF/Zod row-edit form with server field errors and dirty protection |
| Web destructive/reset feedback | Shared confirmation/dialog feedback components | Reuse | Confirm reset; leave modal open on failure |
| Mobile form | `mobile-react/src/shared/components/forms/AppForm.tsx` | Reuse | Dialog form with dirty protection, focus/error handling, keyboard/safe-area behavior |
| Mobile list/state | `mobile-react/src/shared/components/AppListScreen`, `AppDataTable`, `AppDataCard`, `AppStateView` | Reuse | One bounded query and shared list/card views; no second pager |
| Runtime Web namespaces | `web-next/src/locales/StaticTranslationScope.tsx`; `web-next/src/platform/modules/useModuleTranslations.ts` | Generic extension | Reapply active company overlay after static/lazy namespace registration |
| Runtime Mobile bundle | `mobile-react/src/core/localization/i18n.ts`; `LocalizationProvider.tsx` | Feature-specific composition | Restore cloned shipped `translation` resource then apply active company overrides |

## 5. Screen and workspace contract

| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| Settings/default language | Required | Top settings section; current company identity visible | View and set default `en`/`ar` with expected revision |
| Translation Grid/Table/Cards | Web Grid/Table Required, Cards Excluded; Mobile Table/Cards Required | P-001 server-paged list, source/culture selector, search and status filter | Inspect base/shipped/target values; open edit; reset customized key |
| Detail/View | Required | Selected row preview in edit dialog | Compare base value, shipped value, target value and customized status |
| Create/Edit | Required | Row edit dialog only | Enter non-empty override and save with expected revision |
| Reset lifecycle | Required | Confirmation dialog | Remove one override and return to shipped/base fallback |
| Tree/Hierarchy | Excluded | N/A | N/A |
| Report/Import/Export/Chart | Excluded | N/A | N/A |

## 6. Typed transport and server criteria

| Concern | Exact contract |
| --- | --- |
| Aggregate | `CompanyLocalizationSettings`: TenantId, CompanyId, DefaultLanguage (`en`/`ar`), Revision; overrides indexed by source/culture/key. One revision governs default plus all overrides. |
| Registered catalog baseline | Generated embedded client catalog of registered keys: Web namespace sources from `web-next/src/locales` / `StaticTranslationScope` and Mobile `translation` source from `mobile-react/src/core/localization/translations`. Keys are shipped/registered, never client-created. |
| Settings response | `GET /api/v1/company-localizations/settings` → `{ tenantId, companyId, defaultLanguage, revision, languages:[en,ar], sources:[{id,client,namespace}] }`. Scope echo is response-only. |
| Paged text response | `GET /api/v1/company-localizations/texts?source=&baseLanguage=&targetLanguage=&search=&status=all\|missing\|customized&page=&pageSize=` → `{ revision, items:[{key,baseValue,targetValue,shippedValue,isCustomized}], totalCount,page,pageSize }`. |
| Mutations | `PUT /default {language,expectedRevision}`; `PUT /text {source,language,key,value,expectedRevision}`; `POST /reset {source,language,key,expectedRevision}`. No TenantId/CompanyId client input. |
| Runtime response | `GET /api/v1/company-localizations/runtime?client=web\|mobile` → `{ tenantId,companyId,defaultLanguage,revision,overrides:[{namespace,language,key,value}] }`; accepted `client` is an allowlisted consumer selector, not scope input. |
| Server search/filter/sort | Search matches registered key/base/target text; `status` allowlist is `all`, `missing`, `customized`; deterministic key ordering only. |
| Paging/limits | Server paging is mandatory; pageSize 1..100; no full client catalog transfer for the editor. Runtime response returns only active overrides. |
| Validation/errors | Reject unknown source/key/culture/client; reject empty/whitespace text (use reset); require exact interpolation-placeholder multiset equality with shipped target key; validate string length/format; validation ProblemDetails, `409` revision conflict, fail-closed missing trusted scope. |
| Permission and scope | Admin settings/text endpoints derive TenantId/CompanyId from `ICurrentActor`; runtime endpoint is authenticated `[TenantMember]` and requires no CompanyLocalizations admin permission. |
| Persistence/schema/migration | Platform DbContext/schema; scoped aggregate/override keys and revision/concurrency configuration; no filesystem writes. |
| Cross-module contract | N/A — Platform owns aggregate, catalog policy, runtime response and effects. |

### Permission Action Matrix

| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Company localization administrator | CompanyLocalizations | View settings/texts | `GET settings`, `GET texts` | `CompanyLocalizations:View` | Trusted current Tenant/company | Render forbidden state/no editor access | Route and query guard | Route and query guard | View company localizations | عرض ترجمات الشركة | Missing View and foreign scope |
| Company localization administrator | CompanyLocalizations | Edit text | `PUT text` | `CompanyLocalizations:Edit` | Trusted current Tenant/company | Text form read-only | Row edit and submit guard | Row edit and submit guard | Edit company text | تعديل نص الشركة | Missing Edit/read-only/unknown key |
| Company localization administrator | CompanyLocalizations | Reset text | `POST reset` | `CompanyLocalizations:Reset` | Trusted current Tenant/company | Reset unavailable | Reset confirmation/action guard | Reset confirmation/action guard | Reset company text | إعادة تعيين نص الشركة | Missing Reset/conflict/unknown key |
| Company localization administrator | CompanyLocalizationSettings | Set default language | `PUT default` | `CompanyLocalizations:SetDefault` | Trusted current Tenant/company | Default selector read-only | Save control/direct guard | Save control/direct guard | Set company default language | تعيين لغة الشركة الافتراضية | Missing SetDefault/invalid culture/conflict |
| Authenticated tenant member | Runtime overrides | Read active runtime bundle | `GET runtime` | `TenantMember` only | Trusted current Tenant/company | N/A | Auth/session bridge only | Auth/session bridge only | N/A | غير متاح | Missing membership/no trusted company |

## 7. Create, edit, view, and lifecycle contract

| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| View settings | Active trusted company | Open route | Read settings and registered sources | View permission renders settings/text workspace |
| Set default | Current revision | Select `en` or `ar`, save | Lock company aggregate; validate; update default/revision/audit atomically | User language preference remains higher priority; runtime clients refresh |
| Edit text | Registered row, non-empty value | MyForm/AppForm row editor | Validate exact source/culture/key/placeholders; upsert override; revision/audit atomically | Target value becomes customized; shipped fallback retained for comparison |
| Reset text | Customized row | Confirm reset | Remove override; increment revision/audit atomically | Runtime falls back to shipped/base target value |
| Runtime load | Authenticated tenant/company session | Client requests allowlisted client bundle | Read only current company overrides/default | No management permission required; no client scope selection |

## 8. UX states, permissions, offline, and mock data

| Concern | Contract |
| --- | --- |
| Loading / empty / error / retry | Shared loading, empty and error/retry states. Empty means no matching registered rows or no customizations, never missing shipped catalog. |
| Permission / forbidden / read-only | Route and direct control guards use exact action permissions; server is authoritative. View absent is forbidden; edit/reset/default rights independently produce read-only/hidden controls. |
| Unsaved changes / destructive confirmation | MyForm/AppForm dirty protection; reset uses shared confirmation; preserve entered nonempty text after recoverable failure. |
| Offline / stale / conflict | Online authoritative only. No durable offline cache or mutation replay. Revision mismatch leaves entered value intact, displays conflict and supports reload/review. |
| Mock data | N/A — no fake catalog keys, translated text, tenant/company scope, or revisions. |

## 9. Concurrency, transactions, and consistency

All mutations acquire a transaction-owned current-company aggregate lock, compare `expectedRevision`, then update setting or one override, increment the single aggregate revision, and record audit in the same transaction. Duplicate submissions with a stale revision return conflict. No authentication security-stamp update or session revocation occurs; authorization has not changed.

After commit, dispatch a current-company runtime-bundle change and invalidate only company-localization query prefixes. Web/Mobile refresh the active bundle after save and runtime realtime invalidation. Auth company switch/logout resets the old overlay before transition and stale prior-company responses are ignored. No override may leak into another company session.

## 10. i18n, RTL, accessibility, and responsive behavior

All management UI strings are added in paired English/Arabic feature resources. Runtime catalog keys retain their shipped namespace/source and exact key identity. Placeholder parity is enforced server-side before saving; plural/context keys remain independent exact leaves.

Language precedence is: explicit user preference → company default → English. Device language is not consulted after a company default is available. Existing global editor behavior remains unchanged.

Web uses `StaticTranslationScope`/lazy module registration to restore static bundles then merge active company overrides. Mobile restores an immutable static `translation` clone before deep-merging active company overrides. Both clients use logical RTL styling, accessible labels, focused validation errors, and responsive table-to-card behavior. Native/device acceptance is explicitly deferred under `PROD-026`; automated Mobile checks remain required.

## 11. Vertical execution ledger (strict one-active-step gate)

| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | S1 automated/integrated evidence reconciled; this contract approved | Platform aggregate/contracts/migration, validation, concurrency/security/runtime tests | `company-ui-localization-api.md` |
| 2 | Web | Verified | API stage Verified | BFF/service/query, P-001 workspace, overlay lifecycle and i18n tests | `company-ui-localization-web.md` |
| 3 | Mobile | Verified | Web stage Verified | Clean Architecture adapters, AppForm/list, overlay lifecycle and automated checks | `company-ui-localization-mobile.md` |
| 4 | Integrated live verification | Verified | API, Web and Mobile stages Verified | Authenticated current-company route, save/reset/switch/logout isolation | `company-ui-localization-evidence.md` |
| 5 | Documentation and closure | Verified | Integrated live verification Verified | Canonical books, manifest/recipe and customer education; PROD-026 recorded separately | `company-ui-localization-evidence.md` |

**Next-step rule:** S1 closed before S2 runtime implementation. Both features now have their authorized automatic evidence, production build and education/closure. `PROD-026` permits native acceptance to remain separately deferred; it does not permit claiming native acceptance. FOLLOW-006/FOLLOW-007 preserve the incomplete full repository gates.

## 12. Verification contract

| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | Handler/validation tests | Trusted current scope, registered key/culture/source, exact placeholder multiset, empty→reset rule | Verified; full API 1027 passed |
| API/transport | Controller/contract/security tests | No TenantId/CompanyId input; TenantMember runtime; independent View/Edit/Reset/SetDefault denial | Verified; metadata and live 401/403/200 checks |
| Persistence/migration | Platform model/migration plus development database application | Scoped uniqueness, aggregate lock, revision conflict, atomic audit/rollback | Verified; canonical migration applied; live SQL save/no-op/stale/reset |
| Web | Service/query/component/i18n lifecycle tests plus type/architecture | Page/filter/paging, save/reset conflict, late namespace overlay, switch/logout stale-response reset | Verified focused checks, full static check, production build, EN/AR browser; supplemental full suite remains FOLLOW-007 |
| Mobile | Remote/repository/use-case/screen/i18n lifecycle tests plus `npm run check` | Typed parse/body, AppForm dirty/reset, current-company isolation, static restore | Verified automatic feature scope: 28 focused tests, type/architecture/contracts/i18n/export; full gate still fails inherited FOLLOW-006 |
| E2E/manual/live | Authenticated API and Web; Mobile automated evidence | Save/reset/default; explicit preference precedence; company switch/logout does not leak text | Verified 19 real HTTP checks and 2 browser scenarios; native device acceptance deferred under `PROD-026` |

## 13. Child exit gate

This child is complete only when:

- [x] Contract version is current and both platform rows pass the UI Pattern Gate.
- [x] Platform persists only current-company settings/overrides and has no global-file write path.
- [x] API validates registered client source/culture/key, nonempty text and exact placeholders.
- [x] View, Edit, Reset and SetDefault are independently authorized and tested; runtime remains TenantMember scoped.
- [x] Revision/lock/audit mutation behavior and migration application are verified.
- [x] Web and Mobile use their existing shared P-001/form contracts and static fallback is restored on save/reset/switch/logout.
- [x] User preference → company default → English precedence is verified.
- [x] Runtime overrides have no durable offline cache and never cross tenant/company scope.
- [x] Automated Web/Mobile checks and integrated evidence are recorded; `PROD-026` native acceptance remains explicitly deferred.
- [x] Canonical documentation/manifest/recipe and customer education are reconciled before closure.

Exact bounds: page >= 1, pageSize 1..100, search <=200, source <=100, key <=400, value <=4000, at most 5000 overrides/company. Missing status means no company override (shipped target/fallback still visible); label distinguishes missing customization from an empty effective string. Source identifiers are stable client+namespace values. Mock generates a valid local value by appending a bilingual sample suffix to the shipped text, preserving all placeholders; it never saves automatically.

## Resolved implementation design review (2026-10-17)

Maintain nullable explicit userLanguagePreference separately from resolved language; absence never becomes a persisted explicit choice. Company fallback is temporary and clears with scope; English fallback follows the approved specification. Mobile uses one source mobile:translation from the final composed en/ar objects. Web includes all 17 resource namespaces plus lazy module-accounting and module-hr. Base and target may be equal deliberately when comparing a company customization against its shipped text; language controls remain independently explicit.

The generated artifact contains a SHA-256 catalog version per client. Runtime requires catalogVersion for the selected web/mobile client and returns the matching version; unknown/mismatched versions return a stable 409 catalog-outdated outcome and the client restores shipped baselines. Editor reads the server's current catalog and revalidates every edit against it. Generated client version constants and API embedded catalog are regenerated/checked together after catalog changes. This prevents applying a server bundle to an incompatible shipped client. No arbitrary key is accepted, even on matching versions.

