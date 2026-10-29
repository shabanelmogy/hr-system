# Angular application context navigation — API applied profile

## 1. Ownership

Platform Modules owns permitted catalog and application route selection. Shell owns only a generic header slot. Exact slice S2-A6; no API/native/Next source changes.

## 2. Scope and reference

Source Next ModuleContextSwitcher/useModulesQuery and Angular ModuleBrowser/ModuleCatalogState reviewed. Web P-008 Global Scoped Context Selector Required; retained native P-007 launcher Adapted, new native header Excluded. No business/admin placeholder, new grant or new store engine.

## 3. Domain and persistence

No entity, schema, migration, aggregate, lifecycle, money/date calculation, mutation or audit record. Existing server entitlement/session authority reused. Five-point structured-domain UI audit N/A on both clients.

## 4. Rules

Only normal authenticated tenant identities may request their catalog. Global/anonymous/blank tenant excluded. Intersect actual frontend registry. Overview and known permitted module routes only. No server entryPath is trusted as a destination.

## 5. Platform decisions

Angular header selector, shared scoped catalog, states/keyboard/RTL Required. API read and retained native launcher Reuse. Web/native CRUD, forms, Grid, Cards, Tree, Detail, Chart, Report, Import, Export, offline writes Excluded for this child; launcher remains existing owner. Education Required after Phase06 Verified.

## 6. Contracts

Existing GET /api/v1/modules/accessible with exact API Cookie credentials, strict parser and timeout. [Authorize] plus current UserId/TenantId and module entitlement policy; no invented Resource:Action grant or caller scope. Browser-only navigation changes no trusted company/year.

## 7. Composition

Implemented: one ModuleCatalogState in AuthenticatedApplication component providers shared by header and page; remove page-local provider. Existing createScopedRead owns cancellation/masking. The app composition component disposes catalog/navigation/fiscal state on public navigation/logout rather than relying on a retained route injector; null readIdentity also masks/cancels during context transitions. Source30-second freshness on re-entry, no background poll. Shared OptionSelect/ContextBadge/buttons; generic Shell application slot from root composition. User-required PrimeNG-only interactive controls are implemented through shared adapters: Select with module icons/header/checkmark, RadioButton for palettes, pButton actions, Tooltip context help and shared ScrollArea for content/sidebar/drawer. No plain browser select/radio/button workflow UI; guard checks inline and external templates.

## 8. States and transitions

Implemented: loading/error/retry/empty/forbidden/unknown route; no stale options on scope change. Route-derived selection commits after NavigationEnd only. Reject invalid/duplicate/blocked callbacks, pending auth/company/year and active navigation. Navigation false/rejection keeps current value with shared closeable feedback.

## 9. Security and impact

Reuse Platform session readIdentity and exact server catalog. No JavaScript session credentials, storage, BFF, grants or raw PrimeNG controls. Extend generic scoped-read explicit refresh only; test dedupe/error/forbidden/disposal. Existing editable business routes absent; FOLLOW-014 gates future dirty approval.

## 10. Data and API

ModulesController/GetAccessibleModulesQueryHandler and module policy reviewed. API runtime/schema changes Excluded; actual hosted read/navigation/refresh/logout receipt is registered. State/parser tests and source evidence do not certify live grants.

## 11. Verification

Phase06 Verified2026-10-29: Angular109/architecture9/config4 and production build; context24/modules14/company14/fiscal15/shell24/language20 browser cases; Next13/native7; actual hosted catalog/navigation/reload/refresh200/logout204. IMPLEMENTATION_REPORT.md owns commands, scope, warnings and limits. Verified coverage: full Angular check; navigation/state unit tests; real production browser EN/AR/light/dark/390/1440; unknown/denied/global/empty/error/retry/dedupe, company change and pending-navigation proof; actual API smoke; retained native and Next module regressions. Record actual commands/results in IMPLEMENTATION_REPORT.md after running.

## 12. Reuse and rollback

Reuse theme tokens, core translation keys, OptionSelect external commit, ContextBadge, scoped read, authenticated composition and current module registry. Roll back only this Angular child/generic extensions; no data rollback. PROD-017/019 hosted and release gates remain separate.

## 13. Localization and accessibility

Reuse modules.currentApplication/switchApplication/overview/title plus common.loading/error, authorization.forbidden and actions.retry/close in existing en/ar core. CSS logical properties and existing compact badge. Context controls expand for complete desktop text; when viewport or actual toolbar is at most1199px they show icons only, with PrimeNG Tooltip and accessible names. Desktop preferences move into settings below1500px toolbar width to preserve context space. ScrollArea uses shared token colors,7px rounded handles, RTL positioning and reduced-motion support; overlay lists have matching thin themed scrolling. Actual keyboard/focus, wheel, handle drag, resize and no-overflow proof required. No new localization key or catalog hash.

## 14. Delivery and gates

G0 one Platform owner and scope passed; G1 server authority/routes/actor/read-only and exclusions frozen; G2 shared identity/freshness/navigation/error model frozen; G3 reviewed Active P-008 and current shared controls, native retained. Remaining G4 only production/provider/release notes PROD-002/017/019 and existing RISK-018; they do not change this read/navigation contract. User explicitly requested execution. Runtime followed the passed initial Phase00 manifest/recipes/check.

## 15. Evidence and closure

Current required-files.json contains existing paths only. Phase06 Verified; Phase07 user education completed afterward and documentation/handoff Closed. Next unit is shared collection preflight only. FOLLOW-012 translation editor, FOLLOW-014 future drafts and FOLLOW-015 other workspace/business screens remain open; this child closes only its application navigation portion.
