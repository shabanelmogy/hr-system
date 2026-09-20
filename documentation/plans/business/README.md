# Business Plans

Create one directory per plan using a stable kebab-case Plan ID.

Use:

```powershell
./documentation/plans/New-BusinessPlan.ps1 `
  -PlanId accounting-chart-of-accounts `
  -Name "Chart of Accounts" `
  -Module accounting `
  -Target "Accounting Phase 1"
```

Every plan starts as `Draft` and the overall plan may move to
`Implementation Ready` only after G0–G4 pass. A bounded dependency-ordered slice
may be explicitly execution-authorized earlier only under
`../PLAN_QUALITY_GATE.md`'s slice-authorization rule.

Follow `../PLAN_CREATION_PROTOCOL.md`.

The normal order is:

```text
DISCOVERY.md
-> EVIDENCE.md
-> SPEC_SUMMARY.md
-> approval to plan
-> PLAN.md
-> G0-G4
```

Canonical plan path:

```text
documentation/plans/business/<plan-id>/
├── DISCOVERY.md
├── EVIDENCE.md
├── SPEC_SUMMARY.md
├── PLAN.md
├── DECISIONS.md
├── RESEARCH.md
├── education/
│   └── <verified-phase-or-slice>.md
└── diagrams/
```
