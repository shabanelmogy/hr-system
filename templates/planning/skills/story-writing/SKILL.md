---
name: story-writing
description: Use to turn confirmed capabilities, rules, and access decisions into buildable user stories with testable acceptance criteria and stable error codes (phase C5).
---
# Story writing

## Purpose

Produce stories a developer can build and a reviewer can verify without asking the owner again.

## Inputs

`04-capabilities.md`, `05-domain-model.md`, `06-business-rules.md`, `03-actors-access.md`,
`07-quality-attributes.md`, `checklists/definition-of-ready.md`.

## Story format (exact — the readiness script parses it)

```markdown
### CRM-001 — Maintain the customer directory

- **Status:** Draft | Ready | Blocked | In progress | Done
- **Capability:** CAP-02
- **Actor:** Account manager
- **Goal:** Keep an accurate list of the tenant's customers so orders can reference them.
- **Rules:** BR-001, BR-004
- **Permissions:** Customers.Read, Customers.Create, Customers.Update
- **Scope:** Current tenant only (all customers of the tenant)
- **Acceptance criteria:**
  1. Given a customer named " Acme " exists, when I create "acme", then I get 409 `Customers.NameAlreadyExists`.
  2. Given 60 customers, when I list page 2 with size 25, then I see items 26–50 ordered by name then id.
  3. Given I lack `Customers.Create`, when I create a customer, then I get 403 and nothing is saved.
- **Failure cases:** `Customers.NotFound` (404), `Customers.NameAlreadyExists` (409), `Customers.ConcurrencyConflict` (409)
- **UI:** list with search and pagination; create/edit dialog; delete with confirmation
- **Notes:** —
- **Open questions:** none
```

Story IDs use an area prefix and a number (`CRM-001`, `BILL-004`); they must match
`^[A-Z][A-Z0-9-]+$` and never change.

## Procedure

1. For each Must capability, split into stories by **business outcome**, not by screen or CRUD
   verb. "Book an appointment" and "Cancel an appointment" are separate; "Appointments CRUD" is not
   a story.
2. Split further when a story needs more than one aggregate change, more than one actor, or more
   than ~2 days of work.
3. Link every story to the rules it must enforce and the permissions/scope from
   `03-actors-access.md`.
4. Write acceptance criteria as Given/When/Then. Cover: happy path, each linked rule, an
   authorization negative case, a scope/IDOR case, a concurrency or duplicate case when relevant,
   and validation failures.
5. Name failure cases with stable codes `Area.Reason` and HTTP status.
6. Track A: reference the legacy behavior entry (`SCR-04`) and state if the UI must be preserved.
7. Mark `Ready` only when `checklists/definition-of-ready.md` is satisfied; otherwise `Draft` or
   `Blocked` with the question ID.

## Outputs

`08-stories.md`.

## Quality bar

- Every acceptance criterion can become an automated test.
- Every rule linked in the story appears in at least one criterion.
- No story mixes actors or bundles unrelated outcomes.

## Anti-patterns

- "As a user I want CRUD for X."
- Criteria like "works correctly", "is fast", "is secure".
- Stories without a negative authorization case.
