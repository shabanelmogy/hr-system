# Shared Grid row actions — 2026-11-08

## 1. Authorized correction and root cause

The requester reported States Grid actions differing from Countries on compact
screens and explicitly requires shared, mature components so feature work focuses
on business. Existing-feature presentation correction; no new endpoint, business
rule, permission, persistence, native or Next runtime change.

Countries explicitly selected responsive actions, while States, Districts, Tenant
Management and Translation forced inline. MyDataGrid itself defaulted to menu.
This configuration drift, rather than missing PrimeNG behavior, caused divergence.

## 2. Shared contract

MyDataGrid.actionDisplay now defaults to responsive. Remove duplicate feature
configuration and inherit the owning component policy:

- Below 600px of actual Grid content width, use one row menu trigger.
- From 600px, use the existing inline RowActions and measured action column width.
- ResizeObserver observes the native table body; opening navigation can change the
  mode without changing viewport size. No feature media-query or toolbar fork.
- All current authorized commands/labels remain supplied by feature policy. No
  grants or callbacks are invented. Menu/inline invoke the same guarded command.
- If all supplied commands are disabled (or none exist), the menu trigger itself
  is disabled and announces its menu popup type. Avoid an enabled dead trigger.
- Shared explicit menu/inline APIs remain available to the shared implementation
  and tests. Business features must inherit the default; architecture rejects a
  hardcoded inline Grid override. A genuine domain exception needs a reviewed
  shared contract/guard change, never a local responsive patch.

Countries, States, Districts, Tenant Management and Translation inherit this
policy. Other existing MyDataGrid consumers inherit responsive presentation by
default; their business authority remains unchanged. Cards keep their existing
footer actions. This does not claim all shared application components are fully
mature; only this presentation contract and its acceptance are in scope.

## 3. Reuse discipline for future features

Shared owns typography, density, themes, breakpoints, action presentation, keyboard,
focus, disabled/loading/empty feedback, scrolling and paging. Feature composition
supplies typed data, columns, grants, parent relationships and callbacks. Build
recurring behavior once in its existing shared owner and cover it there. Do not
copy a previous feature's presentation settings as a new independent default.

## 4. Verification

Verified 2026-11-08. [Canonical receipts](verification/shared-grid-actions-2026-11-08).

- Full `npm run check` passes: format, typed/template lint, 4 configuration tests,
 33 architecture/dependency tests, catalog/tokens/fonts, app/spec types,
 196 test files/ 1002 tests and production build. The Grid regression also verifies
 an all-disabled menu trigger and no disabled command dispatch.
- Eight States/Districts browser contexts (EN/AR × Light/Dark ×2 features), with
 72 actual-width measurements across 390/ 590/ 690/ 900/ 1012/ 1440px. Navigation open
 and closed is checked at desktop widths. Both menu/inline modes occur, no page
 horizontal overflow, and View opens/closes the correct detail dialog in either mode.
- Twelve Translation cases at 390×844, 900×640 and 1440×844, EN/AR and Light/Dark,
 cover server paging/search, edit/reset, validation, conflict, failure/retry,
 permission/read-only handling and canonical navigation. No outer overflow.
- The responsive browser helper waits for finite navigation transitions and
 samples content width and action mode coherently. Earlier test failures sampled
 the transition or assumed exactly three authorized commands; those were harness
 assumptions, not reasons to weaken feature permissions or change the breakpoint.
- Browser fixtures serve an actual development build and intercept the API;
 no production writes occur. Fresh focused browser acceptance covers States,
 Districts and Translation. Tenant/Countries source composition and all other
 consumers pass the full Angular gate; no fresh whole-application browser claim.
- PrimeNG Table metadata/focused usage validation reports zero issues. This is
 separate from browser/CSS/authority acceptance.
- Error budgets remain unchanged. Existing warnings remain initial 585.51kB,
 PageHeader 7.05kB, CollectionFrame 6.17kB and search 4.24kB (FOLLOW-019).
 No API/schema/Next/native behavior changed and none is newly certified here.

Primary references: [PrimeNG Table](https://primeng.dev/table),
[Angular input defaults](https://angular.dev/guide/components/inputs),
[ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
