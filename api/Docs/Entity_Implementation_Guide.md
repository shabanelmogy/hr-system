# Entity Implementation Guide

This checklist applies to new backend entities and use cases. Read Domain_Development_Guide.md first; it is the architectural source of truth.

## 1. Classify before coding

Choose one:

1. Rich business entity: protects a real workflow, invariant, effective period, money, capacity, or state transition.
2. Simple CRUD/reference entity: stores lookup or descriptive data.
3. Overengineered entity: contains abstractions or methods without current business value.
4. Too-anemic entity: exposes setters that allow callers to bypass a real rule.

Do not inherit from an auditable base or add domain methods automatically. Ownership and behavior decide the shape.

## 2. Confirm ownership

- Decide whether the record is global, tenant-scoped, or company-scoped.
- Tenant/company ownership is a security boundary, not a UI filter.
- Company business keys use indexes that include TenantId and CompanyId.
- Verify every related ID exists and belongs to the same permitted tenant/company in Application.
- Domain entities receive IDs and values; they never query EF Core.

## 3. Model behavior

For a rich entity:

- Use private business setters.
- Create valid state through a constructor or factory.
- Name methods after business actions such as Approve, Reject, Activate, Suspend, Terminate, or Reschedule.
- Pass effective dates and current UTC time into methods.
- Throw DomainRuleException with a stable code for invalid business transitions.
- Add focused unit tests for successful and rejected transitions.

For a simple entity:

- Keep plain properties and avoid ceremonial update methods.
- Put request shape and database-backed checks in Application validators.
- Keep database uniqueness and foreign keys as the final authority.

## 4. Build the use case

Follow this trace:

API endpoint -> MediatR command/query -> Application handler -> Domain method -> IUnitOfWork.SaveChangesAsync -> Infrastructure persistence

- API handles HTTP, authorization attributes, and response translation.
- Application orchestrates the use case and validates external state.
- Domain protects entity-owned rules.
- Infrastructure implements EF Core, files, email, jobs, and integrations.
- Do not add a generic repository, generic handler, or domain event unless a current use case benefits from it.

## 5. Contracts and validation

- Use separate create and update contracts when their fields differ.
- A create ID is absent or nullable; validators do not validate generated IDs.
- Validate every property for required state, length, range, format, and parent ID.
- Add localized English and Arabic keys for every user-facing validation or error message.
- Use narrow feature validation-query interfaces for async existence/uniqueness checks.
- Do not inject ApplicationDbContext into Application validators.
- Database constraints and conflict handling remain required for race conditions.

## 6. Persistence review

Before creating a migration, confirm:

- table and column names;
- required lengths and precision;
- tenant/company indexes;
- foreign keys and delete behavior;
- concurrency token;
- soft-delete and restore policy;
- whether deleted rows reserve unique business keys;
- migration behavior for existing data.

ApplicationDbContext stamps audit values. Calling Remove on an AuditableEntity becomes a soft delete. Normal queries must include !IsDeleted; restore queries opt into deleted rows.

Do not generate persistence for a domain draft merely to make it compile. An entity may remain explicitly ignored until its use cases and relationships are reviewed.

## 7. Query and response rules

- Use AsNoTracking for read-only queries.
- Project only required fields into response models.
- Avoid returning EF entities.
- Use pagination for unbounded collections.
- Make filtering, sorting, and query parameters explicit and validated.
- Never expose credential hashes or private storage paths.

## 8. Side effects

- Save the business change before scheduling non-critical notification work.
- Realtime, email, and Hangfire failures must not make a committed CRUD operation appear unsuccessful.
- Use the established realtime/outbox infrastructure where reliable cross-client data refresh is required.
- Add domain events only for business facts that other behavior truly depends on.

## 9. Required tests

- Domain invariants and transitions for rich entities.
- Validator parity with entity and database constraints.
- Handler success, not found, conflict, cancellation, and tenant/company denial.
- Persistence indexes, relationships, delete behavior, and isolation.
- API authorization and Problem Details.
- Migration data conversion when an existing column changes meaning.

## 10. Review gate

Before merging, answer:

- What classification is this entity, and why?
- Which rules belong to the entity?
- Which checks require the database or current actor?
- Can another tenant/company access or reference this record?
- Can a failed side effect make a successful write look failed?
- Are current-time calls supplied through TimeProvider?
- Is any abstraction present only for a hypothetical future need?

Prefer the smallest design that protects current business rules and leaves the use case easy to trace.

**Document version:** 2.0
**Last updated:** 2026-08-11
