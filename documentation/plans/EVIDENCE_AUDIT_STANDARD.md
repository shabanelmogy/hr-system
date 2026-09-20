# Evidence Audit Standard

This standard generalizes the strongest part of the legal/privacy investigation
prompts into every ERP plan: investigate reality before drafting claims or target
architecture.

## Evidence hierarchy

Prefer evidence in this order when describing current behavior:

1. runtime source and domain/application rules;
2. automated tests proving the behavior;
3. persistence mappings/migrations/configuration;
4. deployment/runtime configuration and verified operational evidence;
5. canonical applied documentation that agrees with source;
6. historical plans/examples only as context, never as proof of current behavior.

When sources conflict, record the conflict. Do not silently choose the most
convenient version.

## Required audit dimensions

Audit only the dimensions relevant to the planned capability, but explicitly mark
irrelevant dimensions `N/A — reason`.

### Product/runtime inventory

- current user-visible capabilities and routes;
- actors and access boundaries;
- current create/read/update/lifecycle actions;
- current limitations and intentional exclusions.

### Domain and data

- owning aggregate/context;
- identifiers/business keys;
- relationships/invariants/state transitions;
- persistence schema, filters, uniqueness, concurrency, migrations;
- source-of-truth boundaries.

### Authentication/authorization

- sign-in/session model;
- role/permission/entitlement enforcement;
- tenant/company/branch/data scope;
- suspension/revocation/session invalidation when relevant.

### Commercial/service limits

- subscription/plan/seat/entitlement behavior;
- actual usage/rate/file/size limits enforced in code/config;
- billing/payment provider behavior if present;
- behavior when limits are reached.

### Privacy and sensitive data

- personal/sensitive data processed;
- storage and data flow;
- telemetry/tracking/logging;
- third parties/SDKs;
- deletion/export/consent/retention controls actually implemented.

### User/generated content and automation

- uploads/content created by users;
- reports/generated documents;
- AI/automated features and output boundaries;
- moderation/safety/validation controls if present.

### Integrations and asynchronous work

- third-party/internal integrations;
- jobs/events/outbox/realtime;
- retry/idempotency/failure behavior;
- external dependencies and fallback/degradation.

### Delivery and operations

- environments and release mechanisms;
- production-only/manual gates;
- observability/alerts/audit;
- migrations/backups/recovery where relevant.

## Evidence ledger format

`EVIDENCE.md` should use rows like:

| Evidence ID | Classification | Finding | Source | Consequence |
| --- | --- | --- | --- | --- |
| E-001 | VERIFIED CURRENT | ... | `path:line` / symbol / test | ... |
| E-002 | REQUESTED TARGET | ... | requester decision | ... |
| E-003 | ASSUMPTION | ... | no authoritative answer yet | validate before G? |
| E-004 | UNKNOWN | ... | missing evidence | owner / next action |

Repository evidence should cite exact file paths and symbols/lines when practical.
External claims should cite authoritative current sources when they materially
affect versions, regulation, provider behavior, or contracts.

## Gap confirmation

After the audit, list everything material that cannot be determined from the
current evidence. Examples include:

- product policy;
- target jurisdiction/country;
- retention period;
- legal entity/contact details;
- pricing/refund policy;
- acceptable abuse/rate policy;
- scale target;
- provider choice;
- operational SLO;
- rollout deadline.

Ask the requester, choose a labelled assumption, or create a central open
decision. Never disguise missing evidence as architecture certainty.

## Accuracy rule

The plan may describe a target that does not exist yet, but it must label it as a
target. It must never rewrite future intent into a claim about current behavior.

Shorter evidence that is true is better than exhaustive documentation built on
unverified assumptions.
