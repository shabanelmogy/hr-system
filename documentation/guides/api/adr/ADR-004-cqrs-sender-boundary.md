# ADR-004: CQRS and Sender Presentation Boundary

**Status:** Accepted  
**Date:** 2026-09-14

## Context

Controllers that call broad business services or persistence directly create a
second orchestration layer and make business ownership inconsistent.

## Decision

Business endpoints use explicit Commands/Queries and dispatch through `ISender`.
Presentation owns HTTP concerns only. Application handlers own orchestration and
ports; Domain owns invariants; Infrastructure implements external and persistence
adapters.

## Consequences

- Use cases are explicit and testable.
- Broad CRUD business-service facades are not part of the architecture.
- Transport-only exceptions must remain narrow and must not contain business
  orchestration.
