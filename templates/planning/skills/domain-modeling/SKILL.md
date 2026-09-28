---
name: domain-modeling
description: Use after discovery or legacy analysis to define the glossary, entities, relationships, aggregates, lifecycle states, and business rules (phases C1–C2).
---
# Domain modeling

## Purpose

Turn workflows and evidence into a precise model the code can enforce: one meaning per word,
explicit relationships, clear ownership, and numbered rules that say where they are enforced.

## Inputs

- `02-glossary.md`, `04-capabilities.md`, `05-domain-model.md`, `06-business-rules.md`
- Track A: `legacy/behavior-catalog.md`, `legacy/defects.md`

## Procedure

### C1 — Glossary and model

1. **Glossary.** For each term: definition, synonyms to avoid, owner's term, example. Resolve
   conflicts ("Is a *client* the same as a *customer*?") with the owner and record decisions.
2. **Entities.** For each: purpose, identity (natural key vs generated ID; ID type), key
   attributes with type/required/max length/uniqueness scope, lifecycle states.
3. **Relationships.** For each edge record: cardinality, required/optional, delete behavior
   (restrict / cascade / set-null / soft-delete), whether history must survive, and whether a
   cross-tenant reference must be impossible at the database level.
4. **Aggregates.** Group entities that must change together consistently. One transaction
   changes one aggregate; cross-aggregate effects use explicit orchestration. Name the root.
5. **Ownership and tenancy.** Global (shared by all tenants) or tenant-owned? Uniqueness inside
   the tenant (`TenantId + Code`) or global?
6. **Identity vs profile.** Login accounts are separate from business profiles (Customer,
   Employee). Link them explicitly; never reuse the auth user ID as the business ID by default.

Draw the relationship graph in text in `05-domain-model.md`:

```text
Customer 1 ──< Order            required, restrict delete, tenant-scoped
Order    1 ──< OrderLine        required, cascade (same aggregate)
Product  1 ──< OrderLine        required, restrict (history)
```

### C2 — Business rules

For each rule in `06-business-rules.md`:

| Field | Meaning |
| --- | --- |
| ID | `BR-###`, permanent |
| Statement | One testable sentence ("An order total equals the sum of its lines minus discounts, rounded half-up to 2 decimals") |
| Type | invariant · validation · derivation · authorization · temporal · policy |
| Scope | entity/aggregate/capability |
| Enforced at | request validation · domain · database constraint · UI hint (never UI only) |
| Concurrency | none · row version · atomic update · unique index · serializable |
| Evidence | `[stated]` / `[legacy:…]` / `[decided D-…]` / `[assumption]` |
| Status | Draft · Confirmed · Superseded |

Rules must be testable. Rewrite vague rules ("orders should be valid") until each one can become
a test case.

Watch for rules that need database help: uniqueness, "exactly one of", capacity/stock limits,
cross-tenant references, and "cannot delete while referenced".

## Outputs

`02-glossary.md`, `05-domain-model.md`, `06-business-rules.md`, new questions and decisions.

## Quality bar

- No term in stories or rules is missing from the glossary.
- Every relationship has cardinality, required, and delete behavior.
- Every Confirmed rule has an enforcement location and evidence.
- Every entity is marked global or tenant-owned.

## Anti-patterns

- Mirroring the legacy schema or the UI forms as the model.
- Generic "Status" strings without a defined state machine.
- Rules enforced only in the UI.
- Cascade delete across aggregates or over historical records.
