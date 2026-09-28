# Domain model

## Relationship graph

```text
<<Customer 1 ──< Order        required, restrict delete, tenant-scoped>>
```

## Aggregates

| Aggregate root | Contains | Invariants (BR) | Notes |
| --- | --- | --- | --- |
| <<Order>> | <<OrderLine>> | <<BR-003>> | |

## Entities

Template per entity:

```markdown
### <Entity>

- **Purpose:** …
- **Ownership:** tenant-owned | global
- **Identity:** generated int | guid | natural key (…)
- **Lifecycle states:** …
- **Deletion:** restrict | soft delete | archive | anonymize (D-###)
- **Concurrency:** none | row version | atomic update (D-###)

| Attribute | Type | Required | Max / precision | Unique (scope) | Notes |
| --- | --- | --- | --- | --- | --- |

| Relationship | Target | Cardinality | Required | Delete behavior | Cross-tenant blocked in DB | Notes |
| --- | --- | --- | --- | --- | --- | --- |
```
