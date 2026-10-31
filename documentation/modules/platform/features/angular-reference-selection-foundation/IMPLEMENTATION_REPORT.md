# S1-A4 — Shared reference selection foundation

Phase06: **Verified** on2026-10-29 for the exact bounded generic field kit.
No business lookup adapter, Countries/States CRUD, API endpoint/grant/schema or
native UI is implemented here. ROADMAP/RESUME own documentation closure and next step.
Source baseline main a2c56412 plus preceding S1-A3 and this working-tree increment.

## Delivered behavior and ownership

ReferenceField/erp-reference-field is a public shared single-value CVA over actual
PrimeNG Select22.1.4. ReferenceId preserves string versus safe integer, including
numeric0. No synthetic All ID, free text, loose equality or arbitrary object values.
Options carry caller labels/descriptions/disabled state. Optional clear, required
messages, readonly, form disable/enable/reset and programmatic patching are supported.

Shared FormFieldControl now centralizes control observation, touched/errors, server
error clearing on accepted edits, label/help/error metadata and focus. TextField
extends the same lifecycle and retains its DOM/floating/password/clear/IME behavior.
FormContainer discovers the generic field token in DOM order; reference and text
errors join the existing badges/summary and first-invalid focus. Shared field chrome
styles are reused. OptionSelect header/preference/external-commit behavior is preserved.

The caller owns scope/parent generation, API mapping/runtime validation, selected
resolution, permissions/dependency validators, debounce/cancellation, search and
page accumulation. Shared emits search/retry/loadMore, performs no HTTP or local
filtering of a downloaded page. Only ready matching scope+search options are accepted;
stale/disabled/unregistered choices cannot mutate form data or clear server errors.
Load-more rejects exhausted, readonly/disabled or stale-query callbacks.

Selected resolution is independent of current results. An off-page selection stays
visible while searching, as a disabled current-selection row with a typed caption.
Missing/archived references preserve the ID and show owner-supplied availability;
business validity is owner-owned. Another scope cannot supply a caption; Shared does
not silently clear form values on options replacement. The harness explicitly resets
dependent values when its parent changes. No raw-ID fallback fabricates a display label.

Finite static options and remote envelopes share the same single-field contract.
Loading/empty/error/retry/forbidden and search/IME/load-more/long labels/keyboard/focus
are implemented. Open panels close on scope/read-only/disabled/forbidden transitions.
Search Enter does not submit the form; Escape restores focus; normal combo keyboard
selection remains PrimeNG owned. Labels, descriptions, disabled options and live
selection announcements are accessible and bilingual, with a bounded body overlay.

## Verification actually executed

| Check | Result |
| --- | --- |
| Entry |285 recipe baseline;293 registered Phase00 and bounded-entry/planning pass before runtime |
| Angular complete check |29 files/127 unit tests;10 architecture/4 configuration tests; types/catalog/fonts/tokens/build pass |
| Production build |440.64kB initial /116.68kB estimated transfer; existing500kB budget retained |
| Reference browser |40 palette/mode/language/390-1440 cases;8 full form/async/state/IME/keyboard flows |
| Final reference refinement |8 final interaction cases; localized listbox/disabled ARIA, action guards and forbidden masking |
| Existing forms |40 combinations; errors/focus/CVA/reset/patch/server errors/duplicate submit/IME compatibility |
| Login/context/language |10/24/20 deterministic intercepted browser cases pass |
| API localization |40 CompanyLocalization/SystemLocalization tests pass; resource compiled with current generation |
| Catalog policies |7 pass; generator check21 sources/7143 keys |
| Canonical closure |Four books/manifest/recipes and portable evidence regenerated; planning/documentation repeated at closure |

Run npm --prefix web-angular run check; node web-angular/scripts/verify-reference-browser.mjs
and repeat with --focused. Other browser drivers use ANGULAR_PREVIEW_ORIGIN=https://localhost:4220
and ANGULAR_API_ORIGIN=https://shabanhrms.runasp.net. These cases intercept API reads;
the technical reference harness makes zero /api/ requests and uses no native dialogs.
API command: dotnet test api/Modules/Platform/ErpSystem.Modules.Platform.Tests/ErpSystem.Modules.Platform.Tests.csproj
--filter "FullyQualifiedName~CompanyLocalization|FullyQualifiedName~SystemLocalization".
Portable results/captures are in [verification](verification/README.md).

## Findings, documented behavior and regression prevention

- Existing FormContainer queried TextField directly, excluding other field errors.
  Generic field-token discovery and one lifecycle now cover both field types;
  mixed-field unit/browser summary/focus tests prevent this regression.
- Select's host layout requires its flex layout with fluid sizing. A block host
  reduced the label to24px; restoring the documented control layout and measured
  >60% usable label width fixes it. Text/clear controls remain44px minimum and
  whole-page overflow is checked, including long Arabic/English option content.
- Installed Select22 renders disabled visual/data attributes without aria-disabled.
  The public option Pass Through callback now mirrors that state, verified in every
  browser case. Listbox and selected/empty announcements use owning bilingual text;
  the redundant English dropdown icon trigger is hidden from assistive tech.
- Angular signal-to-child bindings are applied by rendering. Unit tests wait for
  fixture.whenStable and browser tests await committed request counters/state before
  assertions, rather than assuming DOM updates immediately after a click. A Select
  in loading state ignores closed-trigger clicks; tests wait for that state to end.

Primary documentation used: [PrimeNG Select](https://primeng.dev/select),
[Pass Through](https://primeng.dev/passthrough),
[Angular ControlValueAccessor](https://angular.dev/api/forms/ControlValueAccessor),
[Angular testing synchronization](https://angular.dev/guide/testing/components-scenarios).

## Source fidelity and explicit adaptations

Reuse the current Angular shared form shell/error badges/chrome and actual PrimeNG
controls; no feature-local form or lookup wrapper was added. Next MySelect's typed
ID/RHF/readonly/error behavior and Native AppSelectField's search/load-more/states
were inspected. The new adapter deliberately uses a Select plus a shared search
field in its panel, without MUI Autocomplete runtime, All=0 or native mobile modal.
Current off-page items are visible but disabled, distinctly labelled as retained.
The dev-only neutral fixture has two independent fields and no business route.
It is excluded from production routes. No rendered States/Countries or native
business journey parity is claimed from this technical fixture.

Countries /lookup is an active-only unpaged array; States /lookup?countryId is
parent-scoped, with separate detail contracts. Do not invent server search/paging,
truncate a full lookup or reshape a management page to fake these endpoints.
Actual States plus another typed owner adapter remain ERP-02/S3 proof. ERP-01
OpenAPI/generator compatibility is the next independently bounded technical proof.

## Translation and external release

Five generic reference captions were added to canonical core EN/AR, including
positional selection announcements. They use the existing schema3/SQL catalog.
Current web fingerprint: b5f21c3a41caf897daa75240d11a69b01a82011a8b913c72f99b592a4c744d8c.
The generated API resource must be published with matching clients before hosted
SQL override acceptance (PROD-019). Strict matching stays enabled. This turn did
not publish the API or verify saving these captions to SQL. Existing persisted
translation Settings acceptance remains FOLLOW-012.

FOLLOW-014 remains open for multiple/date/structured repeaters/dirty dialog controls;
FOLLOW-015 remaining workspace and unchanged development wrapper warning; FOLLOW-016
advanced collection opt-ins. PROD-002/017/019/RISK-018 remain their scoped release
gates. RISK-012 retained Next installed/locked dependency drift is inherited; no
Next runtime or dependency was changed, and its full release gates were not rerun.

## Handoff classification and audit

Feature regressions: none after executed checks. Inherited observations: existing
Node module-format and API analyzer warnings; planning warnings for education-module
and erp-platform-template. Dev navigation also emits NG0912 for unchanged
AuthenticatedApplication/ModuleWorkspace wrapper identities; FOLLOW-015 owns that
cleanup before future wrapper styling/hydration. All24 scoped navigation cases pass.
Environment: retained Next dependency drift RISK-012. Manual release: matching hosted
catalog/SQL override checks and other exact release notes, not a whole-release pass.

Create/Edit/structured View/List business flags/mock-generator audits are N/A on
both Web and Native: no domain property/entity/schema or native surface changed.
Generic typed form selection/display/feedback is verified above; actual business
consumer creation/edit/reload/mock and server authority remain their owning gates.
Database migration/live schema change N/A. ERP-02 generic mechanics and ERP-03
keyboard/error productivity have technical proof; ERP-04..12 business/scale/write/
release journeys are not closed. SIG-02/03/07/08 have scoped lifecycle/feedback/
compatibility/layout evidence; no URL/export, attachment, dirty-draft or real
lookup bootstrap acceptance is inferred. Customer Education N/A technical S1;
technical review/handoff can follow this Verified decision.
