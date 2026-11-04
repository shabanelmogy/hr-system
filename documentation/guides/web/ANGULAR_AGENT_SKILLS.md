# Angular agent skills

The official Angular developer skill is installed in this repository to support
work on `web-angular/`. This is development tooling; it does not change application
behavior or dependencies.

## Installed source

| Item | Value |
| --- | --- |
| Upstream | [angular/skills](https://github.com/angular/skills) |
| Skill | [angular-developer](../../../.codex/skills/angular-developer/SKILL.md) |
| Pinned commit | `2a2b801eb9bf3304424ddedfa1ace347e1fff6a6` |
| Upstream directory | [angular-developer at the pinned commit](https://github.com/angular/skills/tree/2a2b801eb9bf3304424ddedfa1ace347e1fff6a6/angular-developer) |
| Installation date | 2026-11-01 |
| Skill metadata | Version `1.0`, MIT, Copyright 2026 Google LLC |
| Contents | Upstream `SKILL.md` and all 43 reference documents, without local edits |
| Destination | `.codex/skills/angular-developer/` (repository scoped) |
| Version verified at installation | Angular `22.2.3`, CLI `22.2.5`, PrimeNG `22.1.4` in `web-angular/package.json` |

The upstream `angular-new-app` skill is not installed because this workspace
already has an Angular application. Revisit that choice when creating a separate
application is explicitly in scope.

## Using the skill

The root [AGENTS.md](../../../AGENTS.md) routes Angular work to this skill. Read
`SKILL.md` first and load only the references needed for the current task, such as
signals, components, dependency injection, routing, HTTP, forms, or testing.
The installed skill becomes available to Codex on the next turn. A requester can
also explicitly ask to use `angular-developer` when describing an Angular task.

Use the official skill for Angular framework guidance together with the existing
ERP planning process, the owning feature books, and the
[Angular Clean Code policy](architecture/ANGULAR_CODE_STYLE.md). The
`erp-web-development` skill targets `web-next/`; do not apply its React-specific
implementation instructions to `web-angular/`.

Repository requirements govern how upstream guidance is applied:

- Inspect the current installed versions before choosing Angular APIs; installing
  a skill does not authorize upgrading packages or running framework migrations.
- Reuse or extend shared UI adapters over PrimeNG, including `MyDataGrid`, and
  consult the PrimeNG MCP before changing shared controls as required by policy.
  Generic ARIA or native-control examples do not replace these shared components.
- Preserve the established Angular Reactive Forms and shared form contracts.
  Upstream preferences for Signal Forms in new forms do not authorize migrating
  the ERP form system.
- Keep templates in external HTML files and styles in external SCSS files when
  needed, with a matching component folder. Adapt inline upstream examples to
  this structure; do not copy their inline component resources.
- Keep HTTP access in its owning data/service layer and business state outside
  visual components. Framework HTTP examples do not change ownership boundaries.
- Use the existing npm scripts and CLI wrapper from `web-angular/`. Runtime edits
  still require formatting, lint, architecture checks, and the full `npm run check`.

## Installation and updates

The initial installation used the bundled `skill-installer` helper with
`--repo angular/skills`, the pinned commit as `--ref`,
`--path angular-developer`, and the repository `.codex/skills` directory as `--dest`.
It installs agent instructions and reference files, not an npm dependency.

For a future update, review upstream changes and compatibility with the installed
Angular version first. Use the installer with a reviewed commit and a separate
staging destination; it refuses to overwrite an existing skill directory. Compare
the staged files, then replace only this vendored skill directory and update the
provenance above in the same change. Preserve upstream files without local edits;
keep ERP-specific adaptations in this guide and root `AGENTS.md`.

Verify every installed file against the pinned upstream Git blob hashes and check
that the relative Markdown reference links in `SKILL.md` resolve. A skill-only
update requires those integrity checks; runtime quality gates apply when runtime
source changes.
