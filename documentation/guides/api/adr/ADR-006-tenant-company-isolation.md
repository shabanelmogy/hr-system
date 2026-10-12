# ADR-006: Tenant and Company Isolation Are Independent

**Status:** Accepted  
**Date:** 2026-09-14

## Context

An ERP user can belong to a tenant while access to individual companies remains a
separate authorization and data-isolation concern.

## Decision

Tenant scope and company scope are modeled and enforced independently. Trusted
execution context is authoritative for current scope; client-supplied tenant or
company identifiers cannot broaden it. Applicable reads use scoped filters and
writes fail closed when scope is missing or mismatched.

## Consequences

- Tenant membership never implicitly grants company access.
- Jobs, messaging, cache, realtime, and persistence must carry the dimensions they
  need to preserve isolation.
- Cross-company business operations require an explicit authorized use case rather
  than bypassing filters.
