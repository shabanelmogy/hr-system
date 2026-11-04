# D37 Angular Clean Code maintenance — 2026-10-31

Scope: all hand-authored Angular source/scripts plus external component resources;
no business/API/schema/Next/native changes. Canonical policy:
`documentation/guides/web/architecture/ANGULAR_CODE_STYLE.md`.

## Implemented

- Separated92 inline templates and50 inline style blocks across83 source files,
  including shared UI, shell/platform, business/dev and test-host components.
  CountryEditor had already been separated during the same readability request;
  its HTML is also registered in the owning evidence manifests.
- Existing resources remain colocated. Components without styles have no empty
  stylesheet. Existing styleUrls precede the extracted formerly-inline styles,
  preserving Angular's original stylesheet cascade order.
- Root AGENTS.md and D37 encode external resources, focused typed responsibilities,
  shared-first composition and readable source. CLI defaults generate external
  resources. Prettier/editor settings and the full check enforce formatting.
- Architecture AST check rejects inline Angular component resources, including
  aliases/namespaces/test hosts. External production templates retain shared
  form/control boundaries. Fixture-only HTML remains allowed to exercise native
  test inputs, without granting production exceptions.

`component-resources.json` records the actual source/resource mapping without
copying source content. Required-file manifests include actual extracted resources
for each registered owning TS source; generated packets are regenerated.

Requester subsequently authorized the per-component-folder continuation.78component
files and their colocated resources/tests (261files total) move into matching
folders. Two component files were already correctly organized (root App and Icon).
`component-folders.json` records the final source paths; the earlier extraction
mapping is historical pre-folder evidence. Shared Sass partials remain single
sources and imports are updated. Curated public APIs keep the same exported
symbols and lazy routes keep their boundaries. CLI flat:false and an additional
architecture case enforce the policy.

The remaining four secondary development components were subsequently split into
their own matching folders. Their shared UnsavedFixtureState remains one service
file. Final inventory84component files with zero flat application components;
one application component per implementation file is enforced as well. The
supplemental class audit confirms the four component classes and fixture-state
class retain their AST except resource paths/formatting. See
`dev-component-folders.json` and `dev-component-audit.json` for that bounded check.

The first folder type-check caught explicit .ts suffixes accidentally added to
dotted module names and a missed import-type expression. These were corrected
using documented TypeScript module syntax, without loosening compiler settings.
The supplemental278file AST/content audit found no non-path changes; it ignores
module/resource paths and formatting and is not a substitute for compilation.

## Verification and limits

The first full post-extraction attempt found2 text-whitespace regressions in
TextField label/counter assertions (462/464 passed). Following Angular's documented
whitespace behavior and Prettier guidance, text nodes are explicitly grouped in
inline spans. Existing expected values remain unchanged; all79files/464tests then
passed. No formatter-only or AST-only claim of complete Clean Code is made.

Full final check/build, current browser receipts and documentation gates are
recorded below after completion. Use `VITEST_MAX_WORKERS=2` for the full suite on
this workstation; it runs all tests, without skips or relaxed timeouts. An earlier
default7worker attempt failed to start one fork under concurrent load; it is not
counted as a passing suite.

PrimeNG MCP get_component(table) was consulted before shared-resource extraction;
it supplies documentation/metadata rather than Angular compiler or browser proof.
No control API was replaced. The installed Angular checks and actual browser
journeys supply implementation evidence.

S3-A8 full pilot remains Not Verified. Hosted read/security/realtime worked in the
read-only actual API receipt, but report catalog503 is tracked under PROD-028.
Development-server timing is not a hosted performance benchmark. Full live render,
missed-event/job delivery and release gates are not established by this maintenance.

## Final folder verification

Full final post-folder check passes79files/464unit tests,4configuration and19architecture cases, application/spec types, Angular templates, catalogs/tokens/fonts and production build. Unchanged initial500kB warning/1MB error budgets pass:496.26kB initial with no budget warning. Exact transfer measurement is in CLEAN_CODE_FULL_CHECK.txt. CLI dry-run confirms a matching component directory and external resources; no proof component was written. Static inventory records84component files, all already organized, and zero remaining move/import/Sass corrections.

Post-folder Countries focused read8 and global scroll4 cases pass (EN/AR,390/1440; Countries also light/dark). Compact Arabic Grid and wide Arabic Cards screenshots were visually inspected. A previous actions run overlapped dev-server reloads while preview components were being split and lost its confirmation dialog; it is retained as a failed/interrupted run, not a pass. Stable-server action and final dev-preview journeys are recorded separately below. Initial attempts without agent server4220 failed to connect; user4210 was preserved.

### Stable browser completion

44 bounded Chrome cases pass: Countries read8, Countries actions8 (all mutations intercepted), shared scroll4, scoped read8, URL/history/criteria8 and unsaved route-navigation8. Coverage includes EN/AR,390/1440 and light/dark where the harness matrix applies. The final dev-preview journeys verify the separately loaded child components and retained fixture-state lifetime. See component-folder-browser-results.json. Countries read/scroll completed after the main folder move; dev-preview and stable action journeys completed after the final secondary-component split. No source edits occurred during the stable final runs. The full40palette visual matrix, hosted Crystal rendering and complete S3-A8 acceptance remain outside these bounded passes.
