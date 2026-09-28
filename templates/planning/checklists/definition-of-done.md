# Definition of Done (story / slice)

## Backend

- [ ] Domain enforces the story's invariants through explicit constructors/methods.
- [ ] Commands/queries with FluentValidation; queries are read-only.
- [ ] Stable error codes; localized messages (all configured cultures).
- [ ] Permission attribute on every endpoint; resource scope applied before retrieval.
- [ ] Tenant ownership, tenant-scoped unique indexes, tenant-aware FKs, delete behavior configured.
- [ ] Row version / atomic update / transaction applied where decided — and nowhere else by habit.
- [ ] Migration generated and read; matches the domain model.
- [ ] Create returns 201 + Location; delete returns 204; lists are paginated with stable ordering.

## Frontend

- [ ] Zod schema validates every response used.
- [ ] Calls go through the BFF; no tokens in client code.
- [ ] Loading, empty, error, validation, and forbidden states implemented.
- [ ] Existing catalog components reused; any new shared component registered in the catalog.
- [ ] Track A: legacy UI preserved to the agreed level.
- [ ] Navigation entry is permission-aware and only shown when the route exists.

## Tests

- [ ] Every acceptance criterion covered by an automated test or a recorded manual check.
- [ ] Authorization negative test (403) and scope/IDOR test (404 per policy).
- [ ] Invariant, duplicate, or concurrency test where the story has one.
- [ ] Build, lint, and all test suites pass.

## Documentation and tracking

- [ ] Story and slice statuses updated; `status.md` next actions updated.
- [ ] New decisions/rules recorded; changed rules superseded, not silently edited.
- [ ] Template repository: `template-promotion` done or logged.
