# {{RECIPE_TITLE}}

## Purpose

Freeze scope and gather evidence before implementation. Do not treat a neighboring feature as proof without checking its current source.

## Required outputs

1. Copy `FEATURE-REVIEW-ARTIFACTS.template.md` to `features/<feature>/<FEATURE>-REVIEW-ARTIFACTS.md`.
2. Create `features/<feature>/required-files.json` using repository-relative paths.
3. Record API, web, and mobile routes, owners, permissions, list fields, actions, reports, imports, and child relationships.
4. Separate verified current behavior, requested behavior, intentional platform differences, and unresolved findings.
5. Record tests that prove each contract rather than only naming test folders.

## Discovery checklist

- [ ] Domain entity, persistence mapping, and migration impact identified.
- [ ] Controller, CQRS messages, handlers, stores, validators, jobs, and dependency injection identified.
- [ ] Web route, feature boundary, query state, views, forms, permissions, realtime, translations, and shared UI identified.
- [ ] Mobile route, feature boundary, server-list state, forms, permissions, realtime, translations, responsive layout, RTL, and shared UI identified.
- [ ] Shared HTTP field names, nullability, paging base, sort tokens, filters, errors, and lifecycle actions frozen.
- [ ] Known gaps are listed as findings and excluded from the copy baseline.

## Approved references

{{APPROVED_REFERENCES}}

## Source fingerprints

{{SOURCE_FINGERPRINTS}}
