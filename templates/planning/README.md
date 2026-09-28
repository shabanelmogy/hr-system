# Planning System

> **In the ERP repository:** `documentation/plans/` is canonical. Read `ERP_MAPPING.md` first;
> it maps every skill, artifact, and gate in this kit to the ERP protocol (P0–P9, G0–G4).

A tool-agnostic planning and delivery system for the full-stack template. It turns either an
**existing application** or a **new business idea** into an **executable, verifiable plan**, and
then guides the build one vertical slice at a time.

Any AI coding assistant (or a human) can run it: everything is plain Markdown, JSON, and
PowerShell. The files are the memory — a new session resumes by reading `planning/status.md`.

## Two ways in, one way out

```text
 Track A — MIGRATE (brownfield)          Track B — DESIGN (greenfield)
 ─────────────────────────────           ─────────────────────────────
 A1 Intake & inventory                   B1 Vision & scope
 A2 Behavior extraction                  B2 Actors & capabilities
 A3 Defects & risks                      B3 Workflows & events
              \                          /
               ▼                        ▼
        C1 Domain model & glossary
        C2 Business rules & invariants
        C3 Access: roles, permissions, resource scope, tenancy
        C4 Quality attributes & data policies
        C5 User stories & acceptance criteria
        C6 Slice plan + conversion manifest
        C7 Plan review  ──►  GATE: Ready to build
               │
               ▼
        D  Build loop (one slice at a time) → verify → promote → handoff
```

A third, lighter entry — **Track E, Extend** — adds a feature to an application that already
uses this system: it runs C1–C7 for the new capability only.

## Folder layout

| Path | Purpose |
| --- | --- |
| `START_HERE.md` | Entry point for the AI assistant. Read first, every session. |
| `PROCESS.md` | Phases, gates, exit criteria, and which skill runs where. |
| `skills/` | Reusable playbooks (`SKILL.md`) the assistant loads for each activity. |
| `artifacts/` | Blank planning documents copied into each project's `planning/` folder. |
| `checklists/` | Gate checklists, Definition of Ready, Definition of Done. |
| `examples/` | A short worked example of a discovery session and its outputs. |
| `New-PlanningWorkspace.ps1` | Creates a `planning/` folder (`-Mode Design`, `Migrate`, or `Extend`); copies the system into `planning/_system/` and adds `AGENTS.md`. |
| `Test-PlanReadiness.ps1` | Mechanical gate check: missing artifacts, blocking questions, broken traceability, invalid manifest. |

## Quick start

### New system (greenfield)

```powershell
.\templates\planning\New-PlanningWorkspace.ps1 -Destination G:\projects\clinic -Mode Design -ProjectName "Clinic Portal"
```

Open the destination in your AI assistant and say:

> Read `AGENTS.md` and start planning. I want to discuss the business first.

### Existing application (brownfield)

```powershell
.\templates\planning\New-PlanningWorkspace.ps1 -Destination G:\projects\crm-new -Mode Migrate -Source G:\legacy\crm -ProjectName "CRM"
```

The script runs the source analyzer and writes `planning/legacy/inventory.md`. Then:

> Read `AGENTS.md`. Analyze the legacy application in `<source path>` and continue the plan.

### Check the plan

```powershell
pwsh G:\projects\clinic\planning\_system\Test-PlanReadiness.ps1 -PlanningRoot G:\projects\clinic\planning
```

When the check passes **and** the `plan-review` skill finds no blocking issue, generate the
workspace from the approved manifest:

```powershell
.\templates\New-FullStackProject.ps1 -Manifest G:\projects\clinic\planning\conversion-manifest.json -Destination G:\projects\clinic\app
```

The generator copies the `planning/` folder and `AGENTS.md` into the new workspace, so the build
phase continues with the same documents.

## Principles

1. **Evidence before design.** Every rule, relationship, and permission carries its source:
   `[stated]` by the owner, `[legacy:path#L]` from code, `[decided D-###]`, or `[assumption]`.
   Assumptions are allowed only when they are recorded and reviewed.
2. **Decisions are explicit.** Nothing important lives only in chat. Answers become decisions
   (`D-###`), rules (`BR-###`), questions (`Q-###`), risks (`R-###`), and stories.
3. **Traceability.** Slice → stories → rules/decisions → evidence. The readiness check follows
   those links.
4. **Small, vertical, verifiable.** A slice delivers one business outcome end to end (API, UI,
   authorization, tests) and has acceptance criteria someone can check.
5. **Stop on missing business decisions.** Mark the item blocked, move to an independent item,
   and never invent a business rule to keep going.
6. **Humans own the business; the assistant owns rigor.** The assistant asks, structures,
   challenges, and records. The owner decides.

## Workspace layout created by the script

```text
<project>/
  AGENTS.md                 tool-agnostic entry point for any AI assistant
  planning/
    status.md, 00-brief.md … 11-open-questions.md
    legacy/, migration/     (Migrate mode)
    conversion-manifest.json   (added in phase C6)
    readiness-report.md        (written by the readiness check)
    _system/                START_HERE, PROCESS, skills, checklists, examples, scripts, VERSION
```

`_system/` is a copy of this folder at a given template version. Refresh it with
`New-PlanningWorkspace.ps1 -Destination <project> -Mode Extend -RefreshSystem`. The planning
documents themselves are never overwritten.

## Requirements

PowerShell 7+ (`pwsh`) is recommended on every OS; the scripts also run on Windows PowerShell 5.1.
