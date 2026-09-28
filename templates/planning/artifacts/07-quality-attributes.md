# Quality attributes and data policies

Each section records the decision and links its ID.

## Concurrency and duplicates

| Entity / operation | Mechanism | Decision |
| --- | --- | --- |
| <<Invoice update>> | <<row version>> | <<D-###>> |

## Deletion and retention

| Entity / data class | Delete behavior | Retention | Legal basis | Decision |
| --- | --- | --- | --- | --- |

## Audit trail

<<Which changes record who/when/before/after; retention of audit data>>

## Time and dates

<<Storage (UTC), tenant time zone, date-only fields, week start, calendars>>

## Localization

<<Languages, RTL, number/date formats, translated data vs UI only>>

## Performance and volume

<<Peak concurrent users, records per year, response targets, report freshness>>

## Availability and recovery

<<Downtime tolerance, backup frequency, recovery objectives>>

## Privacy and security

<<PII fields, minors, masking, export controls, logging restrictions>>

## Integrations and messaging

<<Partners, direction, failure behavior, outbox needs, idempotency>>

## Files and media

<<Upload types/sizes, storage provider, scanning, access control>>

## Notifications

<<Events, channels, templates, opt-out>>

## Observability

<<Logs, metrics, tracing, alerts>>
