# Angular localization foundation - Angular Web applied profile

## 1. Ownership
Platform client port under web-angular; existing SQL/API owners unchanged. Exact slice S1-A0 in the canonical plan/contract.
## 2. Scope and reference
LOCALIZATION_PARITY owns frozen rules. Reviewed current Next runtime/resources/services, existing Company/System localization stores and schema-3 catalog. No unrelated reference business copied.
## 3. Domain and persistence
No new domain/schema/migration; existing company/global database overrides and audit retained. Angular never writes missing keys automatically.
## 4. Business rules
Baseline -> authorized system -> company; stable namespace/key/catalogVersion; original expectedRevision and placeholders. Runtime rejects mismatched identity/catalog and late generations.
## 5. Platform decisions
Angular runtime/service/build Required. New Web and Mobile visual Grid/Table/Cards/Tree/Detail/Report/Import/Export/Chart Excluded; actual Settings/login/UI later. Native/API runtime source unchanged.
## 6. Contracts
Existing client=web runtime DTOs and typed settings/text/default/reset routes. Global response has no fake company fields. No BFF, server policy or credential store invented.
## 7. Composition
Angular standalone strict/zoneless, signals for small state and i18next core. No React imports/runtime. Catalog-derived generated baseline/policy artifacts, lazy namespace registration.
## 8. States and transitions
Clear old overlays synchronously on identity/permission/context change; fence delayed responses; errors fall back to shipped text. No offline write replay or forced 409 retry.
## 9. Security and authority
Existing API permissions/read-only/audit authoritative. Reject unsafe keys/HTML projection; no raw session credentials. Explicit user language overrides company default; document lang/dir synchronized.
## 10. Impact and reuse
Reuse API/schema/catalog. Add Angular CLI/localization runtime/typed service/tests only. No native UI, new role/permission, integration effect, queue, table or engine.
## 11. Verification
Phase 06 Verified for exact S1-A0: Angular 3 files / 14 tests, strict types, production build (295.40 kB initial), architecture and Angular catalog checks passed. Canonical catalog check passed (21 sources / 7107 keys); retained Next localization 4 files / 10 tests passed. API/native sources unchanged; full suites not rerun for this client-only increment. IMPLEMENTATION_REPORT.md owns precise evidence and limits. Actual signed-in SQL/Angular consumer acceptance is FOLLOW-012, Required at S2/S4.
## 12. Operational behavior
Independent Angular build; rollback new client source only. No deletion/rename/reseed of persisted translation data. Production hosting/origins remain PROD-017/019.

Maintenance 2026-10-29: the tracked `web-angular/.env` selects `local` or `host`
and defines their public HTTPS API origins. Npm Angular commands generate one
allowlisted API build input consumed through ERP_API_ORIGIN; `.env.local` and
process overrides are supported. See [Angular environment guide](../../../../guides/web/ANGULAR_ENVIRONMENT.md)
for exact commands, precedence and rebuild semantics. Unit HTTP providers are
independent of device selection. This does not certify hosted Cookie/CSRF access
or change SQL/API/native/Next behavior.
## 13. Localization and accessibility
Namespaced en/ar; placeholders compatible with existing i18next; plaintext output; lang/dir updates; no new business visual surface.
## 14. Delivery
Technical runtime/build/compatibility Verified. Documentation/handoff is Closed after current manifest/generated packet checks and handoff. PrimeNG/theme, shared controls, login/shell and Settings editor remain later explicit contracts. Existing API SQL ownership is retained; no migration or native change. PROD-017/019 own deployed hosting/origin checks.
## 15. Evidence and closure
Final required-files.json registers existing source/config/test/generated resource and canonical evidence paths. Feature-scoped packets are regenerated from these numbered books. Phase 06 Verified for the technical unit; Phase 07 education N/A because no business screen was introduced. No actual Angular database edit/reload acceptance claimed; FOLLOW-012 remains open.

S1-A7 catalog evolution2026-10-29:39 core dateField captions were added through existing generators;21sources/7182entries, Web fingerprint4b15d10c6ef61fba890512f7f52842bcd9b17dab362a7bb6d6bf620a677770d7. CalendarLocale reads current SQL-backed text/overrides and clears scope through existing runtime. Native catalog identity unchanged; API business/schema unchanged. API localization43/catalog7 and Angular173/date40+final8/timezone10 pass. Report: documentation/modules/platform/features/angular-date-field-foundation/IMPLEMENTATION_REPORT.md. Matching deployment remains PROD-019, not claimed by fixtures.

S1-A8 resource evolution2026-10-30:11numeric captions through canonical generators;21sources/7193entries, Web fingerprintb6a04fc735e9523b3765a504b0027820a8fa376d0213edc244e3e7482a2f4760. NumericField scoped error override/reset proven via actual LocalizationRuntime. API localization43/catalog7 pass; native fingerprint/business/schema unchanged. Matching host resource deployment remains PROD-019. Report: documentation/modules/platform/features/angular-numeric-field-foundation/IMPLEMENTATION_REPORT.md.

S1-A9 resource evolution2026-10-30:7boolean captions through existing generators,21sources7200entries, Web hashcba7ae1870dceb9a239811ecd0f9a4be1126577a32dfa1c748c94eb639fa0dc6. Existing SQL-backed localization/strict scope retained; API43/catalog7 pass. Native hash/API business/schema unchanged; matching host publication PROD-019. Report: documentation/modules/platform/features/angular-boolean-field-foundation/IMPLEMENTATION_REPORT.md.

S3-A0 resource evolution2026-10-30:4 reports.* captions via existing generators;21sources/7204entries, Web hash18508f727a911a54bbd521601ced5663a7a0215e96e2b65265d10b4b8ea2c4cc. Existing SQL override ownership/scope and strict catalog matching retained. Native identity/API business/schema unchanged; matching hosted resource publication remains PROD-019. Reporting acceptance is still Active.
