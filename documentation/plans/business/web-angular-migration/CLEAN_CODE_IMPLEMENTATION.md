# Clean Code implementation — FOLLOW-022

Authorized2026-10-31: requester ordered all recorded findings fixed and repeated
that every component belongs in its own folder. Scope is Angular technical
maintenance, retaining direct API, PrimeNG/shared components, shared tokens,
Reactive Forms, current permissions and existing business behavior.

## Current implementation

| Finding | Implementation evidence | Acceptance owner |
| --- | --- | --- |
| CC-01 Semantic quality | Pinned eslint10.14.0, angular-eslint22.6.0, typescript-eslint8.72.1 and Vitest ESLint plugin1.6.28; eslint.config.mjs; npm run lint with zero warnings in existing full check/CI; selected Angular diagnostics are errors. | Full lint/types/Angular compilation and existing CI command integration |
| CC-02 Dependencies | Auth session entry no longer exports SessionPage. Module controls/routes and Shell context have narrow public entries. Launcher types and spreadsheet contracts are separate from UI/service runtime. Static/type/dynamic edge classification and zero static-cycle enforcement replace an undifferentiated candidate count. | Resolved dependency scan and navigation/browser acceptance |
| CC-03 Responsibilities | MyDataGrid delegates column preference state to grid-column-presentation and native sizing/font observers to grid-viewport inside its existing folder. Countries columns/actions belong to country-list-presentation. Criteria types, value validation and pure normalization are separate from URL codec assembly. Record feedback decision is pure; its controller retains lifecycle/focus/flash ownership. AuthSession remains the one reviewed session authority. | Focused behavioral tests, full suite and actual shared/feature browser journeys |
| CC-04 Indexed access | noUncheckedIndexedAccess enabled for app/spec/templates. Indexed reads are guarded; missing workbook sheet/cell, chart series and response slots are handled explicitly. Projected collection templates use shared collectionColumn Pipe by key, including all applicable runtime/dev/test consumers. | Strict compilation, column identity/reorder checks and browser journeys |
| CC-05 Optional contracts | exactOptionalPropertyTypes enabled. Optional vendor/config properties are omitted deliberately; source filter definitions are required by identity. No blanket widening or non-null-assertion conversion. | App/spec/templates and API/owner contract tests |
| CC-06 Usage and lifecycle | noUnusedLocals/noUnusedParameters enabled. Navigation/Grid/calendar startup injection remains explicit in constructors. Typed template predicates retain their parameters with intentional underscore names. Service mocks follow actual service contracts and fixture entries are checked. | Lifecycle, localization, form and context tests |
| CC-07 Ownership enforcement | AST HTTP alias/constructor/fetch checks plus resolved cross-owner imports; Shared cannot import business state or unrelated Platform capabilities. Reviewed localization adapter remains allowed. Public owner facades may expose their own descendants. Source-boundary cases verify both accepted and rejected patterns. | Architecture/dependency tests and complete source scan |

Every recurring control remains in Shared; no Countries-local Grid/form shell,
native replacement or new global store was introduced. Component folders and
external HTML/SCSS rules remain enforced. No API/domain/schema or Next/native
runtime change is part of this maintenance.

## Verification discipline

Run npm run check with VITEST_MAX_WORKERS=2 on this workstation. No test skips or
relaxed assertions. The current command includes formatting, semantic lint,
configuration, tokens/fonts/catalogs, architecture/dependencies, app/spec types,
all unit tests and production build. Browser evidence is recorded separately;
fixtures do not establish live hosted acceptance.

Earlier failing attempts are retained under .codex-tmp: stricter compiler errors,
the two test-host positional column bindings, and initial semantic lint findings
were fixed rather than relabeled passes. Initial Grid source fingerprinting failed
because a flat directory reader tried to read component folders as files; it now
walks real files recursively and fingerprints extracted helpers too. Module browser
first used its historical local7037 default against the host-configured frontend;
the fresh run explicitly intercepts the configured host origin. Collection density
verification polls the same one-pixel tolerance through async rendering.

Typed static-validator callbacks are allowed. Tests use Vitest's assertion-aware
unbound-method check and deliberately permit async fixtures without await. One
narrow, documented control-regex exception retains CSV formula-injection
protection. Generated files remain generator-owned; no app folder is blanket
suppressed. Runtime arrays/objects from untyped libraries/API error payloads are
narrowed before reading members. Scalars never expose accidental object labels.

Final verification receipts and limits are appended only after their actual runs
complete. Historical CLEAN_CODE_AUDIT.json remains the original review baseline.
Complete pilot remains Not Verified until its separate full contract, including
hosted managed-report availability tracked by PROD-028, is accepted.

## Final acceptance

Status: **Verified for CC-01 through CC-07**. Full check passes with zero enabled lint warnings/errors, 4 configuration tests, 26 architecture/dependency tests, strict app/spec types, Angular templates and selected extended diagnostics, **84 unit files / 472 tests**, catalogs/tokens/fonts and production build. Initial bundle **495.64 kB / 128.92 kB estimated transfer**, below unchanged 500 kB warning / 1 MB error budgets. No budget increase. CLEAN_CODE_CHECK.txt is the raw final command receipt.

**122 bounded browser cases pass**: Countries read 8, actions 8, shared Grid capabilities 8, Table/Cards collections 8, module/context navigation 24, unsaved navigation 8, URL/history criteria 8, Boolean 8, Date 8 plus 10 timezone cases, import 15, realtime 9. Preliminary Grid smoke also passes and is not double-counted. CLEAN_CODE_BROWSER_RESULTS.json records each actual receipt. Writes in these journeys are intercepted fixtures; no new host business writes or live Crystal rendering. PrimeNG MCP validates current Table usage against metadata; compiler and browser results provide behavior proof.

Current source inventory: **84 components, zero flat component files**, 209 non-generated app TS files. Resolved edges: 516 static, 100 type-only, 34 dynamic; **zero static cycles and zero remaining mixed candidate groups**. Historical four candidates are resolved by narrower public entries and contract ownership. All four additional compiler flags are enabled, with zero remaining app/spec/template diagnostics in the final gate.

Responsibility extraction retains the existing public UI: MyDataGrid 942 -> 826 source lines; CountriesReadPage 439 -> 331; criteria codec 319 -> 155. Controller retains lifecycle and delegates pure record decisions. Line counts describe the extraction, not a quality grade. AuthSession's single identity/generation authority is deliberately retained after its scope/refresh/uncertain-outcome and teardown review, with current unit and browser coverage.

The folder/HTML/SCSS policy remains mandatory for future components. Existing inherited documentation planning warnings (education-module and erp-platform-template) and separate full-pilot/release items retain their owner. Browser development runs may emit pre-existing Angular/vendor component-ID or identity-tracking warnings; this source hardening does not claim a vendor patch or full S2/pilot closure. PROD-028 still owns the independently observed hosted report catalog503.
