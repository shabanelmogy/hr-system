# ADR-002: Canonical Module Project Shape

**Status:** Accepted  
**Date:** 2026-09-14

## Context

Different module layouts create inconsistent dependency direction, testing, and
onboarding costs.

## Decision

Every module uses six runtime projects: `Contracts`, `Domain`, `Application`,
`Infrastructure`, `Presentation`, and the bootstrap/module project. Each module
also owns one `ErpSystem.Modules.<Module>.Tests` project. System-wide architecture,
integration, and BuildingBlocks tests remain separate solution-level projects.

## Consequences

- Dependency direction and ownership are predictable.
- The generator can enforce a single structure.
- The additional project count is accepted because it buys compile-time module
  boundaries; no extra layers should be introduced without evidence.
