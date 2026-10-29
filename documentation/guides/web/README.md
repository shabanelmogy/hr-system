# Web (Next.js) documentation

Angular migration uses shared UI adapters over PrimeNG for every workflow widget.
Reuse or extend those adapters before adding a control. Plain browser select,
radio/checkbox/date/number widgets and unenhanced buttons are rejected by the
Angular architecture check, including external templates. Content/sidebar scrolling
uses shared `erp-scroll-viewport` over PrimeNG ScrollArea; context help uses
PrimeNG Tooltip. Context labels are complete on desktop and icon-only when the
viewport or available toolbar is at most1199px. See the current
[implementation evidence](../../modules/platform/features/angular-module-context-navigation/IMPLEMENTATION_REPORT.md).

## Architecture

| Document | Use it for |
| --- | --- |
| [ANGULAR_ENVIRONMENT.md](ANGULAR_ENVIRONMENT.md) | Angular `.env` API selection: local or hosted test API |
| [architecture/frontend-architecture-reference.md](architecture/frontend-architecture-reference.md) | Layering, ownership, shared components |
| [architecture/frontend-architecture-manifest.md](architecture/frontend-architecture-manifest.md) | Generated module/route ownership inventory |
| [architecture/business-feature-template.md](architecture/business-feature-template.md) | Shape of a new business feature |
| [architecture/module-generator.md](architecture/module-generator.md) | Frontend module generator |
| [architecture/performance-baseline.md](architecture/performance-baseline.md) | Performance budget and baseline |
| [ERP_FRONTEND_MASTER_PLAN.md](ERP_FRONTEND_MASTER_PLAN.md) | Frontend foundation plan (`frontend-foundation-hardening`) |
| [WEB_API_READINESS_REVIEW.md](WEB_API_READINESS_REVIEW.md) | Web/API contract readiness |
| [server-managed-feature-reference.md](server-managed-feature-reference.md) | Server-managed feature pattern |

## Feature books

Feature-specific books live with their module: `../../modules/<module>/features/<feature>/` (see [modules](../../modules/README.md)).
