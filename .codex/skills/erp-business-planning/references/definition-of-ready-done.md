# Definition of Ready and Definition of Done

Use with the feature contract (`documentation/plans/FEATURE_DECOMPOSITION_TEMPLATE.md`) and
the gates in `documentation/plans/PLAN_QUALITY_GATE.md`. The gates decide whether a plan or
slice may start; these lists are the per-capability checks inside a slice.

## Ready (before implementation starts)

- [ ] Actor and business goal are clear and confirmed by the owner.
- [ ] Every linked business rule (`BR-###` in `PLAN.md` section 7) is confirmed and testable.
- [ ] Permissions use exact `Resource:Action` claims (`documentation/guides/shared/PERMISSION_MODEL.md`); the record scope is explicit for every resource touched.
- [ ] Tenant and company ownership of every entity is decided.
- [ ] Every relationship has cardinality, required/optional, and delete behavior.
- [ ] Concurrency and duplicate handling are decided where shared data changes.
- [ ] Acceptance criteria are Given/When/Then and include a forbidden (403) case and an out-of-scope (404) case.
- [ ] Failure cases have stable error codes and HTTP statuses.
- [ ] Every screen has its pattern recorded for web and mobile (`SCREEN_PATTERN_CATALOG.md`).
- [ ] No blocking open question (`PLAN.md` section 22) is linked to it.
- [ ] It fits in one slice (about three days or less).

## Done (before the slice is accepted)

### API

- [ ] The domain enforces its invariants through explicit constructors and methods.
- [ ] Commands and queries have FluentValidation; queries are read-only.
- [ ] Stable error codes with localized messages for every configured culture.
- [ ] A permission attribute on every endpoint; record scope applied before retrieval.
- [ ] Tenant/company ownership, scoped unique indexes, scoped foreign keys, and delete behavior configured.
- [ ] Writes go through the module's own unit of work (`I<Module>UnitOfWork`).
- [ ] Row version, atomic update, or transaction applied where decided, and nowhere by habit.
- [ ] Migration generated, read, and matching the domain model.
- [ ] Create returns 201 with Location, delete returns 204, lists are paginated with stable ordering.

### Web and mobile

- [ ] Every API response used is validated by a schema.
- [ ] Web calls go through the BFF; no tokens in client code.
- [ ] Loading, empty, error, validation, and forbidden states implemented.
- [ ] Shared components reused; a new shared component is registered in the catalog.
- [ ] Navigation entries are permission-aware and appear only when the route exists.

### Tests

- [ ] Every acceptance criterion has an automated test or a recorded manual check.
- [ ] Forbidden (403) and out-of-scope (404) tests exist.
- [ ] Invariant, duplicate, or concurrency tests exist where the capability has one.
- [ ] Build, lint, type-check, and all test suites pass.

### Documentation

- [ ] Applied books, the required-file manifest, and generated packets are updated (Phase 06 verification).
- [ ] New decisions and rules are recorded; changed rules are superseded, not silently edited.
- [ ] Deferred items, risks, and production checks have central note IDs in `documentation/plans/notes/`.
