# Contacts API documentation

## Verified foundation

The module owns its API layer and exposes it through the Presentation project.
The first reference slice is implemented at `api/v1/contacts/parties` and
requires an authenticated tenant member. It supports `GET /{id}`, `POST`, and
`PUT /{id}`; tenant/company scope comes only from the trusted execution context,
never from request payload fields.

Each action requires its own live permission (`ContactsParties:View`,
`ContactsParties:Create`, or `ContactsParties:Update`) and the tenant's
`contacts/parties` entitlement. JWT permission claims alone do not grant access.
Anonymous calls return 401 and insufficient permission/entitlement returns 403.

Responses include a positive `revision`, initially 1. `PUT /{id}` requires
`expectedRevision` copied from the last response; missing/zero/negative values
return validation errors. A stale revision or a competing database write returns
409 ProblemDetails. Clients must reload and reconcile before retrying, never
silently replace the expected revision. Successful updates increment the
revision and commit the Party and its Outbox event together.

This contract change is intentional during development. There is no optional
concurrency mode or duplicate version of the endpoint. Web and mobile Party
workflows are **Excluded** from this API foundation scope; see their profiles.

Cross-module communication uses the public party-created/updated Contracts
through module-owned outbox/inbox storage, never another module's Infrastructure
or EF model.

The outbox is dispatched automatically by the Contacts module lifecycle. Failed
delivery is retried with bounded backoff, interrupted `Processing` claims are
recovered after a timeout, and terminal messages are retained as `Dead` rows for
operator diagnosis. Event IDs, correlation IDs, and causation IDs remain stable
across retries.
