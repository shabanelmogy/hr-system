# Accounting API documentation

## Current state

The Accounting Presentation project exposes versioned (`api/v{version}`)
controllers for Fiscal Years (`fiscal-years`, with the open/begin-closing/close/
lock/reopen lifecycle), Ledger Setup (`currencies`, `accounting-settings`,
`accounts`, `accounting-dimensions`, `accounting-books`, `accounting-journals`,
`accounting-exchange-rate-types`, `accounting-exchange-rates`, `account-mappings`,
`posting-profiles`), and Invoice QR (`invoices/generate-qr`, `invoices/generate-qr-image`,
permission `Invoices:GenerateQrCode`). GL posting, AP/AR, cash/bank, tax, assets,
and close remain unimplemented.

The module also contains the Contacts party-created/updated integration handler:
facts are consumed through the durable Accounting inbox into an Accounting-local
`AccountingPartyReference` projection (`acc.PartyReferences`). This is an internal module contract, not a public
Party-master endpoint.

`AccountingPartyReference.SourceRevision` orders Contacts facts. A positive revision only
replaces a smaller revision; equal and older facts are acknowledged without
regressing the projection. Legacy persisted events lacking the field deserialize
as revision 0. They cannot replace a positive revision; legacy-only updates use
occurrence time and then EventId as a deterministic tie-breaker. Negative
revisions are rejected. This compatibility concerns existing event payloads,
not an optional concurrency contract for new writes.

The `20260922091842_InitialAccounting` baseline creates `acc.PartyReferences.SourceRevision` with default 0. The inbox
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
