# Old files archive

This folder preserves documentation that is no longer part of the active ERP
planning, implementation, verification, or customer-education workflow.

## Rules

- Files here are **historical archive only** and are not implementation authority.
- Active plans, recipes, required-file manifests, module guides, API/Web/Mobile
  profiles, and generated packets must not depend on files in this folder.
- Do not use an archived file as evidence of current runtime behavior.
- Do not register archived files in `recipe-manifest.json` or a
  `required-files.json`.
- If an archived idea becomes relevant again, verify current source and move only
  the still-valid knowledge into the current canonical document. Do not restore the
  old file as a parallel authority.

## Archived groups

- `project/` — superseded login/logout/auth/proxy fix and analysis snapshots.
- `api/` — obsolete geographic XML/user-story/data artifacts and the historical
  API workflow-hardening closure record.
- `mobile-react/` — superseded Mobile feature implementation guide.
- `system/features/address-types/` — completed draft manifests superseded by the
  registered final feature evidence.

The active documentation entry point remains `documentation/README.md`.
