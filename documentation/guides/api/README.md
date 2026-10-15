# API documentation

Backend guides for the .NET modular monolith. Start feature work with the
[API feature development workflow](API_FEATURE_DEVELOPMENT_WORKFLOW.md); the
[architecture constitution](ERP_ARCHITECTURE_CONSTITUTION.md) is the authority
when a guide and the code disagree.

## Architecture and rules

| Document | Use it for |
| --- | --- |
| [ERP_ARCHITECTURE_CONSTITUTION.md](ERP_ARCHITECTURE_CONSTITUTION.md) | Non-negotiable architecture rules |
| [MODULAR_MONOLITH_ARCHITECTURE.md](MODULAR_MONOLITH_ARCHITECTURE.md) | Module shape, ownership, unit of work, generator |
| [adr/README.md](adr/README.md) | Architecture decision records |
| [Clean_Architecture_CQRS_Guide.md](Clean_Architecture_CQRS_Guide.md) | Controller → ISender → handler → port layering |
| [Domain_Development_Guide.md](Domain_Development_Guide.md) | How much behavior belongs in a Domain model |
| [Realtime_Updates_Guide.md](Realtime_Updates_Guide.md) | SignalR events after commit |
| [FOUNDATION_CLOSURE_MATRIX.md](FOUNDATION_CLOSURE_MATRIX.md) | Evidence that the API foundation is closed |

## Configuration and operations

| Document | Use it for |
| --- | --- |
| [Authentication_Configuration.md](Authentication_Configuration.md) | JWT, external sign-in, and secret handling |
| [Operational_Foundation.md](Operational_Foundation.md) | Logging, correlation, health, background jobs |
| [PRODUCTION_DEPLOYMENT_RUNBOOK.md](PRODUCTION_DEPLOYMENT_RUNBOOK.md) | Publishing and verifying a release |
| [MIGRATIONS_COMMANDS_AR.md](MIGRATIONS_COMMANDS_AR.md) | أوامر الـ migrations بالعربي مع أمثلة |
| [AUDIT_TRAIL.md](AUDIT_TRAIL.md) | سجل العمليات التلقائي: إيه اللي بيتسجل، الـ API، وإزاي تضيفه لموديول جديد |

## Feature books

Feature-specific books live with their module: `../../modules/<module>/features/<feature>/` (see [modules](../../modules/README.md)).
