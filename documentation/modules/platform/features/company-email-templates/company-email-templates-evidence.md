# Company email templates — Evidence and verification

Reviewed 2026-10-21. Authorized development/automated scope; no production release or external delivery claim. Phase00 completed before runtime. One feature, strict API → Web → Mobile → Integrated → documentation sequence.

## Phase ledger
| Phase | Status | Verified evidence |
| --- | --- | --- |
| 00 Preflight | Passed | user decisions, discovery/spec, v2 contract, reuse inventory, four initial books, plan/source manifest; 173 baseline then181 feature recipes |
| 01 API | Verified | runtime domain/CQRS/store/renderer/controller, scope/permissions/validation/audit, sender binding; final Release build and1109 tests/12 assemblies/zero failures or skips |
| 02 Web | Verified | shared Grid/form/lazy editor/final preview;5 unit cases and2 EN/AR browser journeys; full check/build |
| 03 Mobile | Verified | read-only Table/Cards/modal/HTML preview, typed route/endpoint matrix,44 tests/9 suites, types/architecture/contracts/i18n/export and focused lint |
| 04 Integration | Verified |21 live development HTTP checks, actual scoped writes/reset with original content restored, MIME capture without network; real SQL concurrency/audit |
| 05 Delivery | Verified |20261020201511_AddCompanyEmailTemplates applied through standard module script, schema exercised by SQL tests; additive forward-fix/reset path |
| 06 Acceptance | Verified | authorized automated/development scope only; five-point platform audit below; release-only notes retained |
| 07 Education/closure | Closed | Phase06 Verified before customer guide; canonical books/actual manifest/recipe reconciliation completed |

## Verification artifacts
- API final logs: `.codex-tmp/email-api-verified-build.log`, `email-api-verified-tests.log` (1109/12), `email-api-catalog-build.log` (final embedded localization catalog), `email-migrations.log`.
- HTTP: `.codex-tmp/email-live-http-current.log` and runtime result JSON;21 passed, anonymous/global/unknown-language/catalog denials, EN/AR sample preview, invalid content, save/stale/reset; original contents restored.
- MIME capture: CompanyEmailTemplateTests uses the actual PlatformIdentityEmailSender.CreateMessage builder for both languages; one intended recipient/no copies, HTML/plain text/subject. No SMTP session or delivered-mail claim.
- Web: `.codex-tmp/email-web-browser-final.log`2 passed, `email-web-tests.log`5 feature cases passed; final `email-web-delivery-tests.log`12 scoped/related tests passed, full `email-web-verified-check.log`, final `email-web-optimized-build.log`. Preview screenshots EN/AR are in `.codex-tmp/email-template-preview-en.png` and `email-template-preview-ar.png`. Browser tests verify current unsaved final preview, formatting/undo/redo, field validation, save/reset, shared record navigation and narrow viewport.
- Native: `.codex-tmp/email-mobile-tests-final.log`44/9; `email-mobile-architecture.log`, `email-mobile-contracts.log`, `email-mobile-delivery-i18n.log`, `email-mobile-focused-lint.log`, `email-mobile-export-final.log`. Compatibility matrix90 routes/35 endpoint files/253 members is repository total, not feature endpoint count.
- Runtime source tests are durable required-file evidence. Temporary logs/screenshots are supplementary local acceptance artifacts, not future source dependencies.

## Five-point UI audit
| Journey | Web | Mobile |
| --- | --- | --- |
| Creation | Customize registered standard template through dedicated subject/rich body controls; arbitrary definitions Excluded | Excluded by user decision |
| Editing | Existing effective content loads; validation, variable insertion, dirty/conflict/reload, save/reset | Excluded; no native write service/buttons |
| Viewing | Final subject/HTML with sample substitutions, read-only mode and stale-preview warning | Table/Cards selection opens sample final subject/HTML/variables in shared modal |
| Listing/filtering | MyDataGrid toolbar/search/language/status/footer/record navigation | AppListScreen shared Table/Cards/search/filter/page state |
| Mock/sample | Valid local subject draft and server dummy renderer, no auto-save/send | Deterministic fixtures/server dummy preview; editor generator Excluded |

## Findings classified
- Feature regressions: none unresolved in authorized automated scope. Initial Grid action overlap, stale preview, toolbar reactivity and narrow HTML viewport corrected and rechecked.
- Inherited repository failures: FOLLOW-006 six LedgerSetupResourceScreen memoization lint errors; FOLLOW-008 Expo Doctor15 patch mismatches; FOLLOW-007 supplemental full Web Vitest collection issue. Focused native lint/tests and scoped Web suites pass; full native check is not green.
- Release performance: RISK-009 same seven shared-shell routes above2.25MiB; final2,446,767–2,490,470 bytes, shared first load916,756 and aggregate25,747,619 within limits. Nine initially newly exceeded Ledger Setup routes corrected to2,673,501 below2,673,869. No budget raised.
- Environment/manual release checks: PROD-026 physical native testing explicitly deferred by user; no adb/device acceptance claimed. PROD-027 approved SMTP/received-client acceptance remains open; preview/MIME do not establish provider delivery. PROD-017 production configuration remains outside development scope.
- No remaining product decision for S1. Rental/fine scenarios, arbitrary definitions, attachments/copies/campaigns/global editor/native editing explicitly Excluded rather than runtime placeholders.

## Final contract
Direct Administration > Email Templates. Complete GET rows, no redundant GET detail route. User/tenant/company isolation; View/Edit/Reset independent. Three definitions/two languages. Trusted persisted invitation or matching verified recipient/session company customization; shipped defaults otherwise. No actual test mail sent. Same renderer supplies preview/delivery content; client-specific typography may differ.

Final client/API localization fingerprint and company runtime request also passed (.codex-tmp/email-final-catalog-live.log). Full final Web check: email-web-delivery-check.log. Customer guide: documentation/plans/business/company-email-templates/education/company-email-templates.md. Final documentation/planning checks validate closure independently.
