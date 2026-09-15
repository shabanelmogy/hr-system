# ADR-003: Shared Database with Schema per Module

**Status:** Accepted  
**Date:** 2026-09-14

## Context

The modular monolith currently deploys against one SQL Server database, while
each module still needs persistence ownership and independently verifiable EF
migrations.

## Decision

All modules may use `ConnectionStrings:DefaultConnection` for the same physical
database. Each module owns exactly one DbContext, a unique SQL schema, its EF
migrations, and its schema-local `__EFMigrationsHistory`. A module-specific
connection string remains an override for future deployment needs.

## Consequences

- Local transactions and deployment stay simple.
- Table ownership remains visible and enforceable.
- Initial and subsequent migrations are module-owned and must compose safely on
  one clean database.
- Direct cross-module table access remains forbidden even though the physical
  database is shared.
