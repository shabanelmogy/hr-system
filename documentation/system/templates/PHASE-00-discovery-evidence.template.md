# {{RECIPE_TITLE}}

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

Use `documentation/system/templates/FEATURE-IMPLEMENTATION-REQUEST.template.md`
as the copy-ready scope contract and the review artifact as the evidence ledger.
`Required` means current-release and gated, `Deferred` requires an owner/trigger,
and `Excluded` means no runtime surface.

## Required outputs

1. Copy `FEATURE-REVIEW-ARTIFACTS.template.md` to `features/<feature>/<FEATURE>-REVIEW-ARTIFACTS.md`.
2. Record the operating mode (`new feature`, `existing-feature review`, or `existing-feature change`) and the selected applied reference with a reason.
3. For a new feature, create `features/<feature>/required-files.draft.json`; do not register it while declared runtime files are missing. For an existing review, start from its final `required-files.json`.
4. Before final registration, replace the draft with `required-files.json` containing only existing repository-relative paths and evidence-based source-collection minimums.
5. Record API, web, and mobile routes, owners, permissions, list fields, actions, reports, imports, and child relationships.
6. Classify Import independently for web and mobile as `Required`, `Deferred`, or
   `Excluded`. Record the accepted format, data scope, dependency lookups, and the
   reason for every platform difference.
7. Separate verified current behavior, requested behavior, intentional platform differences, and unresolved findings.
8. Record tests that prove each contract rather than only naming test folders.

## Discovery checklist

- [ ] Domain entity, persistence mapping, and migration impact identified.
- [ ] Controller, CQRS messages, handlers, stores, validators, jobs, and dependency injection identified.
- [ ] Web route, feature boundary, query state, views, forms, permissions, realtime, translations, and shared UI identified.
- [ ] Mobile route, feature boundary, server-list state, forms, permissions, realtime, translations, responsive layout, RTL, and shared UI identified.
- [ ] Shared HTTP field names, nullability, paging base, sort tokens, filters, errors, and lifecycle actions frozen.
- [ ] Import is explicitly classified per client, and every Required Import path
      has a named format, permission, bulk endpoint, and dependency source.
- [ ] Known gaps are listed as findings and excluded from the copy baseline.
- [ ] The generated phase packets and fingerprints belong to this feature, not to an unscoped reference output.
- [ ] Every optional capability has one platform decision, data scope, reason, and
      evidence path; no decision is inferred from the selected reference.
- [ ] Verification gates are identified before coding, including manual and
      environment-dependent checks.

## Approved references

{{APPROVED_REFERENCES}}

## Source fingerprints

{{SOURCE_FINGERPRINTS}}
