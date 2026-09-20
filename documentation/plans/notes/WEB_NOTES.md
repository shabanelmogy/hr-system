# Web Notes Index

This is the Web-focused index into the central note registries.

Do not duplicate full note details here. Add the canonical note to one of:
- `PRODUCTION_NOTES.md`
- `DEFERRED_ITEMS.md`
- `KNOWN_RISKS.md`
- `FOLLOW_UPS.md`
- `DECISION_BACKLOG.md`

Then reference its stable ID here.

## Active Web notes

| Note ID | Type | Area | Summary | Canonical registry |
| --- | --- | --- | --- | --- |
| PROD-001 | Production | Observability | Real Collector/dashboard/alert delivery must be verified in deployment. | `PRODUCTION_NOTES.md` |
| PROD-002 | Production | Authentication | Exercise real Google popup auth against the deployed origin. | `PRODUCTION_NOTES.md` |
| PROD-003 | Production | Realtime | Verify production SignalR connection/reconnect through the deployed origin. | `PRODUCTION_NOTES.md` |
| PROD-004 | Production | Reporting | Verify report/PDF viewers with representative deployment data. | `PRODUCTION_NOTES.md` |
| PROD-005 | Production | Files/Media | Verify deployed file upload/download/range/media flows. | `PRODUCTION_NOTES.md` |
| PROD-006 | Production | Background jobs | Verify deployed Hangfire access/session/CSP behavior. | `PRODUCTION_NOTES.md` |
| PROD-007 | Production | External frames | Verify configured external frames against final CSP. | `PRODUCTION_NOTES.md` |
| PROD-008 | Production | Demo Login | Demo Login is currently allowed in Production by product decision. | `PRODUCTION_NOTES.md` |
| DEF-001 | Deferred | i18n/performance | Active-language-only translation loading remains evidence-driven. | `DEFERRED_ITEMS.md` |
| DEF-002 | Deferred | Reporting/charts | Whole-dataset chart contracts reopen only when a real chart requires them. | `DEFERRED_ITEMS.md` |
| DEF-003 | Deferred | Realtime | Realtime-token hop reduction remains evidence-driven. | `DEFERRED_ITEMS.md` |
| DEF-004 | Deferred | Calendar/Kanban | Additional FullCalendar/Kanban tuning requires measured need. | `DEFERRED_ITEMS.md` |
| DEF-005 | Deferred | Entitlements | Fetch-on-intent optimization remains evidence-driven. | `DEFERRED_ITEMS.md` |
| PROD-019 | Production | Core authenticated release | Run the complete deployed baseline journey, not only special integration smokes. | `PRODUCTION_NOTES.md` |
| PROD-020 | Production | Managed Crystal publication | Managed report views require published compatible report versions and `Run` ACL evidence. | `PRODUCTION_NOTES.md` |
| FOLLOW-003 | Follow-up | API contract parity | Exhaustive generated API/Web contract diff remains future governance work. | `FOLLOW_UPS.md` |

## Web note checklist

Use `Surface = Web` or `Surface = Cross-platform` for browser/App Router/BFF,
shared UI, forms, accessibility, CSP, browser integrations, performance, and Web
release evidence.
