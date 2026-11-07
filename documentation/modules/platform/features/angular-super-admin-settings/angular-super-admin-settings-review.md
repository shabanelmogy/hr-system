# Angular Super Admin Settings — applied review

## 1. Current scope

Settings retains System and Appearance tabs. Language/Translation is a separate Administration workspace for global system UI texts. The reviewed source is web-next/src/platform/company-localizations/pages/SystemLocalizationsPage.tsx and CompanyLocalizationsPage.tsx in system mode. The tenant Localization API screen is a separate capability and is not substituted for global system texts.

## 2. Language/Translation correction — 2026-11-07

The old Angular page hardcoded platform-auth, English-to-Arabic, page 1 and 25 rows and rendered a read-only list. It did not discover the sources authorized for the current actor and did not expose the source, language, status, pagination, edit or reset workflows from the reviewed screen.

The page now composes three small components: TranslationCriteria, TranslationCollection and TranslationEditor. MyDataGrid owns its toolbar, feedback, column options, scroll viewport, row actions and record/page navigation. The feature read state owns server source selection, debounced search, filters and paging; the editor owns one immutable target snapshot and the Signal Form. All templates and styles are colocated external resources.

The server settings response supplies available Web/Mobile namespaces. A valid requested source is retained; otherwise choose the first available Web source, then any available source. Never assume platform-auth is authorized. No available source yields honest empty feedback without a /texts request.

## 3. API and permissions

Use the existing system-ui-localizations settings/texts GETs, text PUT and reset POST. View requires super_admin plus SystemUiTexts:View. Edit and Reset have independent SystemUiTexts:Edit/SystemUiTexts:Reset checks and respect read-only context. Writes reuse LocalizationService and BrowserMutationSecurity CSRF; expectedRevision comes from the displayed text page. No new API route, role, permission, database table or migration is introduced.

Search, source, baseLanguage, targetLanguage, status and page/pageSize are server criteria. Page sizes are 10/25/50/100, matching SystemLocalizationsPage, not the independent tenant Localization API screen's 5/10/20/30. Columns are key/base text/target text/customized status plus shared edit/reset actions. Presentation preferences remain in Settings and TopBar.

## 4. Editing, errors and safety

The shared Signal Form validates nonempty text, 4000-character maximum and identical placeholder multisets. Save remains available while invalid; errors render under the field and shared FormContainer focuses it. API field errors map to the native field. The original and shipped values remain visible while editing.

Capture actor, source, target language, key and revision when opening. A conflict or uncertain write locks submission until explicit reload/review; no automatic replay. Shared UnsavedChanges/FormCloseGuard owns discard consent. Actor/permission changes cancel old acceptance and clear stale data. Reset requires explicit shared confirmation and retains the old displayed page until a successful refresh.

## 5. Verification and remaining acceptance

Current automated receipts are under verification/language-translation/. The [final verification receipt](verification/language-translation/verification-2026-11-07.json) records 971 passing Angular tests in 189 files, 32 architecture tests and the successful full Angular check. The final browser run passed all 12 EN/AR, Light/Dark, 390/900/1440px cases, including the 900x640 short-window boundary, with zero outer overflow. Both 390px language screenshots were reviewed. Twenty focused translation tests cover wire parsing, source discovery, server paging, permissions, cancellation, validation, revision capture, field errors, duplicate submission, conflicts and reset. The browser harness uses production assets and intercepted synthetic API responses; it never writes real translations or starts a server.

The final ERP Release build passed with 0 errors and 78 analyzer warnings; all 1331 solution tests passed with 3 existing opt-in browser skips, including 252 Reporting tests. The separate localization/catalog filter passed 43 tests. The catalog has 21 sources / 7485 keys and Web fingerprint 1e8962a7bf61ddc2500ecb38debec55aacbd19b76b43fa1a9a81ea534e97e3b7. The initial Angular bundle warning (581.92KB against 500KB) remains RISK-020. An earlier unrelated Countries timeout passed alone and in the final full run. An earlier browser harness toast-dismissal race was corrected by waiting for toast removal; application behavior was not changed for that race.

Full Angular gates and the receipt determine the final bounded acceptance. Earlier 2026-11-06 receipts remain historical and do not prove this correction. Hosted persistence/reload with actual roles is still FOLLOW-012; matching Angular/API catalog publication remains PROD-019. Crystal native/host acceptance is tracked independently by FOLLOW-024/PROD-028. No hosted publication is performed here.

Subsequent final-audit correction: the sole editor now also accepts the existing /super-admin/ui-texts deep link via redirect; route guard and sidebar reuse the same feature-owned Super Admin + SystemUiTexts:View policy. Shell's redundant Settings preferences item was removed while TopBar preferences remain. The [new bounded receipt](../angular-super-admin-final-review/navigation-verification-2026-11-07.json) supersedes the earlier source snapshot for these files: Angular974/191 plus12 current browser cases, including canonical redirect and one rendered Settings item. The earlier971-test receipt remains historical for its original source hashes.
