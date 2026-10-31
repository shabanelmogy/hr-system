# Angular template: shared components and PrimeNG MCP

Requester decision, 2026-10-30: recurring UI belongs in shared components so feature
work concentrates on business data, permissions, validation rules and callbacks.
This is a mandatory implementation rule for the reusable ERP template.

## Implementation order

1. Find the target application's existing shared component and reviewed reference.
2. Consult PrimeNG MCP for the installed version's component API, templates and
   relevant examples before changing runtime code. Read only the relevant guide
   for theming or Pass Through.
3. Prefer built-in properties and composition. If a documented capability covers
   the requirement, use it instead of writing another implementation.
4. Extend the existing shared component generically for a demonstrated gap. Keep
   entity names, endpoints, permissions and business transitions in the feature.
5. Validate final PrimeNG usage with MCP, then run Angular checks and browser
   verification. Record metadata limitations separately from actual code defects.
6. Verify EN/AR, RTL, small/wide viewports, light/dark themes, keyboard, focus,
   loading/empty/error states and the reference's real interaction contract.

## Configure another workstation

Run from `web-angular` with a supported Node version and the Codex CLI installed:

```powershell
pnpm dlx @primeui/cli plugin install --tool codex --library primeng
pnpm dlx @primeui/cli doctor --tool codex --library primeng --json
```

Use `--tool copilot` only for GitHub Copilot. Installing the plugin adds the
PrimeNG skills and MCP configuration; it does not add application dependencies.
Do not also register a second manual PrimeNG MCP server.

The verified local installation is `primeng@primeui` 1.0.0. The doctor passed
project/source/plugin/payload/package/duplicate checks, stdio startup, the exact
eight-tool contract, Button documentation and positive/negative validation.
Codex initially reported skill/MCP host discovery as unsupported in its summary;
the physical inventory and live server checks passed. Native PrimeNG chat tools
became available during the D23 correction and were used for component docs and
final usage validation. A running chat may not expose newly installed tools
immediately. In that case, an explicitly identified direct
stdio client can call the same official MCP server; do not claim native chat-tool
availability. Never duplicate the server registration to force discovery.

## Current shared Grid application

- `MyDataGrid` owns native `p-column-filter`, typed conditions, remote owner
  callbacks and generic table presentation. Features never copy the table shell.
- Filter actions use native `filterButtonProps`; button-bar spacing uses the
  documented ColumnFilter Pass Through section. No replacement filter menu.
- `CollectionFrame` uses the existing shared `DialogPanel` over PrimeNG Dialog for
  Grid options, native Tabs and SelectButton. Density, visibility, order, logical
  pinning, column search and reset are generic presentation controls. They do not
  fetch or mutate business records.
- Shared collection cards provide responsive internal padding. Individual
  business screens must not patch these spacings locally.
- The collection footer has exactly one native PrimeNG Paginator. Native
  page links, report and rows-per-page options share one component in page mode.
  `recordNavigation=true` selects record mode (Countries Grid/Cards): the same
  native arrows navigate a global record index and show one current-record/total
  indicator. No page links or second report/arrows are rendered in record mode,
  per D24. The existing shared size selector uses native `templateRight`.
  The native navigation unit is one record; server page size remains owned by the
  collection controller, including active/focus/cross-page behavior. Never override the native paginator root's
  flex display with block: that breaks its intrinsic sizing and wraps its controls.
- `InputText` does not expose `showClear`. Its current documentation describes
  composing IconField/InputIcon. Existing shared text/numeric/date fields retain
  their validated CVA, exact numeric text/date-only contracts, counters, reveal
  controls and keyboard behavior. Their action uses PrimeNG Button `iconOnly`
  and the same built-in Times icon used by PrimeNG; no textual multiplication
  glyph or new clear-button component. Native button alignment replaces the old
  conflicting CSS Grid alignment. InputNumber/DatePicker expose `showClear` for
  consumers that actually use those native input components.

MCP accepted the Button and Table usages, native Tabs and the shared Dialog.
SelectButton metadata rejects Angular's `ngModelOptions` directive input; this is
an identified validation limitation. Preserve the correct Angular standalone
forms binding and verify it through TypeScript, Angular compilation and browser
behavior. Do not label that SelectButton result as a complete MCP pass.

## Authoritative sources

- [PrimeNG Plugin](https://primeng.dev/plugin)
- [PrimeNG MCP](https://primeng.dev/mcp)
- [Pass Through](https://primeng.dev/passthrough)
- [InputText](https://primeng.dev/inputtext), [InputNumber](https://primeng.dev/inputnumber),
  [DatePicker](https://primeng.dev/datepicker), [Button](https://primeng.dev/button)
- [Table](https://primeng.dev/table), [Dialog](https://primeng.dev/dialog),
  [Tabs](https://primeng.dev/tabs), [SelectButton](https://primeng.dev/selectbutton)
- MCP resources: `primeui://primeng/guides/passthrough.md` and
  `primeui://primeng/components/{inputtext,inputnumber,datepicker,button,table,dialog,tabs,selectbutton}.md`.
