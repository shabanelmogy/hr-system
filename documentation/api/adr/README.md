# API Architecture Decision Records

This directory preserves the rationale for architecture decisions that should
survive team and implementation changes. ADRs describe decisions and tradeoffs;
they do not replace `ERP_ARCHITECTURE_CONSTITUTION.md` or
`API_FEATURE_DEVELOPMENT_WORKFLOW.md`.

| ADR | Decision | Status |
| --- | --- | --- |
| [ADR-001](ADR-001-modular-monolith-module-ownership.md) | Modular monolith and single module ownership | Accepted |
| [ADR-002](ADR-002-module-project-shape.md) | Canonical six runtime projects plus module-owned tests | Accepted |
| [ADR-003](ADR-003-shared-database-schema-per-module.md) | Shared SQL database with schema-per-module ownership | Accepted |
| [ADR-004](ADR-004-cqrs-sender-boundary.md) | CQRS and `ISender` presentation boundary | Accepted |
| [ADR-005](ADR-005-cross-module-contracts-outbox-inbox.md) | Contracts-only cross-module dependencies and durable messaging | Accepted |
| [ADR-006](ADR-006-tenant-company-isolation.md) | Independent tenant and company isolation | Accepted |
| [ADR-007](ADR-007-analyzer-warning-adoption.md) | Incremental analyzer-debt burn-down without weakening compiler safety | Accepted |

Create a new ADR only when a material architecture choice has rationale or
tradeoffs that are not already captured here. Ordinary feature decisions belong
in the owning module/feature documentation.
