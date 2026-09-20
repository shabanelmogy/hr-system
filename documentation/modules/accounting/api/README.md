# Accounting API documentation

## Current state

The Accounting Presentation project currently exposes the versioned Fiscal Years
HTTP/CQRS slice, including list/lookup/detail, create/update/archive/restore, and
the open/begin-closing/close/lock/reopen lifecycle with Accounting permissions and
tenant membership enforcement. The broader Accounting roadmap remains unimplemented.

The module also contains the Contacts party-created/updated integration handler:
facts are consumed through the durable Accounting inbox into an Accounting-local
`PartyReference` projection. This is an internal module contract, not a public
Party-master endpoint.

`PartyReference.SourceRevision` orders Contacts facts. A positive revision only
replaces a smaller revision; equal and older facts are acknowledged without
regressing the projection. Legacy persisted events lacking the field deserialize
as revision 0. They cannot replace a positive revision; legacy-only updates use
occurrence time and then EventId as a deterministic tie-breaker. Negative
revisions are rejected. This compatibility concerns existing event payloads,
not an optional concurrency contract for new writes.

`AddPartySourceRevision` adds the projection version with default 0. The inbox
receipt and projection still commit in the same Accounting transaction, with
SQL rowversion protecting concurrent consumers. Accounting owns the `acc`
schema and never joins `contacts.Parties`.

## Contract rules

For each future feature, record the route, authorization policy, request and
response envelope, validation, errors, paging/sorting, idempotency, audit
effects, and exact tests. Posting endpoints must reject unbalanced journals,
closed periods, duplicate commands, and invalid account/dimension combinations.

Accounting consumes approved upstream facts through stable IDs and
Contracts/events. It never queries another module's DbContext or accepts a
cross-module EF foreign key, and this document does not select future source
modules.
