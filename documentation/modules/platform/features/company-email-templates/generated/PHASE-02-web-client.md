<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-02-web-client.template.md -->

# Company email templates Phase 02 - Next.js Client

## Purpose

Implement the canonical browser feature with one server-managed list state shared by all views.

Execution references:
`documentation/guides/web/architecture/frontend-architecture-reference.md` and
`documentation/guides/web/server-managed-feature-reference.md`.

## Required structure

- Thin App Router page importing the feature public API.
- Feature-owned types, runtime-independent query mapping, service, query hooks, page controller, views, forms, actions, and tests.
- Shared components only for domain-neutral layout, list controls, feedback, forms, navigation, and data display.
- Reuse established shared components through their public props; do not replace
  their tested product behavior with feature-local or library-default versions.
- Explicit route, API endpoint, permission, navigation, realtime, and translation registration.

## Read-path contract

- Keep search text, field, operator, status, feature filters, sort, page, and page size in one state owner.
- Reset to page zero when search, filter, sort, or page size changes.
- Convert the UI page base to the API page base exactly once.
- Use the server total for pagination and never client-filter a server page.
- Make unsupported sorting unavailable rather than displaying a nonfunctional affordance.
- Treat the API sort allow-list as a UI contract: every unsupported Grid column
  sets `sortable: false`, every supported field remains operable, and a focused
  column test prevents drift.
- Preserve criteria and lifecycle state across every approved view. Do not assume
  chart, report, import, or export exists unless its Required/Deferred/Excluded
  decision and data scope are recorded for this feature.

## UI and action checks

- [ ] Desktop and mobile-width browser layouts use the shared feature header and list controls.
- [ ] Existing reusable components and their tests were inspected before adding or replacing UI.
- [ ] Grid uses the shared `MyDataGrid`/`GridFooter` pagination unless an explicit product exception is recorded.
- [ ] Client and server Grids render the same shared record-navigation footer; server mode fetches an adjacent page only when navigation crosses a record boundary.
- [ ] Server-managed lists request one authoritative page, preserve the previous page while fetching, and never clamp against a loading/missing/unknown total.
- [ ] Shared-component changes preserve behavior and are verified against every known consumer.
- [ ] Search column, condition, input, and reset controls align and share control height.
- [ ] Grid options are the final toolbar item and own column visibility, density, status, archive, and restore actions where specified.
- [ ] Create, view, edit, archive, restore, and bulk actions follow permissions and read-only state.
- [ ] Bulk selection normalizes eligible unique IDs, rejects rather than truncates
      selections above the API maximum with localized feedback, and rechecks the
      limit inside the direct submit handler.
- [ ] Forms normalize and validate the same fields as the API without inventing server rules.
- [ ] Loading, background refresh, empty, no-results, and error states are distinct;
      background refresh preserves current rows/cards/charts and uses
      non-destructive progress instead of an initial-load skeleton/overlay.
- [ ] Realtime invalidation uses stable query-key prefixes.
- [ ] Every implemented optional view is registered and tested; no feature-owned
      Chart, Report, Import, or Export implementation is left unreachable.
- [ ] English, Arabic, RTL, keyboard access, and focus restoration are verified.

## Import checks

Apply these checks only when browser Import is Required. When it is Deferred or
Excluded, record that decision and do not register an empty Import view.

- [ ] Import registration uses the declared create permission and read-only guard;
      the shared Filter action is omitted when the view has no criteria bar.
- [ ] The Import submit callback independently enforces read-only and feature
      create permission, even when the parent view and submit button are already
      permission-filtered.
- [ ] Accepted extension/MIME, file size, workbook/sheet, required headers,
      duplicate headers, blank rows, and empty-file behavior are deterministic.
- [ ] Preview rows use the shared form schema and normalization, show localized
      row errors, and exclude local-invalid rows from submission.
- [ ] Relationship lookups have explicit permission, loading, empty, and error
      states and map display values to server identifiers without guessing.
- [ ] The service sends the documented typed bulk envelope, enforces the client
      limit, and treats the submitted valid batch according to API atomicity.
- [ ] Retry semantics distinguish local parse errors, stable API validation or
      conflict errors, and transient network failures.
- [ ] Success invalidates the canonical feature query-key root, clears stale
      selection, and preserves the expected active view.
- [ ] Tests cover parsing, headers, exact request body, direct submit authorization,
      limits, field-scoped
      duplicates, dependency lookups, permission/read-only state, API conflict,
      retry, invalidation, English, Arabic, and RTL.

Required browser Import follows one observable flow:
`idle -> parsing -> preview -> submitting -> succeeded | failed`. Row state is
`pending | invalid | submitted | uploaded | failed`. A retry submits only rows
the documented contract considers eligible and never silently turns an atomic API
failure into partial success.

## Evidence to capture

- Public route/API/permission/realtime/localization registrations.
- Exact query and mutation serialization tests, including named bulk envelopes.
- View/controller wiring, mutation invalidation, column allow-list, batch-limit,
  and permission/read-only behavior for direct handlers.
- Desktop/compact, EN/AR, RTL, keyboard, focus, loading/error/empty/retry evidence.

## Approved references

- **Company email templates cross-platform master review:** `../modules/platform/features/company-email-templates/company-email-templates-review.md` sections 3, 4, 6, 7
- **Company email templates Next.js implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-web.md` sections 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-email-templates-master | 3 | `8cfceb41ccd21b6f52a9dbaa638bff99dadf8a412a1db8855124cfa4b36f337e` |
| company-email-templates-master | 4 | `ecf324faf8fb27d4110c34672c429c9f8664b54d71c0fe07f24641366780567f` |
| company-email-templates-master | 6 | `8ed77bb6949b5a4989589bba630b031ff6adc4d6a87ddc0b4758137c1021b5b0` |
| company-email-templates-master | 7 | `b806a110148b1bc25878a8c0537a288061646b9c75caf91bcf77dc745e7980a2` |
| company-email-templates-web | 1 | `75e2e10c2f5c143dfe6ed638d0ebf38c8ed0b31ad7b05288d13bede82e41e47c` |
| company-email-templates-web | 2 | `1db225fcf0529b12d283cf2423e6f435aff26cd6cc895ccebb9c9c58c40b77da` |
| company-email-templates-web | 3 | `20a6e4ff9b78aa524db76b942cae767ec812416138a7f546d0a96aca7ad0443e` |
| company-email-templates-web | 4 | `f5113f55bbffbc42c4056343ae8c412bf1d013d5645b78879215dee0b08bf3ec` |
| company-email-templates-web | 5 | `a2f4ef7d6700800f5150fa6089f281a3d1c81ed67d890f6649ce05e137db6031` |
| company-email-templates-web | 6 | `32f5ad93f2ac472464b41408ec9317035cec2f1477160ae64c1b4fd4e284b936` |
| company-email-templates-web | 7 | `3d52e74d285673d6d907153a58202661742864e28347b9186192bd0ad204446d` |
| company-email-templates-web | 8 | `47c36b6225dea207dddadd8fea5157985285dbb3c4da730b4bbee2429d965859` |
| company-email-templates-web | 9 | `9c9d2394df7107e216794cd4aa680e2b7b7922f6799290ff6e7fe9a5fa116221` |
| company-email-templates-web | 10 | `a5cbb4fc9ebb16ebca559c40ecca283fca9ce39f8b679942fec133a24545d88e` |
| company-email-templates-web | 11 | `0c352b1297a7552927c855bcf69e37fa41564ff8a7060119a3a5d97870816d3e` |
| company-email-templates-web | 12 | `13bcc136704a2b02db0a639f0c9f6b6a62150e729f002ab0549ea6e0d10be9fa` |
| company-email-templates-web | 13 | `fb2dcbf05534e4901b95a48b0930b1fc695d12a4d55dd91f17ecb26ccdaa03c4` |
| company-email-templates-web | 14 | `5e53242eb88be6c2605787b21948d1c653213cd0c53fd670bd41b7aa70496956` |
