# Contacts feature catalog

This is the module-owned feature index. Keep one entry per vertical slice and
link to its reviewed API, web, mobile, and cross-project evidence. Do not copy
the shared phase rules or generated packets; use documentation/system/ as the
single source for the documentation workflow.

## Party reference slice — implemented

- Tenant/company-scoped `Party` aggregate with create, update, and read handlers.
- Authenticated HTTP surface at `api/v1/contacts/parties`.
- Public `PartyCreatedIntegrationEvent` / `PartyUpdatedIntegrationEvent` Contracts.
- Contacts-owned transactional outbox; Accounting consumes the public events
  through its durable inbox into an Accounting-owned party reference projection.
- Focused tests cover duplicate delivery, scope isolation, retry, and serialized
  outbox-to-inbox flow.
