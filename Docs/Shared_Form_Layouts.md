# Shared Form Layouts

The web and mobile applications expose the same compositional form concepts. These components
only control layout and navigation. Validation, API calls, and business rules remain inside the
owning feature.

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
