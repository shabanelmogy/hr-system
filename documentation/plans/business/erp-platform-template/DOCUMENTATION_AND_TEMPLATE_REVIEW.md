# Documentation System and Template Integration Review

| Field | Value |
| --- | --- |
| Review date | 2026-09-28 (after the owner pulled the latest `main`; the `documentation/` listing was byte-identical before and after the pull) |
| Scope | `documentation/` (495 files, 4.4 MB), `.codex/skills/`, `templates/`, `packages/`, root docs |
| Method | Read-only. 372 files staged and scanned (all authored books, plans, notes, module packages, system scripts, templates, feature manifests, archive). The 101 generated phase packets were assessed through `recipe-manifest.json`, `Generate-Documentation.ps1`, and the unscoped packet set. Automated checks: markdown link integrity, filename-reference graph, stale-name search, stub/size census. |
| Question answered | How the School template and its tools should work inside the ERP documentation system, and what must exist so no file is kept without a reason. |

## 1. Conclusion

The ERP documentation system already *is* the template's planning and delivery system. It is
stronger than the imported School kit on every step and it is enforced in CI. The imported
`templates/planning/` kit therefore duplicates it and should be retired after two genuinely
missing capabilities are carried over as ERP skills. Inside `documentation/` itself, the main
waste is not wrong content but **parallel copies and placeholder files**: a second frontend
roadmap, a triplicated Accounting source plan, 22 historical phase stubs, placeholder module
READMEs, an archive folder, and unreferenced documents. Roughly 130 files can go without losing
any knowledge.

## 2. How the pieces fit (target)

```text
.codex/skills/            AI navigation layer (how to work)        — points into documentation/
documentation/plans/      Intent: discovery → evidence → spec → plan → gates G0–G4
documentation/system/     Execution: Phase 00 preflight → 01–05 → 06 verified → 07 education
documentation/modules/    Ownership index per runtime module
documentation/{project,api,web-next,mobile-react}/   Applied books (evidence of what exists)
templates/                New-product workspace generator only (slice S5)
packages/tokens/          Shared design values for web-next (MUI) and mobile-react
```

A new product is created by the S5 generator from this repository. The documentation system
travels with it (standards, scripts, templates, empty registries), so no separate portable
planning kit is needed.

## 3. Template kit versus ERP system

| School kit component | ERP equivalent (already present) | Fate |
| --- | --- | --- |
| `PROCESS.md`, `START_HERE.md`, `README.md` | `plans/README.md`, `PLAN_CREATION_PROTOCOL.md` (P0–P9), `system/README.md` | Delete |
| Artifacts `00-brief` … `11-open-questions`, `status.md` | `DISCOVERY`, `EVIDENCE`, `SPEC_SUMMARY`, `PLAN`, `DECISIONS`, `RESEARCH`, central notes | Delete |
| `checklists/gates.md`, DoR, DoD | `PLAN_QUALITY_GATE.md` G0–G4, phase 06/07 templates | Delete |
| `Test-PlanReadiness.ps1`, `New-PlanningWorkspace.ps1` | `Check-Planning.ps1`, `New-BusinessPlan.ps1`, `New-FeatureDocumentation.ps1` | Delete |
| `business-discovery` skill + `question-bank.md` | `BUSINESS_DISCOVERY_INTERVIEW.md` (14 sections, more complete) | Fold into skill `erp-business-planning` |
| `planning-orchestrator`, `domain-modeling`, `access-design`, `quality-attributes`, `story-writing`, `slice-planning`, `plan-review` | Protocol steps P0–P9, `PERMISSION_MODEL.md`, `FEATURE_DECOMPOSITION_TEMPLATE.md` | Fold into skill `erp-business-planning` (one skill, not seven) |
| `feature-delivery` | `.codex/skills/erp-{api,web,mobile}-development` | Delete (covered) |
| `template-promotion` | `AGENTS.md` shared-component-first, `SHARED_REUSE_CATALOG.md`, `SCREEN_PATTERN_CATALOG.md` | Delete (covered) |
| `legacy-analysis`, `data-migration-planning`, `artifacts/legacy/*`, `artifacts/migration/*` | **Missing**: P2 investigates *this* repository, not an external application; no data-migration procedure | New skill `erp-legacy-migration` writing into `EVIDENCE.md` / `RESEARCH.md` and `PROD-###` notes |
| `ERP_MAPPING.md` | — | Delete after the two skills exist |

Result: `templates/planning/` (50 files) → 0 files; `.codex/skills/` gains 2 skills
(`erp-business-planning`, `erp-legacy-migration`), each a `SKILL.md` plus at most one reference file.

## 4. Documentation system — strengths to keep

- One authority chain: plans own intent, system owns execution evidence, books own facts,
  generated packets are derivative and CI-checked (`Generate-Documentation.ps1 -Check`,
  `Check-Planning.ps1`).
- Central notes with stable IDs; plan registry; Feature Decomposition Gate; UI Pattern Gate;
  Permission Action Matrix.
- Archive guard: scripts refuse to use `old files/` as evidence.
- Internal markdown links are intact: only 4 broken links, all inside the archive.
- No stale product names in active docs except one path (`/hr-system/web-next`).

## 5. Findings

| ID | Severity | Finding | Evidence | Action |
| --- | --- | --- | --- | --- |
| DOC-1 | High | Two planning systems: `templates/planning/` (imported) and `documentation/plans/` + `.codex/skills/`. | §3 | Retire the kit per §3 (slice S2). |
| DOC-2 | Medium | Two frontend roadmaps: root `ERP_FRONTEND_MASTER_PLAN.md` (registered as `frontend-foundation-hardening`) and `web-next/architecture/ERP_FRONTEND_HARDENING_PLAN.md` ("Active roadmap for `/hr-system/web-next`"; referenced nowhere; 4 shared lines out of ~550). | Registry; filename-reference scan | Reconcile any unique open items into the registered plan, then delete the second file. |
| DOC-3 | Medium | Accounting source plan exists in two versions plus stubs: root `ACCOUNTING_MODULE_PHASES_AR.md` v1.3 (2026-09-19, 100 KB, cited by `accounting-core-gl`), `modules/accounting/phases/SOURCE-PLAN_AR.md` v1.0 (2026-09-08, 33 KB, still the `phaseSourceAr` in `module.json`; about 60 % of its lines reappear in v1.3), and 22 `PHASE-00…21.md` stubs (0.6–1.3 KB each, referenced by no file; the phases README marks them historical). | Listing; version headers; `module.json:34` | Keep v1.3 only: move it to `modules/accounting/SOURCE-PLAN_AR.md`, point `module.json` and the `accounting-core-gl` citations at it, delete v1.0. Fold the stubs into the phases README dependency table and delete them. |
| DOC-4 | Medium | 32 module sub-READMEs under 1 KB (`api/`, `web-next/`, `mobile-react/`, `features/`, `phases/` per module) are placeholders generated by `New-ErpModule.ps1`. | Size census; `api/scripts/New-ErpModule.ps1:134-298` | Generator creates only `module.json`, `README.md`, `ARCHITECTURE.md`, `DELIVERY-ROADMAP.md`; a sub-README is created when it has content. Keep the ones with substance (Accounting api/features, HR api/features, Platform api, Contacts api, Reference Data). Update `modules/README.md` shape. |
| DOC-5 | Medium | Per-feature footprint is about 14 files: domain review + 3 platform profiles + `IMPLEMENTATION-REQUEST` + review artifacts + `required-files.json` + 7–8 generated packets. 15 features → 138 files under `system/`, of which 101 generated (550 KB). | Census | Keep the 7 authored files per feature. Decide whether generated packets stay committed or are generated on demand with CI checking manifests only (DEC-017). |
| DOC-6 | Medium | 43 active documents are referenced by no other file: 13 Kanban user stories, `Domain_Development_Guide.md`, `MOBILE_API_COMPATIBILITY_MATRIX.md`, `ATTENDANCE_SITE_AGENT_RUNBOOK.md`, `EMAIL_CONFIRMATION_LINKS.md`, `ENTERPRISE_HRMS_ARCHITECTURE_LEDGER.md`, `Multi_Tenant_Company_Selection.md`, `Shared_Form_Layouts.md`, workforce-planning `PHASE-02-BUDGETS-ENVELOPES-IMPLEMENTATION.md`, DOC-2 and DOC-3 files. | Filename-reference scan (docs, manifests, scripts, AGENTS/README files) | Link each from its owner (module README, feature manifest, or plan) or archive it. The Kanban stories become the research input of the S8 kanban plan. |
| DOC-7 | Low | `old files/` (26 files, 230 KB) keeps superseded material inside the active tree; git history already preserves it. Folder names with spaces (`old files`, `User Stories`) force `%20` links. | Listing; archive README | Delete `old files/` (history stays in git) or rename to `archive/`; rename `api/User Stories/` to `api/user-stories/` when it moves (DEC-018). |
| DOC-8 | Low | Root docs outside `documentation/`: `ERP_FRONTEND_MASTER_PLAN.md`, `ACCOUNTING_MODULE_PHASES_AR.md`, `HR-CONNECTION-ONLY-PROMPT.md`. | Root listing; `documentation/README.md` rule 1 | Move with the registry/link updates (separate documentation task, as the registry requires). |
| DOC-9 | Low | Entry-point sprawl: `documentation/README.md` lists 27 "start here" links; `ERP_DOCUMENTATION_GUIDE_AR.md`, `plans/README.md`, `system/README.md`, `modules/README.md` each present themselves as the start. | Index files | One three-step start: new capability → `plans/README.md`; feature work → `system/README.md`; module facts → `modules/<slug>/README.md`. Move the per-feature link list into `modules/README.md`. |
| DOC-10 | Low | `NOTES_MIGRATION_GUIDE.md` and `PLANNING_METHOD_PROVENANCE.md` are historical; `Check-Planning.ps1` requires them. | `Check-Planning.ps1` required list | Optional: merge into `plans/README.md` and drop them from the required list. |

## 6. What must exist (minimal set)

| Level | Must exist | Created when |
| --- | --- | --- |
| Repository | `README.md`, `AGENTS.md` (+ per-app `AGENTS.md`), `documentation/README.md` | Always |
| AI skills | `.codex/skills/erp-api-development`, `erp-web-development`, `erp-mobile-development`, `erp-business-planning`, `erp-legacy-migration`, `graphify` | Always |
| Planning standard | Files required by `Check-Planning.ps1`, `plans/notes/*` registries, `PLAN_REGISTRY.md` | Always |
| Execution system | `system/README.md`, `PERMISSION_MODEL.md`, scripts, `recipe-manifest.json`, `templates/` | Always |
| Shared catalogs | `SCREEN_PATTERN_CATALOG.md`, `SHARED_REUSE_CATALOG.md`, ADRs, architecture constitution | Always |
| Per module | `module.json`, `README.md`, `ARCHITECTURE.md`, `DELIVERY-ROADMAP.md` | With the module |
| Per plan | `DISCOVERY`, `EVIDENCE`, `SPEC_SUMMARY`, `PLAN`, `DECISIONS`, `RESEARCH` (+ `decomposition/` contracts) | With the plan |
| Per feature | Domain review, API profile, web profile, mobile profile (or an explicit Excluded/Deferred line), `IMPLEMENTATION-REQUEST.md`, review artifacts, `required-files.json` | Phase 00 onward |
| Generated | Phase packets | Per DEC-017 |
| `templates/` | `README.md`, `New-ErpWorkspace.ps1` | S5 |
| `packages/` | `tokens/` | Now |

Anything else needs an owner and an inbound link, or it is archived.

## 7. Clean-up inventory

| Group | Files now | Target | Reduction |
| --- | --- | --- | --- |
| `templates/planning/` | 50 | 0 (+2 skills in `.codex/skills/`) | −48 |
| Accounting phase stubs + duplicate source plan | 23 | 0 (table in phases README, one source file) | −23 |
| Placeholder module sub-READMEs | 32 | ~10 with content | −22 |
| `old files/` | 26 | 0 (git history) | −26 |
| Duplicate frontend roadmap | 1 | 0 | −1 |
| Unreferenced docs (DOC-6, excluding the above) | 30 | linked or archived | up to −10 |
| **Total** | | | **≈ −130 files**, no knowledge lost |

Generated packets (101) are excluded from this count; DEC-017 decides them.

## 8. Order of work

1. Write `erp-business-planning` and `erp-legacy-migration` skills; delete `templates/planning/` (S2).
2. DOC-2, DOC-3: reconcile, then delete duplicates.
3. DOC-4: change `New-ErpModule.ps1`, then remove empty sub-READMEs.
4. DOC-6: link or archive; Kanban stories to the S8 kanban plan.
5. DOC-7, DOC-9, DOC-10 after DEC-018.
6. Run `Check-Planning.ps1` and `Generate-Documentation.ps1 -Check` after each step.
