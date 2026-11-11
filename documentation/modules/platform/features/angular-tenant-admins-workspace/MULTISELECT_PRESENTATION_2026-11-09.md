# Shared Tenant multi-selection presentation — 2026-11-09

## Scope and evidence

The requester identified the Tenant membership picker in Add administrator and
supplied a screenshot with crowded option rows and a search icon outside its
input. This is a corrective Angular presentation change to the existing shared
`MultiReferenceField`. No domain, API, database schema, permission, membership
validation or default-Tenant rule changes. Migration and the domain-change
Web/Mobile UI audit are not applicable. New Next/Mobile implementation is Excluded
from this Angular-only correction.

## Implementation

- Keep installed Angular 22.2.3 / PrimeNG 22.1.4 and the existing Signal Forms /
  bounded Reactive Forms adapter.
- Keep PrimeNG's chip display, filtering, select-all, keyboard navigation and
  remove actions. Set `maxSelectedLabels` to `null` so four or more selected
  memberships remain visible as individual badges.
- Shared PT root/overlay classes scope the external vendor Sass partial. Badges
  wrap within the available width, preserve long names, use semantic theme colors
  and keep their remove action reachable. Coarse-pointer remove targets are 44px.
- Complete central `formField.paddingX/paddingY/fontSize/fontWeight` tokens. The
  installed IconField CSS uses `form.field.padding.x` for the icon inset and the
  input's reserved icon space; the previous sparse preset omitted that token.
- Complete MultiSelect list/header/option tokens: padded search header, 10px
  checkbox/text gap, readable 40px minimum rows and highlighted selected options.
  Keep list scrolling in the existing vendor viewport.
- Reuse `general.search` in EN/AR for search placeholder and accessible label.
  Forward the shared public placeholder input to the vendor control.
- Cancel native Enter submission when a selection/removal emits a keyboard
  change. PrimeNG Chip handles Enter but does not cancel its native default.

## Documentation basis and MCP boundary

No callable PrimeNG MCP tool is exposed in this session. MCP validation is not
claimed for this correction. The installed component declarations, templates and
styles were inspected and checked against the official documentation:

- [MultiSelect chip display, filtering and keyboard contracts](https://primeng.dev/multiselect)
- [Styled mode token architecture](https://primeng.dev/theming)
- [IconField composition](https://primeng.dev/iconfield)

The scoped Sass handles badge wrapping, long labels, touch targets and the
header divider; documented preset tokens own option spacing, colors and shape.

## Verification

Focused `MultiReferenceField` unit verification: 8 passing tests, including
`renders every selected label as a badge beyond the vendor three-label default`
and `removes only the activated badge from the signal form and keeps readonly
badges visible`. The latter checks Enter default cancellation and exact model
preservation. Existing tests retain unavailable IDs, readonly/disabled guards,
server feedback and actual combobox focus/ARIA.

`scripts/verify-multi-reference-browser.mjs` uses the built production application
and intercepted fixture API responses. It checks the actual administrator form,
search icon geometry, option row padding/gap, filtering, four visible badges,
keyboard removal, selection consistency and absence of native form submission.
All business writes are intercepted and forbidden.

### Final executed results

- `npm run check`: passed. Format, typed/template lint, 4 configuration tests,
  token/font/catalog checks, 33 architecture/dependency tests, strict application
  and test types, 198 test files / 1,046 tests, and production build passed.
- Focused shared-field run: 8 tests passed.
- Production-build browser fixture: 16 cases passed across EN/AR, Light/Dark,
  390×844, 900×640, 1440×900 and 844×390. Each case checks icon containment,
  option geometry, search, four badges, keyboard removal and exact remaining
  selections. Native submit count and business writes remain zero.
- Complete documentation check: 540 recipes passed after regeneration of this
  feature's affected phase packets. Planning check passed with its existing
  education-module / erp-platform-template contract-migration warnings.
- Existing initial-bundle and collection/header component stylesheet size
  warnings remain warnings; no budget was relaxed.
- Earlier in this run, a new test incorrectly called `click()` on an SVG remove
  icon; it was corrected to dispatch its actual keyboard interaction. One
  collection-footer assertion failed in an earlier full run and passed both its
  independent rerun and the final full suite. A concurrent collection-frame
  type-import lint failure also cleared before the final full gate. These earlier
  failures are retained in scratch logs and are not counted as final passes.

Executed logs, the 16-case JSON and representative rendered screenshots are under
[`verification/multiselect-2026-11-09/`](verification/multiselect-2026-11-09/).
These are fixture browser results; no hosted account mutation, deployment,
native-device or new domain acceptance is claimed.
