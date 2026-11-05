# Angular Signal Forms: lightweight shared architecture

Decision: Option B, requester-approved 2026-11-04 under migration D07/D39.
Applies to Angular 22.2.3 / PrimeNG 22.1.4 in `web-angular`.

## 1. Ownership

| Owner | Responsibilities |
| --- | --- |
| Angular Signal Forms | Typed model/FieldTree, schema dependencies, nested objects/arrays, conditional/cross-field validation, metadata, touched/dirty/errors and native submission lifecycle |
| Feature | Business schema, API DTO conversion, permissions/context, actual async operation, success event, conflict/uncertain-write handling and draft lifetime |
| Shared UI | PrimeNG controls, label/help/error presentation, noValidate, error summary/focus, layout and exact-value adapters |
| Shared helpers | Exact decimal/date-only schema rules and API-path-to-native-error translation |

There is no central form configuration format, JSON renderer, validation interpreter,
field dependency graph, generic CRUD state class or new dependency. Features compose
typed Angular templates and existing shared controls directly.

## 2. Typical CRUD composition

The implemented reference is Countries:

- Schema/model: `web-angular/src/app/modules/reference-data/geographical-information/countries/validation/country-mutation.ts`.
- Submission/context/draft owner: `.../countries/state/country-editor-state.ts`.
- Shared composition: `.../countries/components/country-editor.ts`.
- Readonly details: `.../countries/components/country-read-details.ts`.

The essential owner pattern is:

```ts
readonly form = createCountryForm({
  submission: {
    ignoreValidators: 'none',
    action: () => this.persist(),
  },
});
```

```html
<erp-form [form]="state.form" [title]="title()" [submitLabel]="saveLabel()"
  [pending]="state.pending()" [readOnly]="state.uncertain()">
  <erp-text-field [formField]="state.form.nameAr" [label]="nameArLabel()"
    [messages]="messages()" />
  <erp-text-field [formField]="state.form.nameEn" [label]="nameEnLabel()"
    [messages]="messages()" />
</erp-form>
```

Labels/messages come from the existing en/ar namespace. The actual editor also
composes all approved code fields and existing dialog/unsaved-change controls.
The schema supplies required/maxLength metadata; do not duplicate reserved
`required`, `disabled`, `readonly`, `min`, `max`, or `value` bindings on a native
`[formField]` host.

The action awaits the real service operation. Capture the immutable model value
before the request, recheck context/permissions, then return backend field errors
through `mapServerFieldErrors(this.form, failure.fieldErrors, submitted)`.
The current Countries owner also cancels on invalidation/destruction and fences
late results by editor context and draft revision. Preserve those guards when
adapting the pattern; a shared form cannot decide domain authority or recovery.

## 3. Submission and API errors

- Configure one native action and let FormContainer call Angular `submit(form)`.
  Do not emit a void UI event and end the native submission before the API finishes.
- Use `ignoreValidators: 'none'`: pending validators block dispatch. This does
  **not** wait for pending validation or automatically replay the submission;
  submit again after validation resolves. Features needing an automatic wait
  must first define cancellation/edit semantics for that actual workflow.
- Native submitting state covers the awaited operation and blocks duplicates.
  Save remains available while invalid so the user receives actionable errors.
- Return native validation errors for real field/form rejection. Angular clears
  submission errors on value edits. Never rebuild that clearing lifecycle with a
  signal/effect error store.
- `mapServerFieldErrors` supports exact dot/bracket paths. Unknown/prototype paths
  remain visible at the root instead of becoming arbitrary property access.
  Edited fields and changed array membership/order reject late field mappings.
  Keep submitted array references: do not deep-clone the snapshot before mapping.
- API services/classifiers remain the boundary for exposing safe owned messages.
  The mapper does not authorize displaying raw server details or invent field
  ownership. Existing command-failure filtering remains in force.
- General transport failures use owner feedback/modal; returning a permanent root
  validation error would block unchanged retry. Uncertain writes remain explicitly
  locked until the existing close/review workflow; never automatically resend.
- A true native submit result means validation/action completed without returned
  validation errors. It does not prove a business write succeeded. Observe the
  owner's success event/result for persistence, refresh and dialog closure.

## 4. Controls and structured forms

Shared controls implement native FormValueControl: model value, state/error inputs,
touch output and focus/reset hooks. Retained CVA support is compatibility for old
technical fixtures. Registering a CVA on native FormField's compatibility NgControl
would select the wrong adapter path and lose native focus/metadata/reset.

Numeric values remain exact strings. `validateNumericText(path, options)` validates
without binary Number conversion. Date-only values remain invariant strings;
`validateDateOnly(path, bounds)` validates without treating days as instants.
Their MIN/MAX metadata updates the control/calendar from the same schema bounds.
Reference absence remains null, matching the existing reference contract.

Use native `applyEach`, typed child trees, `hidden`/`readonly`/`disabled`, and
`validate`/`valueOf` for structured forms. Render repeaters with feature-owned
add/remove/reorder actions and stable identity when a real business owner requires
them. Shared controls do not interpret business dependencies.

FormContainer can focus native bindings inside child components. Provide translated
self-contained validation messages for those fields: its parent content query
cannot inspect the child view's labels. The fallback summary uses the form title
and the native message; internal generated field names are not exposed to users.

## 5. Explicit compatibility boundary

Existing technical form/close/unsaved/reference fixtures and internal vendor
FormControls retain Reactive Forms coverage. They do not prescribe new feature
forms. Numeric/date/boolean technical previews now exercise native Signal Forms.
No feature mirrors its authoritative FieldTree into a FormGroup.

Shared translations depend on UI_LOCALIZATION. Platform provides the existing
runtime with useExisting; SQL/catalog/context rules stay with Platform. Static
architecture checks enforce owner public APIs, resolved aliases, external template
policy and eager value cycles. Type-only and dynamic edges are treated separately.

## 6. When to revisit the decision

Revisit a full engine only for a verified owner requirement such as persisted,
versioned forms authored by administrators; backend-supplied field/layout changes
without a client release; or multiple products that must execute the same dynamic
definition. First identify authoring authority, schema versioning/migration,
expression security, localization/accessibility, custom-control escape hatches,
typed API conversion and compatibility tests.

More CRUD screens, nested arrays, cross-field validation or repeated styling alone
do not justify an engine. Extract a helper when actual consumers repeat a stable
rule. Keep templates and domain-specific composition explicit.

## 7. Evidence and references

Current verification is recorded in
`documentation/modules/platform/features/angular-form-foundation/SIGNAL_FORMS_IMPLEMENTATION_REPORT.md`.
The installed Angular declarations/runtime determine available APIs when current
online docs include newer additions.

- [Angular submission lifecycle](https://angular.dev/guide/forms/signals/form-submission).
- [Angular custom controls](https://angular.dev/guide/forms/signals/custom-controls).
- [Angular cross-field logic](https://angular.dev/guide/forms/signals/cross-field-logic).
- [Angular schemas](https://angular.dev/guide/forms/signals/schemas).

PrimeNG MCP metadata/examples were consulted for InputText, Select, DatePicker,
Checkbox and ToggleSwitch. Final DatePicker usage validation accepted its generated
API metadata; Angular compilation, unit tests and browser tests provide the separate
behavioral evidence. Metadata validation alone does not certify runtime behavior.
