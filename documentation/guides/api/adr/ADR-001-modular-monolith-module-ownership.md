# ADR-001: Modular Monolith and Single Module Ownership

**Status:** Accepted  
**Date:** 2026-09-14

## Context

The ERP contains multiple business capabilities that need strong boundaries and
independent ownership without the deployment and distributed-transaction cost of
microservices.

## Decision

ERPSYSTEM is a modular monolith. Each business truth has one owning module. A
module may be extracted later only when a real operational need justifies it.
Cross-module access never bypasses the owner through foreign tables, DbContexts,
Domain types, or internal Application types.

## Consequences

- One deployable application remains operationally simple.
- Boundaries are executable and extraction remains possible.
- Some duplication is preferred over an incorrectly shared business abstraction.
- Creating a new module requires a real bounded-context ownership reason, not
  merely feature size.
