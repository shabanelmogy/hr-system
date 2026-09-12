# Contacts API documentation

## Verified foundation

The module owns its API layer and exposes it through the Presentation project.
The first reference slice is implemented at `api/v1/contacts/parties` and
requires an authenticated principal. It supports `GET /{id}`, `POST`, and
`PUT /{id}`; tenant/company scope comes only from the trusted execution context,
never from request payload fields.

Cross-module communication uses the public party-created/updated Contracts
through module-owned outbox/inbox storage, never another module's Infrastructure
or EF model.

The outbox is dispatched automatically by the Contacts module lifecycle. Failed
delivery is retried with bounded backoff, interrupted `Processing` claims are
recovered after a timeout, and terminal messages are retained as `Dead` rows for
operator diagnosis. Event IDs, correlation IDs, and causation IDs remain stable
across retries.
