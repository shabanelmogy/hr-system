# S2-A6 bounded implementation request

Plan web-angular-migration; exact Single feature angular-module-context-navigation. User requested execution.

Implement only the shared permitted application/overview header navigation described in the version2 contract. Existing API read, native launcher and Next remain unchanged. Reuse existing OptionSelect/ContextBadge and tokens; one identity-scoped catalog for header/page, strict actual routes and no unknown/admin destination. Preserve cancellation, 30-second entry freshness, rejected/failed navigation, context update exclusion, bilingual keyboard/compact behavior. No new domain/schema/permission or editable workflow.

API relationship: Reuse ModulesController/GetAccessibleModulesQuery and current policy. Business rule owner Platform; no module grant invented. Edge cases: blank tenant/global denied, unauthorized direct URL, malformed/empty/error/timeout, retry only explicit, no stale identity, pending auth/navigation, aborted navigation. Impact: Extend Angular state/root slot; generic read refresh and tests; API/native/Next runtime N/A.

Run Phase00 checks before implementation; full Angular gates, production fixtures/live catalog and retained regressions before Phase06 Verified. Customer education Required after Verified. Current manifest: required-files.json.

Requester refinements: all Angular workflow widgets must use shared PrimeNG adapters. Improve Select menu icons, sizing and themed scroll; use shared PrimeNG ScrollArea for page/sidebar/drawer, RadioButton for palette choice, pButton field actions and Tooltip instead of browser title. Context labels must appear in full on desktop and collapse to icons on small/space-constrained toolbars. Keep shared tokens, keyboard, RTL and existing scope/navigation rules.
