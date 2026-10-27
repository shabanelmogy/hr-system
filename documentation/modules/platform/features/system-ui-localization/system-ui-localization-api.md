# Authorized global UI texts — api applied book

## 1. Ownership and authorization

Platform owns global registered UI text configuration. SuperAdmin role is mandatory; SystemUiTexts:View/Edit/Reset are independent global grants. Every catalog key additionally requires its owning screen view authority. Unknown/company-private prefixes fail closed. No tenant/company identity is simulated.

## 2. Reviewed reference and shared screen pattern

P-001 adapts the existing company UI localization editor, shared Web MyDataGrid/MyForm/selects/confirmation and native AppListScreen/AppForm/Table/Cards. Extend the existing workspace/controller composition; do not copy visual shells. Existing runtime baseline registry handles lazy namespaces and auth transitions.

## 3. Existing-system relationship review

Extend ICompanyUiCatalog/embedded resource generation with explicit system authority metadata while retaining existing company/shared ownership. Reuse CompanyLocalizationTextPolicy placeholder validation and common text rows/query shapes. Existing company defaults and isolated overrides remain unchanged.

## 4. Domain and persistence

New global singleton SystemLocalizationSettings (Id 1) owns bounded 5000 overrides keyed source/language/key, values <=4000, en/ar only. Revision and rowversion handle stale writes; unique DB index and serialized SQL transaction prevent races. Global schema only, no company-scope query filter.

## 5. Typed API contract

GET system-ui-localizations/settings,texts,runtime; PUT text; POST reset. ISender CQRS handlers through a narrow store port. Global settings/runtime omit company/tenant/default-language fields. Reuse honest common text rows/query/write DTOs where appropriate. Runtime requires role and target-screen authority, not editor permission.

## 6. Rules and validation

Registered shipped keys only, bounded source/key/query/page sizes, en/ar, nonblank text, exact placeholders, expected nonnegative revision. Validate at handler and store; denied scope/target 403, stale revision/catalog 409. Read filters search/status/source/base/target and server paging.

## 7. Actions and lifecycle

View authorized sources/texts; edit existing target text; reset one override; preserve draft after errors/conflict through shared form. No create/delete keys, language creation, global default setting, mock configuration generator, import/export/tree/chart. Runtime only applies compatible authorized registered keys.

## 8. Permissions and edge matrix

SuperAdmin plus View lists editor; Edit/Reset also require View and owning screen grant. Company actors are denied all global operations. Missing/removed keys or changed placeholder contracts become dormant. Changes to permissions/logout clear prior runtime layers before exposing another scope. Stale network responses are discarded by generation and identity.

## 9. Transactions and audit

SQL global lock and expected revision inside transaction; save state and security audit old/new atomically. Same-value and absent-reset are no-ops. No post-commit failure undoes a committed change. Runtime refresh initially, after own mutation, on reconnect and periodically.

## 10. Client data ownership

Web types and Zod adapters -> services -> React Query -> workspace composition. Native domain port -> use cases -> remote validated adapter/repository -> composition -> queries -> screen. Query keys include global actor and effective permission fingerprint; no transport calls in visual components.

## 11. Runtime resource layers

Phase 07 customer education and development closure: **Closed** after Phase 06 Verified. Verified guide: documentation/plans/business/super-admin-administration/education/system-ui-localization.md. Remaining physical/release gates retain PROD-026/FOLLOW-006/RISK-009.

Integrated verification decision: **Verified** for the authorized development/automated scope on 2026-10-19. API Release restore/build and all 1088 tests across 12 assemblies passed, including real SQL migration/first-writer concurrency/audit/reset. Migration 20261019150523_AddSystemUiLocalization is applied to the development Platform database; all nine registered persistent schemas are current. Final authenticated HTTP acceptance passed 25 assertions for Web/Mobile text save/runtime/no-op/409/reset/placeholders/private-source denial and company/client isolation; original test captions were restored. S1 independently passed 12 access/health assertions.

Web full npm check and production build passed; 46 focused tests and 6 browser scenarios passed (company isolation/default/preference, global audit cursor navigation and EN/AR system edit/runtime/reset/footer). The six catalog/policy tests and generated artifact check also pass. Native 54 focused tests across 12 suites, strict types, route/endpoint contracts, architecture/i18n and final Android export (9.8 MB Hermes) passed. Changed native sources/tests have clean focused lint after import cleanup.

Inherited gates stay explicit: full native check stops on six existing LedgerSetupResourceScreen memoization errors (FOLLOW-006); physical native/device acceptance remains user-deferred PROD-026. Web measure:build flags the same seven protected-shell routes at 2,441,647–2,485,350 bytes against 2,359,296 (RISK-009), an additional 12,462 bytes versus S1; aggregate JS is 24.15 MiB. No threshold was raised and no clean release-budget or physical-device claim is made. These release constraints do not reopen the explicitly authorized functional development slice.


Shipped en/ar baseline remains immutable; global overrides are a distinct SuperAdmin-only layer. Generated client allowlist provides defense in depth for server payloads; unsafe prototype paths and unknown leaves are rejected. Explicit user language preference is preserved. Company runtime never receives system overrides.

## 12. UI contract and acceptance

Both clients expose real edit/reset UI, loading/empty/retry/forbidden/dirty/conflict states, server paging and bilingual labels. Web additional criteria live in generic toolbarFilters. Native retains Table/Cards with shared controls. Five-point audit covers edits/reload/reset/view/list; no mock generator for configuration identities.

## 13. Verification contract

Required API domain/handler/store/controller/permission/model tests, solution restore/build/test, standard migrations and live schema, live company denial/authorized edits/no-op/conflict/reset/runtime. Web focused tests/types/full check/browser en/ar edit/reset; native tests/type/contracts/i18n/Android export. Inherited FOLLOW-006/RISK-009 and physical PROD-026 stay separate.

## 14. Implementation execution

API -> Web -> Mobile -> integrated live verification -> documentation/education closure. S1 is Closed. S2 Phase 00 requires initial applied books, finalized current-evidence manifest, recipe registration and generated packets before runtime. No unresolved preflight finding or future file is registered.

## 15. Phase 00 readiness

Approved scope and G0-G4 for development/automated acceptance are recorded in canonical plan and v2.0 contract. Required UI and API workflow decisions above are finalized. Initial Phase 00 did not claim runtime verification; the final Integrated verification decision below records the delivered implementation. Production-only/physical release items retain their central note IDs.

API stage Verified: Release restore/build, 1088 solution tests including a real SQL singleton first-write race/audit/reset test; standard AddSystemUiLocalization migration applied and all module schemas verified current. 17 authenticated HTTP checks passed including global save/no-op/409/reset/runtime, company isolation and forged private-key rejection. Initial no-build integration used a pre-migration assembly copy; after rebuilding all assemblies the model/migration gate passed, without suppression. Official tooling contract: https://learn.microsoft.com/ef/core/miscellaneous/cli/dotnet .
