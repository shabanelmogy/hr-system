# Shared Import layout and collection follow-ups — 2026-11-08

## 1. Authorized scope

Requester-authorized existing UI corrections FOLLOW-028/029/030, then requested
Import commands in the main title card, smaller controls and all five status
cards in one row. This supersedes the vertical/4rem compact rail in the dated
2026-11-05 contract. No business rule, API endpoint, schema, native or Next runtime
workflow changes are included. One bilingual short caption is added to the owned
core catalog and regenerated through the existing catalog generators.

## 2. Shared ownership and composition

- SpreadsheetImportPanel exposes externalActions/actionsTemplate. Standalone
  consumers retain local commands; embedded consumers project the same live
  template into PageHeader. No duplicate file input or submission state exists.
- Countries, States and Districts all use this composition. Commands disappear
  with the owning view or permission; busy/disabled/uncertain fences stay in the
  original owner. External rendering never transfers business ownership.
- PageHeader.actionsLayout='stacked' reuses its existing responsive secondary-row
  layout for longer toolbars. It does not add a feature-local header shell.
- SurfaceCard.headerVisible defaults true; embedded Import suppresses the
  redundant local heading while retaining its named section.
- MetricCard.layout='tile' and optional shortLabel provide compact status tiles.
  The full label remains the accessible name/title. Numbers use tabular figures.
- Shared Import summary always has five equal columns, a 4px gap and a subtle
  bottom divider. Tiles are at least 56px high with 18px values; narrow labels are
  10px. Needs verification uses localized Verify/تحقق, with the full accessible
  label retained. No independent summary scroll or character-per-line caption.
- Shared commands use 12px text, 16px icons and 32px fine-pointer controls. Devices
  with any coarse pointer retain 44px action targets. Collection header icons also
  keep 44px targets; fine-pointer compact sizing remains unchanged.
- Import data area preserves a 180px minimum preview inside a 16rem minimum region.
  The bounded workspace scrolls in short windows; the outer page does not scroll.
  Requirements and the grid footer remain reachable. Preview paging stays shared.
- List counts are explicitly null in Report/Import in all three geography pages
  and Report in System Error Logs. These counts cannot describe independent data.

## 3. Review and implementation evidence

Fresh PrimeNG MCP Button/FileUpload metadata and styled guide were consulted.
The visible Choose file trigger is shared ActionButton, using FileUpload's
header template chooseCallback in unstyled advanced mode. Documented Pass Through
root/input/content sections remove the extra wrapper/native input presentation.
The internal file input and custom local selection remain owned by FileUpload;
shared application CSS owns layout. [PrimeNG FileUpload](https://primeng.dev/fileupload)
is the primary API/template reference. MCP metadata is not rendered-browser proof.
The current Web Interface Guidelines were reviewed. Primary layout references:
[container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_size_and_style_queries),
[flex shrinking](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/flex-shrink)
and [minimum block size](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/min-block-size).

## 4. Executed verification

Verified on 2026-11-08 against the final source. Current receipts are in
[verification/shared-layout-2026-11-08](verification/shared-layout-2026-11-08).

- Full `npm run check`: format, typed/template lint, 4 configuration tests,
 32 architecture/dependency tests, ownership/catalog/tokens/fonts checks,
 app/spec type-check, 196 test files/1002 tests and production build passed.
- Import layout: 48 EN/AR × Light/Dark cases across 320×720, 390×844, 571×823,
 690×823, 800×823, 900×640, 1012×823, 1440×900 and 844×390. Desktop widths also
 cover navigation open. Every case proves five visible single-row tiles,
 no summary/outer overflow, at least 180px preview, 44px touch header commands,
 requirements/footer reachability, four projected commands, a hidden internal
 file input, no redundant local heading, and no unrelated list-count badge.
- Failure/authority: 16 cases cover invalid files/headers/formulas/limits, duplicate,
 field, rejected/uncertain/malformed responses, pending guards and permissions.
- Five journeys cover file replacement/cancel, view-discard/cancel, permission
 revocation (also while pending) and keyboard page-size/paging. The actual shared
 Choose file button opens FileUpload's native chooser; the hidden input is not
 populated by bypassing that command. Projected commands withdraw on view/authority loss.
- Report header: 20 EN/AR × Light/Dark layouts at 320, 690, 844-landscape, 1012 and 1440
 retain independent criteria, document reachability and no unrelated list count.
 This report run predates the final FileUpload-only refinement; Report/header code
 did not change afterward. The final full Angular gate covers the integrated source.
- PrimeNG metadata validates the final advanced/unstyled custom-header and named
 Pass Through usage with zero issues. This is distinct from the browser checks.
- Catalog generation check passes: 21 sources/7522 keys. No dependency installation.

Earlier runs overlapping browser/build work hit 5000ms unit-test timeouts; a final
complete run after those jobs ended passes without changing tests/timeouts.
Browser fixtures intercept API requests and serve an actual development build;
no real bulk writes or hosted Crystal renders occur. Current rendered acceptance
is Countries plus shared owners; States/Districts consume those same owners and
pass source/full Angular checks, without a new claim of their full live import journeys.
No physical-device or production acceptance is implied. Existing catalog deployment
follow-up PROD-019 remains separate.

## 5. Quality-budget follow-up

The production build succeeds within unchanged error limits. Warning budgets
remain exceeded: initial 585.51kB/500kB; PageHeader 7.05kB, CollectionFrame 6.17kB and
collection-search 4.24kB against 4kB style warnings. Shared header style grew while
reusing stacked layout/coarse-pointer behavior; no budget was raised. These
measurements remain owned by FOLLOW-019. They do not close bundle optimization.

FOLLOW-028/029/030 are closed with the source/browser evidence above. Reopen their
central entries if a new consumer violates the shared rules.
