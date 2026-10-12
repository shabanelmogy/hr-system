# ERP platform templates

Home of the new-product workspace generator (`New-ErpWorkspace.ps1`, slice S5 of
`documentation/plans/business/erp-platform-template/`). It does not exist yet; until it does,
new products are not started from this folder.

How work is planned and delivered in this repository:

| Need | Where |
| --- | --- |
| Plan a module or feature | `documentation/plans/README.md` and the `erp-business-planning` skill |
| Bring an external application or its data into ERP | the `erp-legacy-migration` skill |
| Deliver a planned feature (phases 00-07) | `documentation/system/README.md` and the `erp-api-development`, `erp-web-development`, `erp-mobile-development` skills |
| Create a new runtime module | `api/scripts/New-ErpModule.ps1` and the web `generate:module` |
| Design tokens shared by web and mobile | `packages/tokens/` |

The planning kit imported on 2026-09-28 (`templates/planning/`) was retired on 2026-10-12
(D-013): its discovery question bank, worked example, glossary, and Definition of Ready/Done
moved into `.codex/skills/erp-business-planning/references/`; everything else already existed
in `documentation/plans/`.

## Rules

- A template asset is promoted from working code that passed its feature Phase 06, never written
  speculatively.
- Business rules, entity names, and permissions of a specific module never enter a template.
- Every change here is recorded in the `erp-platform-template` plan evidence or decisions.
