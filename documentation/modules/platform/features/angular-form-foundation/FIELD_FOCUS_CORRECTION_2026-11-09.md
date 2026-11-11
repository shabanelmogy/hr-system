# Shared field focus correction — 2026-11-09

## Authorized corrective scope

The requester reported a cropped Contact name focus border in the Tenant editor
and asked for a shared fix that prevents the same defect elsewhere. This is
maintenance within approved S1-A2 and its existing shared field consumers. There
is no business capability, schema, permission, dependency or form-state change.

## Verified cause and shared ownership

The original compound wrapper used a two-pixel outline with a positive two-pixel
offset. Its focus paint extended four pixels outside the field. The Tenant form's
bounded ScrollViewport legitimately clips overflow at its inline boundary, which
cropped that perimeter. Before-change production browser evidence reproduces the
same Contact name defect at 390px.

`fields/_field-focus.scss` now owns the compound focus rule: the outline is drawn
inside the border box, border width stays fixed, and invalid fields retain the
destructive semantic color. TextField (including multiline, floating, NumericField
and DateField), ReferenceField and BooleanField use this single rule. Input focus
remains visibly represented by its wrapper. Application theme tokens remain the
color authority; no feature-only override or overflow workaround is added.

The installed runtime is Angular22.2.3 / PrimeNG22.1.4. PrimeNG MCP tools were not
available in this session. Official InputText/Textarea guidance and installed
PrimeUI style sources were inspected; no MCP validation is claimed. The reported
gap belongs to the application's compound wrapper, which also contains counters
and actions, rather than the vendor input's own focus support.

## Prevention and verification contract

The code-style guide now requires shared focus ownership and browser acceptance.
`verify-field-focus-browser.mjs` measures painted outlines against clipping
ancestors, asserts keyboard clearing restores input focus with unchanged geometry,
and checks that invalid focus matches the error color. It uses real built Angular
components with intercepted synthetic APIs, with no running server or live writes.
`--controls` exercises the existing Reference, Numeric, Date, multiline/floating
and Boolean harnesses from a development build. Oversized textareas retain normal
vertical scrolling; this does not justify cropping their inline focus perimeter.

Verification receipts, exact commands, screenshots and quality-gate results live
in `verification/field-focus-2026-11-09/`. Failed baseline is retained separately
from current acceptance. Native browser personal-info suggestions are browser UI;
this correction does not modify them or store their content.

## Platform and delivery boundaries

Angular shared presentation is Required and changed. API, Next and Mobile runtime
are unchanged; migration and business create/edit/list/mock audits are N/A because
no domain data contract changed. Deploy only the rebuilt Angular assets for this
correction. Existing hosted/platform release gates remain independently owned.

## Executed acceptance

- Full `npm run check` with `VITEST_MAX_WORKERS=2` exited0: 1039 tests /198 files,
  formatting, zero-warning lint, architecture, strict types/templates and
  production build passed. Four existing bundle/style budget warnings remain;
  initial bundle is585.62kB. No test assertions, timeouts or inclusion changed.
- `Field focus perimeter and keyboard clear passed`: eight production Tenant
  cases, EN/AR × light/dark ×390/1440, including contact, notes, switch,
  invalid-field color and unchanged geometry after keyboard clearing.
- `Shared control focus perimeter passed`: eight development-harness cases with
  the same locale/theme/width matrix. Each exercises Reference, Numeric, Date,
  floating multiline, Checkbox and Switch (48 actual control checks).
- Browser APIs are synthetic/intercepted; there are no live domain writes or
  application-server starts. No page errors were recorded in passing cases.
- Before/after contact screenshots and the failing original clipping assertion
  are retained. Verification checks the complete compound wrapper after bringing
  it into view; this does not change application scrolling.
- Canonical documentation is regenerated and checked through the existing system.

## Sources used

- [PrimeNG InputText](https://primeng.dev/inputtext) and
  [Textarea](https://primeng.dev/textarea): existing vendor controls are retained.
- [MDN outline-offset](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/outline-offset): negative offsets place outlines inside their elements.
- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md): visible focus and compound `focus-within` styling.
- [Playwright scrollIntoViewIfNeeded](https://playwright.dev/docs/api/class-locator#locator-scroll-into-view-if-needed)
  and [HTMLElement focus](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus):
  browser verification brings the complete compound wrapper into view rather than
  only its smaller nested input. No runtime scrolling behavior was changed.
