# Mobile Notes Index

This is the Mobile-focused index into the central note registries.

Do not duplicate full note details here. Add the canonical note to one of:
- `PRODUCTION_NOTES.md`
- `DEFERRED_ITEMS.md`
- `KNOWN_RISKS.md`
- `FOLLOW_UPS.md`
- `DECISION_BACKLOG.md`

Then reference its stable ID here.

## Active Mobile notes

| Note ID | Type | Area | Summary | Canonical registry |
| --- | --- | --- | --- | --- |
| PROD-009 | Production | EAS release | Real signed and installed release artifacts remain required. | `PRODUCTION_NOTES.md` |
| PROD-010 | Production | Hosted E2E | Authenticated device journeys require a deployed API and release-like build. | `PRODUCTION_NOTES.md` |
| PROD-011 | Production | API drift | Hosted Swagger/API drift evidence is required after API contract changes. | `PRODUCTION_NOTES.md` |
| PROD-012 | Production | Deep links | Final App/Universal Link associations require host/signing/device evidence. | `PRODUCTION_NOTES.md` |
| PROD-013 | Production | Observability | Observe/source-map processing needs a real EAS artifact. | `PRODUCTION_NOTES.md` |
| PROD-014 | Production | Accessibility/RTL | Physical phone/tablet UX matrix remains a release gate. | `PRODUCTION_NOTES.md` |
| PROD-015 | Production | Performance | Installed-release performance budgets remain unmeasured. | `PRODUCTION_NOTES.md` |
| PROD-020 | Production | Managed Crystal publication | Managed mobile report flows require a published compatible report version and `Run` ACL. | `PRODUCTION_NOTES.md` |
| DEF-011 | Deferred | Attendance | Mobile attendance-device workflow waits for provider/device and hosted API contracts. | `DEFERRED_ITEMS.md` |
| DEF-012 | Deferred | Push notifications | Native push waits for device registration and privacy contracts. | `DEFERRED_ITEMS.md` |
| DEF-013 | Deferred | Approvals | Cross-module approvals inbox waits for shared workflow ownership/API. | `DEFERRED_ITEMS.md` |
| DEF-014 | Deferred | Barcode | Scanner integration waits for Required POS/Inventory device workflow. | `DEFERRED_ITEMS.md` |
| DEF-015 | Deferred | Printing | Printer integration waits for protocol/hardware decisions. | `DEFERRED_ITEMS.md` |
| DEF-016 | Deferred | Search | Global ERP search waits for cross-module search and authorization contracts. | `DEFERRED_ITEMS.md` |
| DEC-004 | Decision | Mobile product boundary | ESS-only versus full-admin scope must be decided before broad mobile expansion. | `DECISION_BACKLOG.md` |

## Mobile note checklist

Use `Surface = Mobile` or `Surface = Cross-platform` for items involving:
- Expo/React Native navigation and route manifests;
- offline-first policy;
- SQLite/local persistence;
- sync/conflict resolution;
- background refresh;
- deep links and notifications;
- mobile permissions/auth/session behavior;
- camera/file/device APIs;
- RTL/responsive/native accessibility;
- app lifecycle/resume;
- connectivity loss/retry;
- release signing/store/build requirements;
- device-only production smoke.

A business plan cannot become `Implementation Ready` while a blocking Required
Mobile decision is recorded only as an unresolved note.
