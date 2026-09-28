# Planning and delivery process

This file defines the phases, their outputs, and the gates between them. The assistant moves
the project forward one phase at a time and records the position in `planning/status.md`.

Gate IDs are used in `status.md` and by `Test-PlanReadiness.ps1`.

---

## Track A — Migrate an existing application

### A1 — Intake and inventory

- **Skill:** `legacy-analysis`
- **Inputs:** source path, how to run it, database schema access, auth provider, known pain points.
- **Automation:** `templates/conversion/Analyze-NextProject.ps1` (pages, route handlers, Server
  Actions, Prisma models, auth/data packages). For a separate Node backend (Express, Nest,
  Fastify) or Pages Router, the skill lists what to inventory by hand.
- **Outputs:** `legacy/inventory.md` (complete lists: screens, endpoints, actions, models, jobs,
  integrations, environment variables).

### A2 — Behavior extraction

- **Outputs:** `legacy/behavior-catalog.md` — for each screen and workflow: actor, trigger, inputs,
  validations, side effects, data touched, authorization actually enforced. Every line cites
  `[legacy:path#L]`.
- The catalog records **what the system does**, including what it does wrong. It does not decide
  what the new system should do.

### A3 — Defects, risks, and non-requirements

- **Outputs:** `legacy/defects.md` (security gaps, broken or placeholder features, data-integrity
  holes, race conditions, demo/hardcoded values) and entries in `10-risks.md`.
- Each defect gets a disposition: *fix in target*, *preserve deliberately*, or *drop*, recorded as
  a decision.

**Gate GA — Legacy understood**

- [ ] Every screen/endpoint/action in the inventory appears in the behavior catalog or is marked
      out of scope with a reason.
- [ ] Every defect has a disposition decision.
- [ ] The UI-preservation policy is decided (preserve exactly / preserve flows / redesign allowed).
- [ ] Data migration is in or out of scope (decision).

Then continue with **C1**.

---

## Track B — Design a new system

### B1 — Vision and scope

- **Skill:** `business-discovery`
- **Outputs:** `00-brief.md` — problem, users, goals and success measures, in scope, out of
  scope, constraints (budget, deadline, regulation, hosting), first release definition.

### B2 — Actors and capabilities

- **Outputs:** actor list in `03-actors-access.md` (names and goals only for now) and the
  capability map in `04-capabilities.md` (what the business must be able to do, grouped by area,
  prioritized MoSCoW).

### B3 — Workflows and events

- **Outputs:** for each Must capability, the main workflow in `04-capabilities.md`: trigger →
  steps → business events → end state, with exceptions ("what if it fails / is cancelled / is
  late?"). Glossary terms start in `02-glossary.md`.

**Gate GB — Business understood**

- [ ] The owner confirmed the brief (decision recorded).
- [ ] Every Must capability has a described workflow and at least one exception path.
- [ ] Every actor has a goal and appears in at least one workflow.
- [ ] No blocking question is open for Must capabilities.

Then continue with **C1**.

---

## Common phases (both tracks)

### C1 — Domain model and glossary

- **Skill:** `domain-modeling`
- **Outputs:** `02-glossary.md` (one meaning per term), `05-domain-model.md` (entities, key
  attributes, relationships with cardinality/required/delete behavior, aggregates, ownership,
  tenant scope, lifecycle states).

### C2 — Business rules and invariants

- **Skill:** `domain-modeling`
- **Outputs:** `06-business-rules.md` — numbered `BR-###`, each with type (invariant, validation,
  derivation, authorization, temporal, policy), where it is enforced (UI, API validation, domain,
  database), and its evidence tag.

### C3 — Access design

- **Skill:** `access-design`
- **Outputs:** `03-actors-access.md` — tenant model, roles vs permissions, permission catalog
  (`Resource.Action`), resource-scope rules per actor ("Teacher reads Students **in classes they
  teach**"), IDOR policy, platform vs tenant administration.

### C4 — Quality attributes and data policies

- **Skill:** `quality-attributes`
- **Outputs:** `07-quality-attributes.md` — concurrency (which records need row versions, which
  invariants need atomic updates), retention and deletion, audit trail, time zones, localization and
  RTL, performance targets, availability, privacy/PII, integrations and outbox, file storage.

### C5 — User stories

- **Skill:** `story-writing`
- **Outputs:** `08-stories.md` — each story has ID, actor, goal, rules (`BR-`), permissions, scope,
  acceptance criteria (Given/When/Then), failure cases with stable error codes, and status.

### C6 — Slice plan and manifest

- **Skill:** `slice-planning`
- **Outputs:** `09-slice-plan.md` (ordered vertical slices with dependencies, stories, exit checks,
  size) and `conversion-manifest.json` (valid against
  `templates/conversion/conversion-manifest.schema.json`).

### C7 — Plan review

- **Skill:** `plan-review`
- **Automation:** `Test-PlanReadiness.ps1`
- **Outputs:** review findings (added as questions/risks), gate decision in `status.md`.

**Gate GR — Ready to build** (see `checklists/gates.md` for the full list)

- [ ] `Test-PlanReadiness.ps1` passes.
- [ ] No open question marked `Blocking = yes` for slices in the first release.
- [ ] Every first-release story meets `checklists/definition-of-ready.md`.
- [ ] `plan-review` found no unresolved Critical/High finding (or a waiver decision exists).
- [ ] The owner approved the slice plan (decision recorded).

---

## Track D — Build loop

For each slice, in the order of `09-slice-plan.md`:

1. **Skill:** `feature-delivery`. Re-read the slice's stories, rules, access rules, and quality
   attributes.
2. Implement in the template order: contract → validation → authorization/scope → use case →
   persistence (+ migration) → HTTP endpoint → frontend contract (Zod) → UI → tests.
3. Verify against the slice's exit checks and `checklists/definition-of-done.md`.
4. Update the story status and the slice status in `09-slice-plan.md` and `status.md`.
5. If new business questions appear, stop that part, add `Q-###`, and continue with an
   independent part.
6. In the template repository, run `template-promotion` for reusable changes.

**Gate GD — Slice done:** Definition of Done met, acceptance criteria demonstrated, tests green.

**Gate GH — Handoff/release:** all release slices done; data migration rehearsed (if in scope);
configuration and runbook documented; known limitations listed.

---

## Track E — Extend

Run B1 (scoped to the feature), then C1–C7 limited to what the feature touches. Add new IDs; never
rewrite earlier ones. Impact analysis is mandatory: which existing rules, permissions, and
screens change?

---

## Where each concern lives

| Concern | File |
| --- | --- |
| Current position, next steps | `status.md` |
| Why something is the way it is | `01-decisions.md` |
| What a word means | `02-glossary.md` |
| Who can do what to which records | `03-actors-access.md` |
| What the business must be able to do | `04-capabilities.md` |
| Entities and relationships | `05-domain-model.md` |
| Rules that must always hold | `06-business-rules.md` |
| Concurrency, retention, audit, time, i18n, performance | `07-quality-attributes.md` |
| Buildable units of value | `08-stories.md` |
| Build order | `09-slice-plan.md` |
| What could go wrong | `10-risks.md` |
| What we still need to know | `11-open-questions.md` |
