# <Business Capability> — Master Build Plan

> Copy this file to `documentation/plans/business/<plan-id>/PLAN.md`.

## 0. Plan metadata

| Field | Value |
| --- | --- |
| Plan ID | `<kebab-case-id>` |
| Business capability | `<name>` |
| Owning module | `<module>` |
| Status | `Draft` |
| Target milestone | `<release/phase>` |
| Primary owner | `<team/role>` |
| Reference feature(s) | `<countries/states/other/none>` |
| Related plans | `<links or N/A>` |
| Last reviewed | `<YYYY-MM-DD>` |

### Planning evidence

- Discovery: `DISCOVERY.md`
- Current-system evidence: `EVIDENCE.md`
- Approved pre-plan specification: `SPEC_SUMMARY.md`

The master plan describes the approved target. Claims about current behavior must
remain traceable to `EVIDENCE.md`.

## 1. Executive outcome

### Business problem
<What is wrong/missing today?>

### Desired outcome
<What measurable business capability should exist?>

### Success measures

| Measure | Current | Target | Evidence |
| --- | --- | --- | --- |
| `<measure>` | `<baseline>` | `<target>` | `<how verified>` |

## 2. Scope

### Required now
- <required capability>

### Deferred

| Capability | Reason | Owner | Reopen trigger |
| --- | --- | --- | --- |

### Excluded

| Capability | Reason |
| --- | --- |

## 3. Ownership and existing-system relationship

### Bounded-context owner
<One canonical owner and reason.>

### Existing-system relationship matrix

| Existing concept/system | Relationship | Source of truth | Reuse/change/remove | Evidence |
| --- | --- | --- | --- | --- |

### Cross-module dependencies

| From | To | Contract/mechanism | Why ownership is not duplicated |
| --- | --- | --- | --- |

## 4. Personas, roles, tenant/company scope

| Persona/role | Goals | Allowed scope | Critical restrictions |
| --- | --- | --- | --- |

## 5. Domain model

| Concept | Type | Owner | Identifier/business key | Notes |
| --- | --- | --- | --- | --- |

### Invariants
1. <Invariant>

## 6. Lifecycle / state machine

| Current state | Action | Next state | Actor | Preconditions | Side effects |
| --- | --- | --- | --- | --- | --- |

## 7. Business rules matrix

| Rule ID | Action/scenario | Preconditions | Rule/validation | Failure | Side effects |
| --- | --- | --- | --- | --- | --- |

## 8. Edge cases and validation matrix

Every category requires a decision or `N/A — reason`.

| Category | Scenarios / decision |
| --- | --- |
| Duplicate/idempotency | |
| Concurrency/RowVersion | |
| Stale data | |
| Partial failure/transactions | |
| Invalid lifecycle transition | |
| Missing/archived dependency | |
| Tenant/company mismatch | |
| Permission changes | |
| Date/time/timezone | |
| Currency/rounding/precision | |
| Large dataset/paging | |
| Import duplicate/atomicity | |
| External outage/timeout | |
| Mobile offline/conflicts | |
| Audit/history | |
| Sensitive data/security | |

## 9. Permissions and security

| Permission | Access mode | Action/data controlled | Server enforcement |
| --- | --- | --- | --- |

## 10. Persistence and migration

| Store/entity | Schema/owner | Key constraints/indexes | Tenant/company filter | Delete/archive rule |
| --- | --- | --- | --- | --- |

Migration/backfill/seed strategy: <...>

Transaction boundaries: <...>

## 11. API / CQRS / contracts

| Operation | Type | Route/message | Permission | Request | Response | Error/concurrency contract |
| --- | --- | --- | --- | --- | --- | --- |

### Cross-module events/contracts

| Event/contract | Producer | Consumer | Delivery/idempotency rule |
| --- | --- | --- | --- |

## 12. Web experience

Prepared UI/design references (Google Docs/Figma/images/prototypes/etc.):
<links/artifacts or N/A; state clearly that visual references do not override
approved business rules, lifecycle, permissions, accessibility, RTL, responsive,
or shared design-system policy.>

| Capability | Required/Deferred/Excluded | Notes |
| --- | --- | --- |
| List/Grid | | |
| Cards | | |
| Detail | | |
| Create/Edit | | |
| Search/Filter/Sort | | |
| Pagination | | |
| Bulk actions | | |
| Import | | |
| Export/Report | | |
| Realtime | | |

Primary journeys:
1. <Journey>

Shared/reusable component mapping:

| UI need/reference element | Existing shared component | Reuse / generic extension / new shared component | Reason |
| --- | --- | --- | --- |

## 13. Mobile experience

| Capability | Required/Deferred/Excluded | Notes |
| --- | --- | --- |

Offline/sync/deep-link/notification behavior: <...>

Mobile shared/reusable component mapping:

| UI need/reference element | Existing shared component | Reuse / generic extension / new shared component | Reason |
| --- | --- | --- | --- |

## 14. 5-point structured-data parity audit

| Audit point | Web | Mobile | Evidence/decision |
| --- | --- | --- | --- |
| Creation Journey | | | |
| Editing Journey | | | |
| Viewing Journey | | | |
| Listing & Filtering | | | |
| Mock/Test Data Generator | | | |

## 15. Reporting / import / export / files
<Required/Deferred/Excluded decisions and exact contracts.>

## 16. Integrations and side effects

| Integration | Direction | Trigger | Contract | Timeout/retry | Failure/recovery |
| --- | --- | --- | --- | --- | --- |

## 17. Non-functional requirements

### Performance and scale
<...>

### Reliability
<...>

### Observability
<...>

### Localization/accessibility/security
<...>

### Privacy and data handling

<Personal/sensitive data, purpose, storage/data flow, third parties, deletion/
export/consent/retention controls that actually exist or are explicitly targeted;
use N/A with reason when not applicable.>

### Commercial / legal applicability

<Accounts/eligibility, subscriptions/limits/billing, UGC, AI/automation,
third-party terms, suspension/termination/data deletion and any unresolved legal
entity/jurisdiction/pricing/refund/contact questions when applicable. Do not add
generic boilerplate requirements that the product does not support.>

## 18. Test and verification matrix

| Requirement/rule | Domain | Application | Integration | API | Web | Mobile | E2E/manual |
| --- | --- | --- | --- | --- | --- | --- | --- |

## 19. Rollout and migration plan

1. <Deployment ordering>
2. <DB migration/backfill>
3. <Compatibility/transition>
4. <Production smoke>
5. <Monitoring>
6. <Rollback or forward-fix>

## 20. Risks

| Risk | Likelihood | Impact | Mitigation | Owner | Trigger |
| --- | --- | --- | --- | --- | --- |

### Assumptions inherited from specification

| Assumption | Impact if wrong | Validation trigger | Owner |
| --- | --- | --- | --- |

## 21. Decision log

| Decision | Alternatives | Selected | Reason | Impacted surfaces | Date |
| --- | --- | --- | --- | --- | --- |

## 22. Open questions

| Question | Owner | Blocking? | Due | Resolution |
| --- | --- | --- | --- | --- |

## 23. Implementation phases

| Phase | Goal | Dependencies | Deliverables | Entry gate | Exit gate |
| --- | --- | --- | --- | --- | --- |

Each phase/slice must classify its post-implementation Customer Education Pack as
`Required` or `N/A — reason`. Customer-visible phases are always `Required`.

## 24. Acceptance criteria

- [ ] Business outcome is measurable.
- [ ] Discovery, evidence audit, and pre-plan specification are complete.
- [ ] Current versus target behavior is explicitly separated.
- [ ] Assumptions are labelled and have validation triggers.
- [ ] Ownership/source of truth is explicit.
- [ ] Lifecycle and invariants are frozen.
- [ ] Business rules and edge cases are complete.
- [ ] Security/scope is server-authoritative.
- [ ] Data/migration strategy is complete.
- [ ] API/integration contracts are explicit.
- [ ] Web/Mobile Required-Deferred-Excluded decisions are complete.
- [ ] Test evidence maps to critical rules/journeys.
- [ ] Rollout/recovery plan is executable.
- [ ] Applicable privacy/commercial/legal impacts were reviewed without inventing unsupported product behavior.
- [ ] Every implementation phase defines its post-implementation Customer Education Pack requirement or a reasoned N/A.
- [ ] G0–G4 quality gates pass.

## 25. Customer education / video documentation

Customer education classification by phase:

| Phase | Required / N/A | Customer-visible outcome | Planned education file |
| --- | --- | --- | --- |
| `<phase>` | `Required` | `<what the customer can do after this phase>` | `education/<phase>.md` |

For every `Required` phase, create the final document from
`documentation/plans/CUSTOMER_EDUCATION_TEMPLATE.md` only **after Phase 06
Verification & Acceptance records `Verified`**. Phase 07 then creates/finalizes
the education document and closure decision. The final document must reflect actual
runtime behavior and be usable as a customer guide, demo/training reference, and
video script/storyboard.

Do not include unreleased/Deferred features as available behavior and do not turn
internal technical documentation into customer-facing copy.

## 26. Handoff

### Approved implementation request
<Concise final implementation instruction.>

### Canonical documents to create/update
<API workflow, system feature docs, module books, web/mobile profiles, ADRs, etc.>

## 27. Central note references

Link any non-immediate work to the central registries instead of duplicating it:

| Note ID | Type | Reason linked to this plan |
| --- | --- | --- |
| `<DEF/PROD/RISK/FOLLOW/DEC-###>` | `<type>` | `<reason>` |

Do not leave important deferred or Production-only work only inside this PLAN.md.

### Platform note indexes

When this plan creates or references deferred/production/risk work, update the
appropriate indexes:

- API: `documentation/plans/notes/API_NOTES.md`
- Web: `documentation/plans/notes/WEB_NOTES.md`
- Mobile: `documentation/plans/notes/MOBILE_NOTES.md`
- Cross-platform: `documentation/plans/notes/CROSS_PLATFORM_NOTES.md`

The full canonical note remains in its type registry; indexes only reference IDs.
