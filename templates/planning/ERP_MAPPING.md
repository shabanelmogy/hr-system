# Planning kit ↔ ERP planning system

This kit was imported on 2026-09-28 from the School Management template work. Inside this
repository the canonical planning system is `documentation/plans/` (protocol P0–P9, gates G0–G4,
evidence ledger, feature contracts v2, central notes). This kit does **not** replace it.

## Which one to use

| Situation | Use |
| --- | --- |
| New capability or module inside this ERP repository | `documentation/plans/` (canonical). Use the skills below only as interview/analysis procedures that write into the ERP plan files. |
| New product workspace generated from this ERP platform (a different repository) | This kit, until the workspace generator ships (plan `erp-platform-template`, slice S5). |
| Migrating an external application into an ERP module | ERP plan folder + the `legacy-analysis` and `data-migration-planning` skills. |

## Skill → ERP protocol step and file

| Skill | ERP step | Writes into (`documentation/plans/business/<plan-id>/`) |
| --- | --- | --- |
| `planning-orchestrator` | P0 classify, sequencing | `PLAN.md` metadata, `PLAN_REGISTRY.md` row |
| `business-discovery` (+ `question-bank.md`) | P1 interview | `DISCOVERY.md` (question bank complements `BUSINESS_DISCOVERY_INTERVIEW.md`) |
| `legacy-analysis` | P2 investigate | `EVIDENCE.md` rows (`VERIFIED CURRENT` for the legacy system, cite source) |
| `domain-modeling` | P5 / P7 | `SPEC_SUMMARY.md` "Domain and source of truth"; `PLAN.md` domain sections |
| `access-design` | P7B.1 Permission Action Matrix | `PLAN.md` permission matrix; `documentation/system/PERMISSION_MODEL.md` naming (`Resource:Action`, no `Manage`) |
| `quality-attributes` | P4 applicability, G2 | `PLAN.md` architecture/NFR sections; notes under `documentation/plans/notes/` |
| `story-writing` | P7 | Feature contracts (`FEATURE_DECOMPOSITION_TEMPLATE.md`) acceptance criteria |
| `slice-planning` | P7A / P7C | Slice roadmap with one `ACTIVE_FEATURE_STEP`; no `conversion-manifest.json` in this repo |
| `plan-review` | P8 adversarial review | `PLAN.md` review section; findings → notes IDs |
| `feature-delivery` | Implementation phases 00–07 | `documentation/system/features/<id>/` via `New-FeatureDocumentation.ps1` |
| `data-migration-planning` | G4 when data moves | `PLAN.md` migration section + `PROD-###` notes |
| `template-promotion` | After a slice is Verified | `SHARED_REUSE_CATALOG.md`, `SCREEN_PATTERN_CATALOG.md` (P-###), shared components |

## Artifact → ERP file

| Kit artifact | ERP equivalent |
| --- | --- |
| `00-brief.md` | `SPEC_SUMMARY.md` "Product and outcome" |
| `01-decisions.md` | `DECISIONS.md` (`D-###`) and `notes/DECISION_BACKLOG.md` (`DEC-###`) |
| `02-glossary.md` | `SPEC_SUMMARY.md` or module docs under `documentation/modules/<module>/` |
| `03-actors-access.md` | `PLAN.md` permission matrix |
| `04-capabilities.md` | `SPEC_SUMMARY.md` Required / Deferred / Excluded |
| `05-domain-model.md`, `06-business-rules.md` | `PLAN.md` domain and invariant sections |
| `07-quality-attributes.md` | `PLAN.md` + central notes |
| `08-stories.md`, `09-slice-plan.md` | Feature contracts + slice roadmap |
| `10-risks.md`, `11-open-questions.md` | `notes/KNOWN_RISKS.md` (`RISK-###`), `notes/DECISION_BACKLOG.md` |
| `legacy/*` | `EVIDENCE.md` + `RESEARCH.md` |

## Gate mapping

| Kit gate | ERP gate |
| --- | --- |
| GA legacy understood, GB business understood | Preflight + G0 scope/ownership + G1 business |
| GR ready to build | G2 architecture + G3 product/client + G4 delivery |
| GD slice done | Feature phase 06 Verified |
| GH handoff | Phase 07 customer education and closure |

## Known couplings still to adapt (plan `erp-platform-template`, slice S2)

- `Test-PlanReadiness.ps1` and `slice-planning` expect `conversion-manifest.json` and the School
  generator's `templates/conversion/` validator, which were **not** imported.
- `New-PlanningWorkspace.ps1` copies `templates/conversion/*` and runs the Next.js analyzer only
  when present; it skips them silently when absent, so the readiness check then fails on the
  missing manifest.
- `legacy-analysis` references `Analyze-NextProject.ps1` (School repository only).
- `data-migration-planning` and `quality-attributes` cite School paths as examples.
