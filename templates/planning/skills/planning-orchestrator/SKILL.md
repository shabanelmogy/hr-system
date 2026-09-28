---
name: planning-orchestrator
description: Use at the start or resume of any planning session, to choose the track, report status, and move the project between phases and gates.
---
# Planning orchestrator

## Purpose

Keep the project on one clear path: know where it is, what is blocking it, and what the next
useful step is. This skill does not produce business content itself; it routes to the skill that
does and keeps `status.md` honest.

## Inputs

- `planning/status.md`
- `planning/11-open-questions.md`, `planning/01-decisions.md` (latest entries)
- `_system/PROCESS.md` for phase definitions and gate criteria

## Procedure

1. **Locate.** Read `status.md`. If missing, ask: "Are we migrating an existing application,
   designing a new one, or adding a feature to this one?" Then create the planning workspace
   (`New-PlanningWorkspace.ps1`) or copy the artifacts.
2. **Report.** In 2–3 lines tell the user: track, current phase, last decision, blockers, and the
   one next step you propose.
3. **Decide the next step** using these rules, in order:
   1. A blocking open question for the current phase → ask it (with a proposed default).
   2. The current phase's outputs are incomplete → load that phase's skill.
   3. Outputs complete → run the phase's gate checklist (`checklists/gates.md`). If it passes, ask
      the owner to confirm, record the decision, advance the phase.
   4. Gate fails → list the failing items and fix the first one.
4. **Transition.** When advancing, update in `status.md`: phase, gate result with date, next
   actions. Record gate approvals as decisions (`D-###: Gate GB approved by owner`).
5. **Scope changes.** If the user introduces a new capability mid-phase, add it to
   `04-capabilities.md` as `Proposed`, add an impact note, and continue the current phase unless
   the user wants to switch.
6. **Parallel work.** Independent capabilities may be at different phases. Track them in the
   `status.md` capability table rather than forcing everything through one phase together.

## Outputs

- `status.md` always reflects reality: track, phase, gate table, capability table, next actions,
  blockers, last session summary.

## Quality bar

- The user can read `status.md` alone and know what happens next.
- No phase is marked complete while its gate has an unchecked item without a waiver decision.

## Anti-patterns

- Jumping to code or database design during discovery because it "seems obvious".
- Running every phase for a tiny change — Track E exists for that; scale the ceremony to the risk.
- Long monologues. Report briefly, then act or ask.
