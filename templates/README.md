# ERP platform templates

Reusable assets for building new modules on this ERP platform and, later, new product
workspaces derived from it. Imported on 2026-09-28 from the School Management template work and
governed by the plan `documentation/plans/business/erp-platform-template/`.

| Folder | Status | Purpose |
| --- | --- | --- |
| `planning/` | Imported, adaptation pending (slice S2) | Tool-agnostic planning kit and AI skills. Inside this repository `documentation/plans/` stays canonical; see `planning/ERP_MAPPING.md`. |
| `../packages/tokens/` | Imported, not yet adopted (slices S3–S4) | One design-token source for `web-next` (MUI adapter) and `mobile-react`. |

## Not imported (remain in the School repository as reference)

- `New-FullStackProject.ps1`, `api/`, `next/` content profiles and `conversion/`: they generate a
  Next.js + Clean Architecture workspace that does not match this modular monolith, MUI web client,
  or Expo client. The ERP replacement is the workspace generator (slice S5), built on the existing
  `api/scripts/New-ErpModule.ps1` and `web-next` `generate:module`.
- `PROMOTION_POLICY.md` and `assets/AGENTS.md`: replaced by this repository's `AGENTS.md`
  ("Shared component first"), `SHARED_REUSE_CATALOG.md`, and `SCREEN_PATTERN_CATALOG.md`.

## Rules

- A template asset is promoted from working code that passed its feature Phase 06, never written
  speculatively.
- Business rules, entity names, and permissions of a specific module never enter a template.
- Every change here is recorded in the `erp-platform-template` plan evidence or decisions.
