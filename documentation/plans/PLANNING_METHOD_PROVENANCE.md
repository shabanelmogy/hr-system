# Planning Method Provenance

This file records which planning ideas were deliberately adopted into the ERP
planning system and prevents unreviewed prompt text from becoming architecture
policy by accident.

## Plan Mode interview material — adopted

Adopted into `PLAN_CREATION_PROTOCOL.md` and
`BUSINESS_DISCOVERY_INTERVIEW.md`:

- interview before plan/code;
- 3-6 questions per batch rather than a questionnaire dump;
- highest-cost ambiguities first;
- short reflection after each batch;
- challenge vague answers with concrete options + recommended default + trade-off;
- contradiction detection;
- explicit `ASSUMPTION` handling when the requester does not know;
- preserve stated technology/constraints;
- verify exact versions/current authoritative documentation when version-sensitive;
- produce a pre-plan spec summary plus assumptions and open risks before drafting
  implementation phases.

ERP-specific ownership, domain lifecycle, CQRS, tenant/company, migration,
offline, and cross-platform rules remain project policy rather than being copied
from the generic interview prompt.

## Terms of Service investigation material — adopted as a planning technique

The legal drafting instruction itself is not a software architecture authority.
Its evidence discipline is adopted into `EVIDENCE_AUDIT_STANDARD.md` and the
commercial/terms applicability review:

```text
Investigate actual behavior
-> identify material gaps code cannot answer
-> ask / explicitly assume
-> draft only claims that evidence or explicit target decisions support
```

This becomes planning policy for accounts, subscriptions, entitlements, billing,
service limits, UGC, AI/automation, third-party services, suspension, termination,
and legal-copy work.

The planning system must never invent fees, rights, restrictions, refund rules,
or product controls merely because they are common in legal templates.

## Privacy Policy investigation material — adopted as a planning technique

Adopted into `EVIDENCE_AUDIT_STANDARD.md`, the privacy/data-handling review, and
the plan quality gate:

- inventory actual personal/sensitive data flows;
- identify storage, security, telemetry, SDKs/third parties, and user controls;
- distinguish implemented controls from desired controls;
- surface retention, jurisdiction, target audience, legal entity/contact, and
  other non-code policy gaps explicitly;
- never claim a privacy safeguard/right/control that the implementation does not
  support.

This is a planning/evidence rule. Final legal policies still require appropriate
legal review for the target jurisdiction and business.

## Design Prompts Google document — reviewed

The user-supplied Google Docs document titled `Design Prompts` was read directly.
It contains several detailed example prompts for complete mobile UI systems and
screen sets across unrelated products.

Adopted as reusable planning ideas:

- treat a prepared UI as one cohesive product/design-system input rather than a
  collection of disconnected screens;
- require consistent components, typography, spacing, navigation, states, and
  interaction language across the whole experience;
- capture complete journeys and important screen states rather than designing only
  the happy-path screen;
- allow the requester to provide UI references through Google Docs, Figma, images,
  prototypes, screenshots, or another source;
- map an approved UI to the project's existing shared/reusable components first,
  extend an existing component generically when practical, and create a new shared
  reusable component only when no suitable component exists.

Deliberately not adopted as project policy:

- product-specific colors, radii, shadows, glassmorphism, photography, device
  framing, subscription pricing, social features, login providers, or other
  example-specific visual/product details;
- any UI behavior implied only by a mockup when it conflicts with verified
  business rules, lifecycle, permissions, accessibility, RTL, responsive behavior,
  or canonical application architecture.

Prepared UI remains downstream of business truth. It is a design/implementation
reference, not evidence that a capability or business rule already exists.

## Adoption rule for future external prompts

Do not paste a prompt wholesale into project policy.

For every external method/prompt:

1. extract the useful invariant/process;
2. compare with existing project architecture and workflow;
3. reject generic instructions that conflict with project constraints;
4. adapt reusable ideas into canonical planning files;
5. add automated gates where the rule is mechanically checkable;
6. record provenance and any deliberate non-adoption here.

The result should be one ERP planning method, not a pile of competing prompts.
