# ERP Platform Template — Research

| Topic | Finding | Source | Status |
| --- | --- | --- | --- |
| MUI theme compatibility | `createMuiThemeOptions()` output is accepted by `@mui/material` 9 `createTheme()` under a strict type check; typography variants must be type aliases (not interfaces) to satisfy MUI's CSSProperties index signature. | Local verification in the review session (E-032) | Verified |
| MediatR licensing | Versions after 12.5 moved to a commercial licence model. Alternatives: `Mediator` (martinothamar, MIT, source-generated) or an in-house dispatcher over the existing pipeline behaviors. | Project announcements; reconfirm at decision time | To reconfirm (DEC-011) |
| SQL client | `System.Data.SqlClient` is deprecated; `Microsoft.Data.SqlClient` is the supported driver (EF Core already uses it). | Microsoft package deprecation notice | Known |
| Chatter pattern | Odoo-style chatter: message thread, followers, scheduled activities, and change tracking on any record. Maps to the existing entity change log, notification inbox, and SignalR hub. | Product analysis | Input for S8 |
| Kanban pattern | Columns = workflow states owned by the module; card move = state transition command with concurrency token; accessible move action besides drag (already an `AGENTS.md` rule). | `AGENTS.md` drag rules; product analysis | Input for S6/S8 |
