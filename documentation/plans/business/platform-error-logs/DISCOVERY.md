# Error logs — Discovery

Status: Draft; discovery active 2026-10-17. The requester supplied ErrorLogs.PNG
and ErrorLogs2.PNG as design/behavior references and authorized adding the feature.

## Verified facts

- The API logs unexpected exceptions through HostGlobalExceptionHandler and returns
  generic ProblemDetails; expected validation/conflict/security outcomes are distinct.
- Audit Trail captures successful data changes and cannot act as the error source.
- Web client telemetry already sends allowlisted classifications without raw error
  messages/stacks; Mobile has a telemetry-redaction helper and existing error boundaries.

## Requested decisions

- Confirmed by requester: Super Admin and each company with separate permissions.
  The selected question explicitly proposed complete technical details for Super
  Admin and company-only sanitized visibility without stack traces.
- Requested visual workflow: date/user filters, advanced filters, refresh, paged
  table, details grouped by user/action/error, and Excel export.
- Existing request scope carries API/Web/Mobile parity and deferred physical device
  acceptance. No acceptance of a generic UI wrapper or raw-JSON form is implied.

## Open decisions

- DEC-023: first-release error ingestion sources (API/jobs only, or also Web/Mobile).
- DEC-022: confirm proposed 90-day retention, append-only viewing/export,
  no manual modification/deletion, and sensitive parameter suppression.
- Parameters/custom data in screenshots show a target section, not authorization
  to persist arbitrary request bodies, tokens, credentials or job arguments.

## Planning consequences

Platform owns persistence and scoped reads; Host contributes capture through public
Contracts and generic lifecycle hooks. No cross-module table reads. Company scope
comes from trusted actor, not query-supplied tenant/company identifiers. Unscoped,
anonymous, pre-auth and startup incidents cannot be attributed to a company by
client input and must remain system-only. A sink failure must not replace the
original HTTP error or business/job result. No workflow may recursively log its own
storage failure. No collector/product dependency is introduced without evidence.

## Interview coverage

Outcome/current process: diagnose runtime failures from an in-app bounded list.
Actors/authority: confirmed scoped dual audience. Source of truth: new immutable
error records; no reuse of successful audit entries as error facts.
Lifecycle: proposed append-only + automatic retention, pending DEC-022.
Money/stock/people: no transactional business rules; personal/network metadata
requires minimal, bounded storage. Cross-module integration: capture via Contracts.
UI: read-only list/detail/export, both platforms; P-001 composition candidate to be
confirmed against current Audit Trail and shared component contracts.
Scale: source-dependent budgets, queue/backpressure and retention require definition.
Imports: Excluded (no error data-entry/import requirement). Notifications/realtime:
not requested; refresh/paging supplied by reference. Offline: proposed online-only
viewer, no durable device diagnostic cache. Historical migration: no existing
structured error store identified; do not claim historical console errors are imported.
Acceptance: scope/forbidden/redaction/capture-failure/paging/export tests plus live
schema and browser checks; device acceptance remains separately owned.

## Glossary

Error record: captured unexpected runtime failure, not a successful data change.
Correlation ID: existing trace/support reference used to locate a failure.
System incident: record without verified current company, visible to Super Admin.
Company projection: sanitized fields restricted to the actor's active company.
