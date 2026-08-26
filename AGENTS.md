## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- Do not modify or update `graphify-out/` unless the user explicitly requests it.

## Economical subagent policy

- Do not spawn subagents for small or single-file tasks.
- Use at most 2 subagents concurrently.
- Use `luna_explorer` for read-only search, tracing, documentation lookup, and log analysis.
- Use `gpt-5.6-terra` with low reasoning for straightforward implementation.
- Use `gpt-5.6-terra` with medium reasoning for normal multi-file features.
- Escalate to `sol_worker` only for complex debugging, architecture, security, concurrency, migrations, or high-risk review.
- Never assign the same investigation or implementation to multiple agents.
- Reuse an existing agent for related follow-up work instead of spawning a replacement.
- Give each subagent a narrow, self-contained prompt and request a concise result with exact files and symbols.
- Prefer `fork_turns: "none"` or the smallest useful recent-turn window when spawning an agent.
- Keep Fast mode disabled for routine work.

## Research after a failed implementation

- If an implementation or fix does not satisfy the user on the first attempt, stop iterative guessing and research the issue on the web before making another implementation attempt.
- Prefer current official documentation and primary sources for the relevant framework, library, or platform.
- Base the next change on the documented behavior, and cite the sources used when reporting the result.

## Centralized documentation system

- All project-owned guides live under [`documentation/`](documentation/README.md). Do not create new `Docs/`, `docs/`, or `doc/` trees inside application projects.
- Before creating or restructuring a feature that spans API, `web-next`, or `mobile-react`, read [`documentation/system/README.md`](documentation/system/README.md) and run `./documentation/system/Generate-Documentation.ps1 -Check`.
- Choose the closest reviewed reference explicitly: Countries for a flat global reference-data lifecycle, or States for a parent-dependent reference-data lifecycle. Neither reference supplies tenant/company ownership rules for HR aggregates.
- Use the selected feature's `documentation/system/features/<reference>/required-files.json` to discover its complete evidence surface. Verify current source before applying the pattern.
- For a new feature, run `./documentation/system/New-FeatureDocumentation.ps1 -FeatureId <kebab-case-id> -FeatureName "<Display Name>" -ReferenceFeature countries|states`. Complete the generated `IMPLEMENTATION-REQUEST.md` and review artifact before runtime work. Keep its required-file manifest in draft state until the referenced runtime files exist.
- Treat `Required` as current-release and gated, `Deferred` as owned/scheduled with a reopening trigger, and `Excluded` as deliberately absent with no runtime placeholder. Decide every optional capability independently for web and mobile.
- For a review of an existing feature, default to read-only evidence collection unless the user also asks for changes. Record verified behavior, requested behavior, intentional platform differences, and unresolved findings separately.
- Register final canonical books, the final required-file manifest, and feature-scoped recipes under `generated/<feature>/`; do not reuse the unscoped Countries packets for another feature.
- During a new-feature draft, use the phase templates and the selected reference packets as navigation, never as implementation evidence. After canonical books are registered, generate the feature's own phases 00 through 06; phase 06 is mandatory for handoff.
- Never edit `documentation/system/generated/` directly. Update a canonical numbered section, recipe template, or manifest and regenerate.
- Keep runtime source in its owning application. Documentation manifests reference source files; they do not duplicate them.
- Copy the selected reference's architecture and verification discipline, but do not copy reference-specific fields, ownership, optional views, or documented findings unless the new feature requires them.
- At handoff, separate feature regressions, inherited repository failures,
  environment blockers, and manual release checks. A focused pass does not erase a
  failing full gate.

## Shared component first (mandatory)

- Before creating or changing a screen, form, dialog, grid, card, filter, toolbar,
  pagination control, empty/loading/error state, or layout, search the target
  application's shared component library and the selected reference feature.
  Reuse the existing component when it covers the requirement.
- When a shared component is close but missing a generic, backward-compatible
  capability, extend that component with a well-named option and tests where
  behavior is non-trivial. Do this before creating a parallel look-alike or local
  wrapper. Keep extensions generic; do not encode feature business rules in shared
  code.
- A feature page composes shared components and owns only its domain data,
  permissions, callbacks, and genuinely feature-specific content. Do not recreate
  shared visual shells with raw MUI or React Native primitives.
- In `web-next`, use the established components under `src/shared/components/`.
  In particular, forms and add/edit dialogs must use the shared form-dialog system
  (`MyForm`, `FormContainer`, `FormHeader`, `FormContent`, and `FormFooter`), and
  list pages must use the shared page header, toolbar, grid/card, pagination, and
  feedback states where applicable.
- The shared web form system is the single source of truth for dialog layout,
  loading state, unsaved-change protection, validation focus, accessible error
  links, and errors rendered underneath their corresponding inputs. Feature forms
  must use `MyForm` with `MyTextField`/`MySelect` (or another approved shared
  field) and must not rebuild any of those behaviors locally.
- Never allow browser-native validation dialogs, native `alert`, native `confirm`,
  or native error UI for an application workflow. Shared `MyForm` must disable
  HTML constraint validation with `noValidate`; Zod via `zodResolver` is the only
  client-side validation authority and its messages must render beneath the
  corresponding shared input. Use the shared confirmation and error components
  for application feedback instead of browser dialogs.
- In `mobile-react`, use the corresponding shared design-system components and
  navigation/form shells before adding local UI wrappers.
- Create a new shared component only when no existing one can meet the need without
  a domain-specific compromise. Keep it generic, place it in the appropriate
  shared folder, and add or extend its tests when behavior is non-trivial.
- A feature-local component is permitted only for domain-specific composition. It
  must not duplicate a shared component's styling, lifecycle, accessibility, or
  state-management behavior.
- For data-entry forms, keep the primary Save/Create action enabled. On submission,
  validate and show a specific message directly beneath every invalid field, then
  focus the first invalid field through the shared form system. Do not disable the
  action merely because the form is currently incomplete or invalid; users need a
  clear, actionable explanation.

## Web feature implementation baseline

- Keep feature ownership explicit: `types` contains API-facing contracts,
  `services` is the only feature layer that calls `apiService`, React Query hooks
  own query keys, caching, and mutations, and pages/components compose that data.
  Do not call `apiService` directly from a feature page or visual component.
- Use `react-hook-form` with `zodResolver` and a Zod schema for every data-entry
  form. Put reusable feature schemas and their inferred form types in the
  feature's `validation/` or `utils/validation` module, not inline in a page or
  dialog. Server validation remains authoritative; map returned field errors back
  to the shared fields when the API identifies a field.
- All new visible web text must be a translation key in both
  `src/locales/en/translation.json` and `src/locales/ar/translation.json`; use
  `useTranslation` in the owning component. Preserve RTL behavior through the
  existing theme and shared components instead of applying manual directional CSS.
- Prefer typed contracts, `unknown` plus narrowing for untrusted values, and pure
  feature utilities for request/response conversion. Do not introduce `any`,
  duplicate DTOs, or hide business rules inside presentation components.
- Compose loading, empty, error, search, filtering, pagination, and permissions
  using existing shared states and hooks. A page must remain usable at small and
  large viewports and keep scroll areas inside the intended list or data panel.
- For a changed web feature, run the narrowest relevant test plus `npm run
  type-check`; run `npm run check:architecture` when adding or moving feature
  boundaries. Do not start a dev server merely to validate static code.

## Reference implementation fidelity

- When a user requires a feature to follow Countries, States, or another reviewed reference, treat the selected reference's current source as the implementation baseline, not merely a visual inspiration.
- Before editing, identify and reuse the reference's controller hook, multi-view composition, shared `PageHeader`, `MyDataGrid` toolbar, card scaffold, pagination, loading/empty/error states, and verification tests. Adapt only feature-owned fields, API contracts, permissions, relationships, and explicitly decided views.
- Do not replace an established reference structure with a custom page, local filtering/sorting, library-default controls, or look-alike card layout. A simpler implementation is not equivalent to the guide.
- Before handoff, compare the rendered Grid, Cards, search/filter toolbar, paging, and each required view against the selected reference at the same viewport. Record any intentional difference in the applicable feature guide; unresolved visual differences are feature regressions, not polish work.
