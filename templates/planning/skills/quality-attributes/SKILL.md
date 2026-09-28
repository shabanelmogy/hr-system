---
name: quality-attributes
description: Use to decide concurrency, retention and deletion, audit, time zones, localization, performance, availability, privacy, integrations, and files before stories are finalized (phase C4).
---
# Quality attributes and data policies

## Purpose

Capture the decisions that are cheap to make now and expensive to retrofit later. Each one
becomes a decision (`D-###`), a rule (`BR-###`), or an acceptance criterion.

## Inputs

- `05-domain-model.md`, `06-business-rules.md`, `03-actors-access.md`, `00-brief.md`
- Template defaults in `templates/api/TEMPLATE_GUIDE.md` (row version, atomic updates,
  transactions, idempotency, outbox, localization)

## Procedure

Walk through each topic with the owner. Propose the template default; record the decision.

| Topic | Decide | Template default |
| --- | --- | --- |
| Lost updates | Which entities need optimistic concurrency? | `rowversion` on records edited by several people; Base64 in API |
| Contested invariants | Capacity, stock, balances, sequences | atomic conditional update or serializable guard; unique index when possible |
| Duplicate submits | Which commands must be idempotent? | idempotency key for money/booking/external callbacks |
| Deletion | Hard delete, soft delete, archive, anonymize? Per entity | restrict delete when referenced; soft delete when history matters |
| Retention | How long is each data class kept? Legal requirements? | owner decides; record per data class |
| Audit | Which changes need who/when/before/after? | security/admin events audited; add business audit where required |
| Time | Tenant time zone? Store UTC? Date-only values? | store UTC + tenant time zone; `DateOnly` for calendar dates |
| Localization | Languages, RTL, number/date formats, translated data? | en/ar resources; stable error codes; localized messages |
| Performance | Peak users, data volume, response targets, report freshness | paginated lists, bounded lookups, indexed search fields |
| Availability | Downtime tolerance, backup, recovery point/time | owner decides |
| Privacy | PII fields, minors, export rules, masking | least privilege; no PII in logs |
| Integrations | Reliability needs when a partner is down | outbox for must-deliver messages; timeouts and retries |
| Files | Uploads, size/type limits, storage, virus scanning | abstraction in Application, provider in Infrastructure |
| Notifications | Channels, templates, opt-out | abstraction + background delivery |
| Observability | Logs, metrics, tracing, alerting | correlation IDs, health checks, OpenTelemetry hook |

## Outputs

`07-quality-attributes.md` with one section per topic, each linking to its decision/rule IDs.

## Quality bar

- Every entity edited concurrently has a concurrency decision.
- Every entity has a deletion/retention decision.
- Time zone and localization decisions exist before any story with dates or text.

## Anti-patterns

- Adding transactions, row versions, or outbox everywhere "to be safe".
- Postponing time zone and deletion decisions until after data exists.
- Logging request bodies with passwords, tokens, or personal data.
