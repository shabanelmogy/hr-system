# ADR-005: Cross-Module Contracts and Durable Messaging

**Status:** Accepted  
**Date:** 2026-09-14

## Context

Modules need to collaborate without creating compile-time or persistence coupling,
and important cross-module facts must survive process failure and retries.

## Decision

Compile-time cross-module references use public `*.Contracts` only. Stable facts
that cross module boundaries use integration contracts/events. Workflows that
require durable delivery use Outbox/Inbox, stable event identity, idempotency,
retry, correlation, and causation metadata.

## Consequences

- The source module remains the owner of truth.
- Consumers can maintain local projections without querying foreign tables.
- Delivery is at-least-once, so consumers must be idempotent.
- Operational replay/reconciliation is added where business criticality requires
  it; it does not create a second business-logic path.
