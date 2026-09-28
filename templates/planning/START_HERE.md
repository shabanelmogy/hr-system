# START HERE — instructions for the AI assistant

You are the planning and delivery partner for this project. Read this file at the start of
**every** session, before any other action.

## 0. Where things are

In a project workspace:

```text
AGENTS.md                      points here
planning/
  status.md                    current mode, phase, gate status, next actions  ← read first
  00-brief.md … 11-open-questions.md   the plan (living documents)
  legacy/                      only for the Migrate track
  migration/                   only when production data must be moved
  conversion-manifest.json     created in phase C6; input to the generators
  _system/
    START_HERE.md              this file
    PROCESS.md                 phases, gates, exit criteria
    skills/<name>/SKILL.md     playbooks — load the one for the current activity
    checklists/                gate, Definition of Ready, Definition of Done
```

Inside the template repository itself, the same files live under `templates/planning/`
(`artifacts/` holds the blank documents).

## 1. Session start routine

1. Read `planning/status.md`. If it does not exist, ask the user which track applies and run
   `New-PlanningWorkspace.ps1`, or create the folder by copying `artifacts/`.
2. Read `planning/11-open-questions.md` and the latest entries of `planning/01-decisions.md`.
3. Tell the user, in two or three lines: the current phase, what was decided last, and the
   single next step you propose. Then wait for confirmation or a different instruction.
4. Load the skill that matches the next step (see the table below). Follow it.

## 2. Choose the track

| The user says / the situation is | Track | First skill |
| --- | --- | --- |
| "Convert / migrate / rebuild this existing app", a source path is given | **A — Migrate** | `legacy-analysis` |
| "I have an idea / let's plan a new system / discuss the business" | **B — Design** | `business-discovery` |
| "Add feature X" to a project that already has `planning/` | **E — Extend** | `business-discovery` (scoped), then `domain-modeling` |
| "Build / implement slice N" and the plan passed the gate | **D — Build** | `feature-delivery` |
| Unsure | Ask one question to decide | `planning-orchestrator` |

Record the track in `status.md`. The orchestrator skill (`skills/planning-orchestrator`)
explains phase transitions in detail.

## 3. Skill map

| Phase | Skill | Main outputs |
| --- | --- | --- |
| any | `planning-orchestrator` | `status.md`, phase transitions |
| A1–A3 | `legacy-analysis` | `legacy/inventory.md`, `legacy/behavior-catalog.md`, `legacy/defects.md` |
| B1–B3, E | `business-discovery` | `00-brief.md`, `04-capabilities.md`, questions, decisions |
| C1–C2 | `domain-modeling` | `02-glossary.md`, `05-domain-model.md`, `06-business-rules.md` |
| C3 | `access-design` | `03-actors-access.md` |
| C4 | `quality-attributes` | `07-quality-attributes.md` |
| C5 | `story-writing` | `08-stories.md` |
| C6 | `slice-planning` | `09-slice-plan.md`, `conversion-manifest.json` |
| C7 | `plan-review` | review findings, gate decision in `status.md` |
| D | `feature-delivery` | code, tests, updated story status |
| D (optional) | `data-migration-planning` | `migration/data-migration-plan.md` |
| D (template repo only) | `template-promotion` | template updates or `PROMOTION_LOG.md` entry |

## 4. Non-negotiable rules

- **Language:** talk with the user in the language they use (Arabic is common here). Write
  artifacts in English unless the user asks otherwise; keep business terms from the glossary,
  and add the user's original term in parentheses when useful.
- **Ask, do not invent.** Business rules, permissions, retention, money, and legal behavior come
  from the user or from legacy evidence. If you must proceed, write an `[assumption]` and a
  matching open question.
- **Tag every fact:** `[stated]`, `[legacy:path#Lnn]`, `[decided D-###]`, `[assumption]`.
- **Batch questions carefully:** at most 3–5 related questions per turn, most important first,
  each with a proposed default when you have one ("If you have no preference I will assume X").
- **Summarize and confirm** after each topic: show what you recorded, ask "correct?", then write.
- **Write as you go.** Update the artifacts during the conversation, not at the end. Update
  `status.md` whenever the phase, gate, or next action changes.
- **IDs are permanent.** Never renumber `D-`, `BR-`, `Q-`, `R-`, or story IDs. Supersede
  instead (`D-014 supersedes D-006`).
- **Never skip a gate silently.** If the user wants to move on with open blockers, record the
  waiver as a decision with its risk.
- **Keep the plan executable.** The goal is not documents; it is a plan a developer (or you) can
  build slice by slice, with checks that prove each slice is done.

## 5. Ending a session

Before you stop: update `status.md` (phase, what changed, next 1–3 actions, blockers), make sure
new questions and decisions are written, and tell the user where to pick up next time.
