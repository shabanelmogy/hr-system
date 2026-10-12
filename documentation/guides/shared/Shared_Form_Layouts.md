# Shared Form Layouts

The web and mobile applications expose the same compositional form concepts. These components
only control layout and navigation. Validation, API calls, and business rules remain inside the
owning feature.

The reusable screen-level contract for a multi-section form is registered as
[P-003 Tabbed Form](SCREEN_PATTERN_CATALOG.md#p-003--tabbed-form). The current web reference is
Add Tenant; its tabs are an example of section ownership, not a field list to copy into another
module. The current Mobile Add Tenant reference is explicitly `Adapted`: it uses a full-screen
stacked `AppForm` and does not currently render `AppFormTabs`. Mobile may adopt `AppFormTabs` when
sections require direct navigation, or keep the stacked composition, but it must preserve the same
fields, validation, permissions, dirty-state, error-focus, and save/cancel behavior documented by
P-003.

## Choose the layout

- Use `FormSection` / `AppFormSection` to group related fields in a normal form.
- Use `FormTabs` / `AppFormTabs` for related groups that may be completed in any order.
- Use `FormStepper` / `AppFormStepper` for an ordered workflow where each step may be validated
  before moving forward.
- Use `FormStepActions` / `AppFormStepActions` as an optional footer for Previous, Next, and Save.
- Keep `keepMounted` enabled when fields are registered with React Hook Form. Disable it only for
  expensive panels whose state is stored elsewhere.

## Sections

```tsx
<AppFormSection
  title={t('employee.identity')}
  description={t('employee.identityDescription')}
  icon="person-outline">
  {identityFields}
</AppFormSection>
```

## Tabs

```tsx
<AppFormTabs
  label={t('employee.formSections')}
  value={activeTab}
  onChange={setActiveTab}
  tabs={[
    {
      value: 'identity',
      label: t('employee.identity'),
      content: identityFields,
      hasError: hasFieldError(identityFieldNames, errors),
      errorLabel: t('validation.sectionHasErrors'),
    },
    {
      value: 'employment',
      label: t('employee.employment'),
      content: employmentFields,
    },
  ]}
/>
```

The web API is identical in purpose and uses `FormTabs`. Web icons and labels accept `ReactNode`;
mobile icons use the shared `AppIconName` set.

## Baseline evidence (2026-09-23)

The Web Add Tenant implementation keeps one React Hook Form context and maps the
first invalid field to `identity`, `subscription`, `contact`, `entitlements`, or
`notes` through `web-next/src/platform/tenants/tenantFormTabs.ts`. After the tab
changes, `TenantEditor` focuses the mapped field on the next animation frame;
this keeps validation navigation deterministic when the failed field is on an
inactive panel. `FormTabs.test.tsx` covers tab/panel ARIA relationships, error
indicators, and the `keepMounted` contract. The helper test covers stable tab and
field ordering.

Mobile Add Tenant remains intentionally `Adapted`: `TenantFormModal` uses one
full-screen stacked `AppForm` and one `useZodForm` context. `AppFormTabs` remains
the reusable tab primitive for mobile features that need tabs; its tests cover
accessibility labels, error state, RTL direction, selection, and mounted-panel
behavior. `TenantFormModal.test.tsx` records the current single-shell validation
behavior so a future layout change cannot silently split the form context.

## Steps

```tsx
<AppFormStepper
  label={t('candidate.applicationSteps')}
  activeStep={activeStep}
  onStepChange={setActiveStep}
  steps={[
    { id: 'identity', label: t('candidate.identity'), content: identityFields },
    { id: 'experience', label: t('candidate.experience'), content: experienceFields },
    { id: 'review', label: t('candidate.review'), content: reviewContent },
  ]}
/>
```

Validate only the current step before calling `setActiveStep`. Final submission must still validate
the complete Zod schema. Tabs and steps can expose `hasError` plus a localized `errorLabel` without
owning validation logic.

## Dirty state

Pass React Hook Form's `formState.isDirty` to the shared form shell:

```tsx
<AppForm isDirty={isDirty} onCancel={closeForm} onSubmit={submitForm}>
  {formLayout}
</AppForm>
```

The shared discard dialog then protects close, cancel, and Android back actions. Reset the form
baseline after a successful save when the form remains open.

## Local mock-data action

Writable forms may expose the shared `MyForm.mockDataAction` or
`AppForm.mockDataAction`. The action fills a realistic, schema-valid local draft and never
submits or persists it. Feature code must keep authoritative server proposals and loaded lookup
values (including scope, IDs, and RowVersion) and must disable the action while required
prerequisites are unavailable. View-only, report-only, and query-only screens do not fabricate
data. Visibility is controlled by the shared platform policy: do not gate the action with
`NODE_ENV`/`__DEV__` in feature code.

### Changelog (2026-09-23)

Accounting adopted this rule for Currency, Fiscal Years, Account, Hierarchy Level, and the
existing Ledger Setup compatibility form so hosted-trial builds retain the same safe draft action on
both platforms.
