---
name: erp-legacy-migration
description: Use when an external application (its code, database, or documents) must be analyzed so its business is rebuilt as an ERPSYSTEM module or feature, or when its production data must be migrated into ERP. Produces plan evidence under documentation/plans; it does not port the external architecture.
---

# ERPSYSTEM Legacy Migration

An external application is evidence of business behavior, not a design to copy. The
target is always an ERP module that follows the ERP architecture, tenancy, permissions,
and shared UI. Work inside a registered business plan
(`./documentation/plans/New-BusinessPlan.ps1`) and hand back to `erp-business-planning`
§3 or §4 when the analysis is done.

## 1. Intake

Record in the plan's `RESEARCH.md`: source location and version, technology, whether data
migration is in scope, who can answer business questions, and the UI policy (keep flows,
keep screens, or redesign on ERP patterns — the default is ERP patterns).

## 2. Inventory

List screens/routes, endpoints or server actions, entities/tables, background jobs,
integrations, reports, and roles. Cite the source path for each item. Mark items out of
scope with a reason. Put the inventory in `RESEARCH.md`.

## 3. Behavior extraction

For every in-scope item write the actual behavior as evidence rows in `EVIDENCE.md`:

- classification `VERIFIED CURRENT` means verified in the external source, and the Source
  column names that repository and path;
- business rules and invariants with their enforcement point in the source;
- actor visibility (who sees which records) — this drives record scope;
- relationships with cardinality, required/optional, delete behavior, uniqueness.

Distinguish what the code does from what the business wants (`REQUESTED TARGET`).

## 4. Defects and disposition

List defects found in the source (authorization gaps, race conditions, invalid states,
hard-coded data). Each gets a decision in `DECISIONS.md`: fix in target (default), keep
deliberately, or out of scope. Each fixed defect becomes a negative acceptance test in the
feature contract.

## 5. Map to ERP ownership

For each concept decide the ERP owner before designing: Platform (users, tenant,
company), an existing module (HR employees, Contacts parties, Accounting financial truth),
or the new module. Record cross-module links as optional dependencies through public
Contracts or local projections, following the Accounting ↔ Contacts example. Map the
source's tenant notion onto Tenant + Company explicitly. Open questions become `DEC-###`.

## 6. Screens

Map each source screen to an ERP pattern with `erp-business-planning` §7. Do not recreate
the source layout when an ERP pattern fits.

## 7. Data migration (only when in scope)

Add a migration section to `PLAN.md` and `PROD-###` notes for production-only steps:

- source-to-target field mapping, transforms, defaults, and rejected-row rules;
- identity and credential handling (never import passwords as-is; define activation);
- tenant/company assignment for every row; row versions are generated, not imported;
- order of load respecting foreign keys; idempotent re-run;
- reconciliation queries (counts, sums, key samples) per entity, and a rehearsal on a copy
  before production;
- rollback plan and cut-over window.

## Output checklist

- `RESEARCH.md` inventory complete with source paths.
- `EVIDENCE.md` rows for behavior, rules, visibility, relationships.
- `DECISIONS.md` has a disposition for every defect and every ownership choice.
- Open questions recorded as `DEC-###`; production steps as `PROD-###`.
- `Check-Planning.ps1` passes.
