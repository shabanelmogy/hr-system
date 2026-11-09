# Districts compact Status placement — 2026-11-08

## Authorized scope and current contract

The requester moves Status (Active/Archived/All) beside Contains/the search
operator on small Districts screens only. The existing CollectionFrame owns the
presentation via one opt-in `data-collection-search-companion` attribute on the
existing projected OptionSelect. Both Grid and Cards consume the same criteria.
There is no duplicate control, viewport listener, new dependency or feature CSS.

- Through 34rem of available collection width, field/operator/Status can share a
  row, followed by the full-width query and paired remaining filters.
- Through 28rem, the field selector gets its own row. Operator and Status still
  share the next row, retaining readable values rather than squeezing three
  selects. The query remains full-width below them.
- Above 34rem, the default two logical rows remain: search first, criteria/actions
  second. Other consumers do not opt in automatically.
- Existing 44px controls, compact placeholder font, label associations, RTL and
  native control behavior are retained. CSS placement does not change DOM focus
  order; no positive tabindex or duplicate responsive inputs are introduced.

This is a bounded Angular presentation change. API contracts, query/state
ownership, permissions and report criteria are unchanged. Next/mobile workflows
are outside this authorized change; no database/domain modification is involved.

## Verification and evidence

The browser regression fails against the preceding built application because
Status is below the query instead of beside the operator at 390px. The final
actual development build passes 128 Districts layout measurements across EN/AR,
Light/Dark, Grid/Cards, 320/390/555/571/676/690/800/900/1012/1332/1440px widths and
844x390 landscape, including navigation open/closed at desktop widths. Assertions
cover companion/operator alignment, unclipped selected values, 44px controls,
full-width filter rows, no overlap/outer horizontal overflow and Chart toolbar
behavior. An additional 32-layout States EN/Light regression preserves its
default layout without opting in. API requests use intercepted fixtures; no
hosted business writes or physical-device acceptance is claimed.

The final [full Angular gate](verification/compact-status-2026-11-08/angular-check.txt)
passes formatting, typed lint, 4 configuration tests, 33 architecture/dependency
tests, strict app/spec type checks, 1003 tests in 196 files and production build.
The [verification receipts](verification/compact-status-2026-11-08) retain actual
browser results, before-fix failure and representative screenshots. Existing
bundle/shared-style budget warnings remain FOLLOW-019; no budgets or test timeouts
were raised. Intermittent composition-test timeouts remain tracked as FOLLOW-031;
this final pass does not establish their root cause.

Current production warnings are initial bundle 585.51kB, PageHeader 7.05kB,
CollectionFrame 6.17kB and collection-search 5.72kB. The last measurement includes
the new shared compact placement rules and supersedes the earlier 4.29kB receipt.
PrimeNG Select generated API validation reports zero issues for the checked
adapter properties; it does not validate custom CSS or browser geometry.

Shared rules: [collection views](../../../../guides/web/architecture/ANGULAR_COLLECTION_VIEWS.md),
[shared components](../../../../guides/web/architecture/ANGULAR_SHARED_COMPONENTS.md),
[responsive layout](../../../../guides/web/architecture/ANGULAR_RESPONSIVE_LAYOUT.md).

Primary implementation references:
[PrimeNG Select](https://primeng.dev/select),
[CSS flex basis](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-basis),
[CSS visual order and accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/order).
