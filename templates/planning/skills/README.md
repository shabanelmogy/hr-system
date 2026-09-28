# Skills index

Each skill is a self-contained playbook in `<name>/SKILL.md`. The frontmatter `description`
says when to use it; the body says how. Skills are plain Markdown so any assistant can load them:
read the file, then follow it.

| Skill | Use when |
| --- | --- |
| [`planning-orchestrator`](planning-orchestrator/SKILL.md) | Starting or resuming a session, choosing a track, moving between phases |
| [`business-discovery`](business-discovery/SKILL.md) | Discussing a new system or feature with the owner (B1–B3, E) |
| [`legacy-analysis`](legacy-analysis/SKILL.md) | Reading an existing application to migrate it (A1–A3) |
| [`domain-modeling`](domain-modeling/SKILL.md) | Glossary, entities, relationships, aggregates, business rules (C1–C2) |
| [`access-design`](access-design/SKILL.md) | Tenancy, roles, permissions, resource scope, IDOR (C3) |
| [`quality-attributes`](quality-attributes/SKILL.md) | Concurrency, retention, audit, time, i18n, performance, privacy (C4) |
| [`story-writing`](story-writing/SKILL.md) | Turning capabilities and rules into buildable stories (C5) |
| [`slice-planning`](slice-planning/SKILL.md) | Ordering vertical slices and producing the manifest (C6) |
| [`plan-review`](plan-review/SKILL.md) | Adversarial readiness review before building (C7) |
| [`feature-delivery`](feature-delivery/SKILL.md) | Implementing one slice end to end (D) |
| [`data-migration-planning`](data-migration-planning/SKILL.md) | Moving production data from a legacy system |
| [`template-promotion`](template-promotion/SKILL.md) | Promoting reusable changes into the templates (template repo only) |

## Writing a new skill

Keep the same structure so every skill reads the same way:

```markdown
---
name: kebab-case-name
description: One sentence — when to use this skill.
---
# Title
## Purpose
## Inputs            (files to read first)
## Procedure         (numbered steps)
## Outputs           (files and sections to write)
## Quality bar       (checks before finishing)
## Anti-patterns     (what not to do)
```

Register the skill in this index and in `START_HERE.md` §3.
