# Angular authenticated application shell — implementation report

Exact S2-A1 is Phase 06 **Verified**. Customer handoff and canonical closure follow verification. The frame uses the reviewed current Next geometry and real existing browser session; home content remains actual identity until its separately contracted dashboard.

## Delivered behavior

Generic Shared ApplicationFrame, NavigationList, PopoverPanel, IdentityAvatar, ContextBadge, PageHeader, SurfaceCard and PalettePicker compose through curated public APIs. Shell owns authenticated routing, user/context policy and personal appearance/logout. Desktop sidebar is 64/280px at the 900px breakpoint, header 64/56px, content margins 24/16/12px. The mobile PrimeNG Drawer supports RTL, Escape/focus return, navigation close and resize without a stale backdrop or scroll lock. Normal-user tenant/company values are readonly; global super-admin context is hidden as in Next. Navigation contains real home/preferences actions only.

The shared language OptionSelect is now actual PrimeNG Select (no native select), used by public auth and authenticated preferences. Its scoped root foreground uses currentColor so the selected language matches both colored headers and surface popovers. Options keep the global semantic selected colors. Five canonical palettes, light/dark and language preferences survive reload. Existing SQL-backed translations are read through the existing scope owner. No session or license material is logged or placed in browser storage.

## Verification

Phase 06 Verified on 2026-10-29: Angular full check 14 files/59 tests and 6 architecture cases; strict templates/types, tokens/fonts/catalog and production build pass (427.54 kB initial / 114.90 kB transfer). Production artifact shell matrix passes 24 cases (two roles, EN/AR, light/dark, 390/900/1440). PrimeNG language selector passes 20 palette/mode/language cases including selected-row contrast >=4.5, closed foreground, keyboard selection/Escape/focus. Login browser acceptance passes 11 scenarios including 8 current Next visual pairs within 1px, real API/SQL login/reload/settings logout with Secure HttpOnly cookies, and scoped localization. Retained Mobile auth regression passes 2 tests. Actual Next desktop frame measures 64/280 sidebar and x=281,width=1159 expanded header at 1440; Angular matches. No API/native/schema or business-dashboard parity claim. Full historical API gate remains its own R2 evidence; hosted checks and FOLLOW-012/014/015 remain open.

Reproduce with npm --prefix web-angular run check, verify:shell-browser, verify:language-browser, and node web-angular/scripts/verify-login-browser.mjs --compare-next --live. The shell/language scripts use explicitly synthetic intercepted API responses. Only --live exercises existing Identity/SQL. ANGULAR_PREVIEW_ORIGIN=https://localhost:4220 selects the separately served production artifact. Local redacted receipts/screenshots are under .codex-tmp/angular-shell and .codex-tmp/login-parity. No key or raw response is included.

## Resolved findings and primary documentation

A partial theme omitted mask.transitionDuration. PrimeNG's leave animation could not finish, leaving its backdrop/scroll lock after drawer dismissal. The semantic token now comes from the canonical motion duration; no DOM deletion or library patch is used. See [PrimeNG animations](https://primeng.dev/guides/animations) and [theming](https://primeng.dev/theming), checked against installed 22.1.4/PrimeUIX source.

The first language adapter inherited a custom-property value at the label rather than the actual header foreground. Scoped currentColor fixes that inheritance boundary. All twenty palette/mode/language combinations verify computed foreground and selected-option contrast. Controlled options and keyboard behavior follow [PrimeNG Select](https://primeng.dev/select).

The popover trigger query uses the documented locator/read type parameters from [Angular viewChild](https://angular.dev/api/core/viewChild). Focus/dismissal follow [PrimeNG Popover](https://primeng.dev/popover) and [Drawer](https://primeng.dev/drawer). A stale local development process served old code; restarting only the verified Angular process with the documented [CLI polling option](https://angular.dev/cli/serve) restored live source updates.

## Scope, limits and rollback

FOLLOW-015 owns module launcher/navigation, role-specific dashboards, context transitions and other remaining workspace surfaces. FOLLOW-012 owns translation editing/persistence acceptance; FOLLOW-014 owns remaining business form controls. PROD-002/017/019 and RISK-018 retain hosted/provider scope. No new domain data means the create/edit/view/list/mock audit is N/A on both retained platforms. No API/schema migration is needed for this client-only frame; API and native source are retained. Focused passes do not replace unrelated full repository/release gates. Rollback is limited to the Angular client composition and theme adapters.
