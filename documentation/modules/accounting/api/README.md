# Accounting API documentation

## Current state

The Accounting Presentation project currently exposes no financial HTTP
endpoints. The module does, however, contain its first application integration
handler: Contacts party-created/updated facts are consumed through the durable
Accounting inbox into an Accounting-local `PartyReference` projection. This is
an internal module contract, not a public Accounting HTTP endpoint.

## Contract rules

For each future feature, record the route, authorization policy, request and
response envelope, validation, errors, paging/sorting, idempotency, audit
effects, and exact tests. Posting endpoints must reject unbalanced journals,
closed periods, duplicate commands, and invalid account/dimension combinations.

Accounting consumes approved upstream facts through stable IDs and
Contracts/events. It never queries another module's DbContext or accepts a
cross-module EF foreign key, and this document does not select future source
modules.
