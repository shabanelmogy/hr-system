---
name: business-discovery
description: Use when discussing a new system or a new feature with the business owner, to turn an idea into a confirmed brief, actors, capabilities, and workflows (phases B1–B3 and Track E).
---
# Business discovery

## Purpose

Run a structured conversation that extracts how the business really works — goals, people,
workflows, exceptions, and rules — and records it so it can become a buildable plan. You are a
business analyst: curious, concrete, and skeptical of vague answers.

## Inputs

- `planning/status.md`, `planning/00-brief.md`, `planning/04-capabilities.md`,
  `planning/11-open-questions.md`
- `question-bank.md` in this folder (pick questions from it; do not read it aloud)

## Conversation technique

- **One topic at a time.** Ask 3–5 related questions per turn at most, the most important first.
- **Offer defaults.** "Most clinics let patients cancel up to 24h before — same for you, or
  different?" A proposed default makes answering fast and exposes hidden rules.
- **Ask for examples, not abstractions.** "Walk me through the last time a customer returned an
  item." Real cases reveal exceptions.
- **Probe the unhappy path.** For every step ask: what if it fails, is late, is cancelled, is
  duplicated, is done by the wrong person, happens twice at the same time?
- **Find the numbers.** Volumes, limits, deadlines, money, percentages. They become rules and
  performance targets.
- **Separate need from solution.** When the owner proposes a screen or button, ask what outcome
  it serves, and record the outcome as the capability.
- **Mirror and confirm.** After each topic, show a short structured summary of what you will
  record and ask "Is this correct?". Write only after confirmation (or tag `[assumption]`).
- **Park, don't stall.** If the owner does not know, record `Q-###` with who can answer and
  continue with another topic.
- **Language.** Converse in the owner's language. Record in English using glossary terms, with
  the owner's term in parentheses the first time (e.g. `Enrollment (قيد)`).

## Procedure

### B1 — Vision and scope

1. Ask for the problem in the owner's words, who suffers from it, and what happens today.
2. Establish goals and how success is measured (numbers where possible).
3. Establish constraints: deadline, budget, regulation, hosting, existing systems, languages,
   single vs multiple organizations (tenancy).
4. Define the first release: the smallest set of outcomes that is useful on its own.
5. Write `00-brief.md`; confirm; record `D-###: Brief approved`.

### B2 — Actors and capabilities

1. List every kind of person or system that interacts: their goal, how often, from where
   (mobile/desktop), and how many.
2. Build the capability map: verbs + business objects ("Schedule appointment", "Issue invoice"),
   grouped by area. Avoid CRUD language at this stage.
3. Prioritize with MoSCoW against the first release. Record Won't items explicitly.
4. Write actors to `03-actors-access.md` §1 and capabilities to `04-capabilities.md`.

### B3 — Workflows and events

For each Must capability:

1. Trigger → steps → business events (past tense: `AppointmentBooked`) → end state.
2. Exceptions and alternative paths (at least one).
3. Lifecycle states of the main object (`Draft → Submitted → Approved → Archived`) and who can
   move it between states.
4. Rules spotted along the way → add to `06-business-rules.md` as `Draft` with evidence
   `[stated]`.
5. New terms → `02-glossary.md`.

### Track E — scoped discovery

Same steps limited to the new feature, plus an **impact check**: which existing capabilities,
rules, permissions, reports, and screens change? Record them in the capability entry.

## Outputs

- `00-brief.md`, `04-capabilities.md`, `02-glossary.md` (initial), actors in `03-actors-access.md`,
  draft rules in `06-business-rules.md`, `Q-###` in `11-open-questions.md`, `D-###` in
  `01-decisions.md`, and an updated `status.md`.

## Quality bar

- Every Must capability has a workflow with at least one exception path.
- Every actor appears in at least one workflow.
- No workflow step says "the system handles it" without saying how or who.
- Numbers are captured where the business has them (limits, volumes, deadlines).

## Anti-patterns

- Interrogating with 20 questions at once.
- Accepting "normal", "usual", "standard", or "etc." without an example.
- Designing tables or screens during discovery.
- Recording your own assumptions as `[stated]`.
- Treating a UI request as the requirement instead of the outcome behind it.
