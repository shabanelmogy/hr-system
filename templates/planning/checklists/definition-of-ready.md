# Definition of Ready (story)

A story may be marked `Ready` only when all apply:

- [ ] Actor and business goal are clear and confirmed.
- [ ] Linked to a confirmed capability (`CAP-##`).
- [ ] All linked rules (`BR-###`) are `Confirmed` and testable.
- [ ] Permissions exist in the catalog; the resource scope rule is explicit for every resource touched.
- [ ] Tenant ownership of every entity involved is decided.
- [ ] Relationships involved have cardinality, required, and delete behavior.
- [ ] Concurrency/duplicate handling decided where the story mutates shared data.
- [ ] Acceptance criteria in Given/When/Then, including an authorization negative case and a scope/IDOR case.
- [ ] Failure cases have stable error codes and HTTP statuses.
- [ ] UI expectation stated (Track A: which legacy screen and preservation level).
- [ ] No open blocking question linked to the story.
- [ ] Size fits in one slice (≤ ~3 days).
