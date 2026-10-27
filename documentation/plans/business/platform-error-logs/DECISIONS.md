# Error logs — Decisions

| Decision | State | Evidence |
| --- | --- | --- |
| Platform ownership; separate error facts from successful Audit Trail | Verified architecture / proposed implementation | EVIDENCE.md |
| Super Admin and company visibility with separate authority | Confirmed | Requester response 2026-10-17 |
| Company sanitized detail without raw stack; system detail Super Admin-only | Confirmed selected option context | Requester response 2026-10-17 |
| Ingestion sources | Resolved DEC-023 | API, jobs, Web and Mobile; requester 2026-10-17 |
| Retention and append-only/export scope | Resolved DEC-022 | Global SuperAdmin setting, default 90/range 1..3650, bounded cleanup/export; requester 2026-10-17 |
| Permission metadata | Confirmed architecture | Tenant `ErrorLogs:View/ViewDetails/Export`; global `SystemErrorLogs:View/ViewDetails/Export` and `ErrorLogSettings:View/Edit` |
