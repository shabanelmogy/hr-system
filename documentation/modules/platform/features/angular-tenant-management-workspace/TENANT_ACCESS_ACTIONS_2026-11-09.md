# Tenant access actions — 2026-11-09

## Authorized scope

Existing-feature maintenance in web-angular Tenant Management under
web-angular-migration / S4-A1. User requested an activate/deactivate action in the
Tenant Grid. Reuse MyDataGrid/RowActions and the existing Tenant update API;
apply the same callback in Cards. No new lifecycle, API permission or schema.

## Implementation

- Actions use the current row `isActive`: deactivate enabled tenants; activate disabled tenants.
- Shared ConfirmationDialog, DialogPanel and FeedbackState own confirmation/error UI; existing FeedbackNotifications/NotificationToast owns success without taking collection height; canonical EN/AR resources feed the existing generator.
- TenantAccessState owns live actor/read-only checks, current-page row identity, one pending operation, cancellation and fresh-detail acceptance.
- Preserve all profile/subscription/contact/capacity fields, including exact timestamps and nullable end date. Existing `entitlements: null` preserves persisted grants without catalog replacement.
- Existing service sends CSRF-protected PUT with fresh rowVersion; no HTTP in UI.
- Already-applied target does not write again. Concurrency/uncertain/denied outcomes cannot auto-replay; closing refreshes current server criteria.
- Global system Super Admin access remains independent of the Tenant enabled flag.
- API business endpoints/domain/database unchanged; migration N/A. The canonical embedded API Web localization catalog and both Web version artifacts are regenerated; coordinated publication is PROD-019. Next workflow unchanged; native/mobile shortcut and mock generator remain Excluded in this slice.
- PrimeNG MCP metadata was unavailable in the enabled tools; no MCP validation is claimed. Existing shared controls were reused without modification.

## Verification

Final Angular check passes format, typed/template lint, 33 architecture checks, types, catalog/tokens/fonts/configuration, 1038 tests in 198 files and production build. All 20 production-fixture browser cases pass EN/AR, Light/Dark at320x720,390x844,900x640,1440x1050 and844x390. Each case cancels without a write, toggles both targets in Grid/Cards, preserves page2, then preserves search after another write; desktop cases include expanded/collapsed navigation. API restore/build pass with0errors and78 existing analyzer warnings; the serialized complete API solution test run passes1363 with0failed and3 existing opt-in browser skips. All7 catalog policy tests and canonical catalog check pass. Earlier focused Tenant verification passed55tests/9files; the final full Angular run includes the updated Tenant tests. Phase06 decision: Verified for this bounded Angular access-action and generated catalog maintenance. No hosted acceptance is claimed.

## Existing repository and release boundaries

The complete documentation check is already blocked by the missing Reporting
fingerprint-angular-check.log evidence (FOLLOW-033). Scoped Tenant generation/check passes all8 recipes; planning passes with its2 inherited unrelated contract warnings. Existing Angular bundle/style warnings are tracked in FOLLOW-019.
No hosted Tenant is changed by fixture-browser tests and no deployment is claimed.

## Verification repairs and primary references

The browser harness handles the shared Grid's responsive action menu and encoded
collection row identities, scopes Cancel to dialog actions, and waits for the
selected Grid/Cards host before choosing its action locator. It uses locator
assertions/automatic actionability waits rather than immediate visibility checks
or forced clicks. Reference: [Playwright locator visibility](https://playwright.dev/docs/api/class-locator#locator-is-visible)
and [automatic waiting](https://playwright.dev/docs/actionability).

The landscape844x390 run found that an inline success strip reduced the Grid body
to a header-only viewport. The feature now reuses the existing application success
Toast, which presents an overlay and preserves collection height. This does not
modify or fork the shared Grid. Reference: [PrimeNG22.1.4 Toast](https://primeng.org/toast).


