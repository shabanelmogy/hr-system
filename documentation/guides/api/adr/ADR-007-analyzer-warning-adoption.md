# ADR-007: Incremental Analyzer Warning Adoption

**Status:** Accepted  
**Date:** 2026-09-14

## Context

The compiler warning policy is strict, while the current codebase still contains a
material Roslyn Code Analysis backlog. Treating every analyzer diagnostic as an
error immediately would block business delivery and encourage blanket suppression.

## Decision

Compiler warnings remain errors through `TreatWarningsAsErrors=true`.
`CodeAnalysisTreatWarningsAsErrors` remains temporarily false while analyzer debt
is burned down deliberately. Culture/globalization and deterministic string rules
(`CA13xx`, `CA1862`) take priority because the product supports `ar-EG` and `en-US`.
Reviewed modules should progressively reach zero applicable analyzer warnings and
may then opt into stricter enforcement.

## Consequences

- Closure/build evidence must report analyzer warnings honestly; an incremental
  up-to-date build is not evidence of zero warnings.
- New code should not add avoidable analyzer debt.
- Blanket suppression is not the cleanup strategy; rules are fixed, narrowly
  justified, or scoped only when the diagnostic is not applicable.
