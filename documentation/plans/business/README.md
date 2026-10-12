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
[`../PLAN_QUALITY_GATE.md`](../PLAN_QUALITY_GATE.md)'s slice-authorization rule.

Follow [`../PLAN_CREATION_PROTOCOL.md`](../PLAN_CREATION_PROTOCOL.md).

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

## Current plans

Status lives in [`../PLAN_REGISTRY.md`](../PLAN_REGISTRY.md).

| Plan | Files |
| --- | --- |
| `accounting-core-gl` | [DISCOVERY](accounting-core-gl/DISCOVERY.md) · [EVIDENCE](accounting-core-gl/EVIDENCE.md) · [RESEARCH](accounting-core-gl/RESEARCH.md) · [SPEC_SUMMARY](accounting-core-gl/SPEC_SUMMARY.md) · [DECISIONS](accounting-core-gl/DECISIONS.md) · [PLAN](accounting-core-gl/PLAN.md) |
| `education-module` | [DISCOVERY](education-module/DISCOVERY.md) · [EVIDENCE](education-module/EVIDENCE.md) · [RESEARCH](education-module/RESEARCH.md) · [SPEC_SUMMARY](education-module/SPEC_SUMMARY.md) · [DECISIONS](education-module/DECISIONS.md) · [PLAN](education-module/PLAN.md) |
| `erp-platform-template` | [DISCOVERY](erp-platform-template/DISCOVERY.md) · [EVIDENCE](erp-platform-template/EVIDENCE.md) · [RESEARCH](erp-platform-template/RESEARCH.md) · [SPEC_SUMMARY](erp-platform-template/SPEC_SUMMARY.md) · [DECISIONS](erp-platform-template/DECISIONS.md) · [PLAN](erp-platform-template/PLAN.md) |
| `managed-crystal-reporting-reliability` | [DISCOVERY](managed-crystal-reporting-reliability/DISCOVERY.md) · [EVIDENCE](managed-crystal-reporting-reliability/EVIDENCE.md) · [RESEARCH](managed-crystal-reporting-reliability/RESEARCH.md) · [SPEC_SUMMARY](managed-crystal-reporting-reliability/SPEC_SUMMARY.md) · [DECISIONS](managed-crystal-reporting-reliability/DECISIONS.md) · [PLAN](managed-crystal-reporting-reliability/PLAN.md) |
