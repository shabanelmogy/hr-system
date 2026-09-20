# Business Discovery Interview

Use this interview before promoting a new business plan beyond `Draft`.

The purpose is not to interrogate the requester with every possible question. The
purpose is to remove the assumptions that would otherwise become accidental
business rules during implementation.

## Interview rule

Do not begin by proposing tables, endpoints, screens, or libraries.

Start with:

```text
Business outcome
→ current process
→ actors and authority
→ source of truth
→ lifecycle and exceptions
→ money/stock/people/legal impact
→ integrations and evidence
→ only then solution boundaries
```

Ask only the questions that can materially change ownership, business rules,
architecture, UX, rollout, or acceptance evidence. Record uncertain answers as
open decisions; do not silently choose on behalf of Product.

Run the interview conversationally rather than as a questionnaire dump:

- ask 3-6 questions per batch, grouped by topic;
- ask high-cost ambiguities first;
- after each batch reflect the current understanding in 1-2 sentences;
- push back on vague answers with 2-3 concrete options, a recommended default,
  and the trade-off;
- flag contradictions with earlier decisions;
- if the requester does not know, record `ASSUMPTION — ...` plus validation
  trigger rather than blocking indefinitely;
- preserve explicitly chosen stack/constraints;
- verify exact framework/provider versions and current authoritative docs when a
  version-sensitive decision matters.

Do not write `PLAN.md` while discovery is still active.

## 1. Outcome and problem

- What business problem are we solving?
- Who experiences the problem today?
- What happens today without the feature?
- What measurable result should improve?
- What would make the feature a failure even if the software technically works?
- Is this a current-release requirement, future capability, experiment, or
  compliance obligation?

## 2. Current business process

- Describe the current process from trigger to completion.
- Which steps are manual, spreadsheet-based, external, or already in the ERP?
- Which existing system/entity is currently treated as the source of truth?
- What workarounds do users rely on today?
- Which existing behavior must remain unchanged?
- Which legacy behavior should be removed rather than preserved?

## 3. Actors, authority, and separation of duties

- Who creates, edits, submits, approves, rejects, cancels, closes, reopens, or
  audits the record?
- Can the creator approve their own work?
- Which actions require a different role or higher authority?
- Is access Global, Tenant, Company, Branch, Site, Warehouse, Department, or
  record-owner scoped?
- What changes when a user's permissions change mid-process?

## 4. Ownership and source of truth

- Which bounded context owns the business truth?
- Does a similar concept already exist in another module?
- Which module is allowed to mutate it?
- Which modules only consume facts/projections/events?
- Which identifiers are business keys versus technical IDs?
- What data must never be duplicated as an independent source of truth?

## 5. Lifecycle

- What states exist?
- What starts the lifecycle?
- Which transitions are allowed and forbidden?
- Which states are editable?
- Which states are terminal?
- Can records be cancelled, reopened, superseded, archived, restored, or revised?
- Does an approved state mean effective immediately, or is activation separate?
- What happens to downstream records when an upstream record changes?

## 6. Rules and exceptions

- What must always be true?
- What limits, ceilings, minimums, uniqueness rules, or dependencies exist?
- What exceptions are allowed, by whom, and how are they audited?
- What happens when two users act at the same time?
- What happens when a request is repeated?
- What happens when referenced data is archived while the user is editing?
- Which errors should block, warn, or require escalation?

## 7. Money, inventory, capacity, or regulated quantities

Ask when applicable:

- Which currency/unit is authoritative?
- What precision and rounding rules apply?
- What can be reserved versus actually consumed/posted?
- Can values become negative?
- What is the reversal/correction policy?
- Which financial/stock/capacity event must be atomic?
- Which period/calendar controls apply?
- What audit evidence is required?

## 8. Time and effective dating

- Which timezone owns business dates?
- Are dates effective, recorded, posted, approved, or scheduled dates?
- Can future-dated or backdated records exist?
- What happens at period/year boundaries?
- Do relationships need historical truth or only current state?

## 9. Clients and user journeys

For Web and Mobile separately:

- Is there a prepared UI/design reference (Google Docs, Figma, screenshot,
  prototype, image, or other source)? Which parts are visual direction only, and
  which behaviors have been explicitly approved?
- Which users need the capability?
- Which views are Required, Deferred, or Excluded?
- Create/Edit/View/List/Search/Filter/Bulk/Import/Export/Report?
- What should happen while loading, empty, offline, forbidden, stale, or failed?
- Does the workflow need unsaved-change protection?
- Does Mobile need offline drafts, sync, device APIs, deep links, or notifications?
- Does structured data need repeaters/builders rather than flat text?
- Which existing shared/reusable components can satisfy the approved UI, which
  need a generic extension, and which truly require a new reusable component?

## 10. Integrations and side effects

- Which external/internal systems are involved?
- Which direction does data flow?
- Is the interaction synchronous, asynchronous, scheduled, or event-driven?
- What is the timeout/retry/idempotency policy?
- What happens when the dependency is unavailable?
- Which effects must be durable through an Outbox/job?
- Which notifications/realtime updates are business-critical versus best-effort?

## 11. Reports, imports, exports, and files

- What decision does the report support?
- Which dataset/filter/ACL rules apply?
- Is Import Required, Deferred, or Excluded per client?
- What is the exact file/schema version?
- Is import atomic or partial?
- How are duplicates and relationship failures handled?
- What publication/Run ACL/deployment evidence is required?

## 12. Scale and operations

- Expected row counts, users, transactions, file sizes, or daily volume?
- Which queries must remain bounded/paged?
- What latency matters to the business?
- What logs, metrics, traces, audit, dashboards, or alerts are required?
- What should operators do when processing is stuck or partially failed?

## 13. Rollout and existing data

- Is there existing data to migrate/backfill/remap?
- Can deployment be additive, or does it need a maintenance window?
- Which jobs/writers must be drained first?
- Is backward compatibility required between old/new clients?
- What is rollback versus forward-fix strategy?
- What production smoke proves the rollout succeeded?

## 14. Definition of success

- Which business scenarios must pass before release?
- Which failures/edge cases must be tested?
- Which evidence is automated versus deployment/manual?
- Who accepts the feature?
- What remains intentionally Deferred or Excluded?

## Interview output

The plan's `DISCOVERY.md` should finish with four explicit sections:

1. **Verified facts** — supported by current system/business evidence.
2. **Requested decisions** — what Product wants to become true.
3. **Open decisions** — unresolved questions with owner and due/reopen trigger.
4. **Planning consequences** — ownership, lifecycle, data/API/client/integration
   decisions that the master plan must reflect.

Then produce `SPEC_SUMMARY.md` containing the concise product/spec summary,
explicit `ASSUMPTION`s, and open risks/unknowns. In an interactive planning
session, ask whether the requester is ready for the specification to be converted
into the implementation plan. Only then complete `PLAN.md`, G0, and the remaining
planning gates.
