---
name: plan-review
description: Use before building (phase C7) or after large plan changes, to adversarially review the plan for gaps, contradictions, and risks and decide whether gate GR passes.
---
# Plan review

## Purpose

Find what will hurt during the build **before** the build. Review as a skeptical senior engineer
and a skeptical business owner at the same time. The output is a list of findings and a gate
decision — not a rewrite of the plan.

## Inputs

All planning files, `checklists/gates.md`, `checklists/definition-of-ready.md`.

## Procedure

1. **Run the mechanical check** and record its result:

   ```powershell
   pwsh ./planning/_system/Test-PlanReadiness.ps1 -PlanningRoot ./planning [-Release R1]
   ```

   The script writes `planning/readiness-report.md`. Every error must be fixed (or waived by a
   decision) before the gate; review warnings one by one.
2. **Review lenses** — go through each and write findings:

   | Lens | Questions |
   | --- | --- |
   | Completeness | Every Must capability → stories → slices? Every actor has scope for every resource it touches? |
   | Consistency | Same term, same meaning everywhere? Rules that contradict each other? Stories that contradict decisions? |
   | Testability | Can every criterion become a test? Are error codes defined? |
   | Integrity | Uniqueness, "exactly one", capacity/stock, cross-tenant references enforced by the database where needed? |
   | Security | Any resource without a scope rule? Any action trusting client input for tenant/owner? Sensitive data exposure? |
   | Concurrency | Contested records and duplicate submits covered? |
   | Data lifecycle | Delete/retention/audit decided for each entity? |
   | Time & locale | Time zone and localization decided before date/text features? |
   | Dependencies | Slice order respects the domain graph? External dependencies (APIs, credentials, legal) identified with owners? |
   | Feasibility | Any L-size slice to split? Unknown technology? |
   | Migration (Track A) | Every legacy screen/defect dispositioned? Data migration blockers listed? |

3. **Severity.** Critical (build would produce wrong/insecure behavior), High (major rework
   likely), Medium (friction), Low (polish).
4. **Record.** Each Critical/High finding becomes a `Q-###` (Blocking = yes) or `R-###`. Medium/Low
   go to a short "Review notes" section in `status.md`.
5. **Decide the gate.** GR passes only when the checklist in `checklists/gates.md` is satisfied.
   A waiver needs an explicit decision with the accepted risk.

## Outputs

Findings in `11-open-questions.md` / `10-risks.md`, gate result in `status.md`, decision when the
owner approves.

## Quality bar

- Findings cite the exact file and ID they concern.
- No finding is "consider improving X" — each says what is wrong and what decision is needed.

## Anti-patterns

- Rubber-stamping because the documents are long.
- Rewriting the plan inside the review instead of raising findings.
- Blocking on Low findings.
