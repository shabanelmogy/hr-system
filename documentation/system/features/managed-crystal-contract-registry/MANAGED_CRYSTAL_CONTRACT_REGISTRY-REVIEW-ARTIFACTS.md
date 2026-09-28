# Managed Crystal Contract Registry — Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | `managed-crystal-contract-registry` |
| Plan / slice | `managed-crystal-reporting-reliability` / `Slice 1 — Managed Crystal Reporting Reliability` |
| Screen/Workflow Contract | `documentation/plans/business/managed-crystal-reporting-reliability/decomposition/managed-crystal-contract-registry.md` |
| API surface | No new public route in this child |
| Web / Mobile | No implementation change; explicit Excluded rows for this child |
| Review date | `2026-09-27` |
| Documentation state | Phase 06 Verified; bounded child Closed |
| Required-file manifest | `documentation/system/features/managed-crystal-contract-registry/required-files.json` |
| Implementation request | `documentation/system/features/managed-crystal-contract-registry/IMPLEMENTATION-REQUEST.md` |

## Requirement manifest

| ID | Requirement | Current evidence | Target evidence | Status |
| --- | --- | --- | --- | --- |
| R-01 | One canonical versioned artifact | Runtime hard-coded four name-only profiles | Identical packaged artifact/fingerprint in both processes | Verified |
| R-02 | Exact schema/filter/limit/parameter contract | Runtime checked names only | Strict models/loaders/parity tests | Verified |
| R-03 | Preserve business-data ownership and runtime DB isolation | Existing provider/runtime boundary | No forbidden coupling | Verified |
| R-04 | Add tenant/company `fiscalyears` exact 16-column contract | Provider/clients existed; runtime profile absent | Provider and runtime lookup pass | Verified |
| R-05 | Keep public routes, permissions and clients unchanged | Existing contracts | Diff/applied-profile evidence | Verified |
| R-06 | Exclude sibling inspection/lifecycle/UI/operations/security work | Plan roadmap | Phase 06 scope reconciliation | Verified |

## Current evidence register

| ID | Classification | Claim | Exact evidence | Consequence |
| --- | --- | --- | --- | --- |
| E-01 | Verified current | Runtime supports four hard-coded entities. | `CrystalReportProfileRegistry.cs::CreateDefault` | Replace source; add Fiscal Years via artifact. |
| E-02 | Verified current | Runtime profile stores entity plus required names only. | `CrystalReportProfileRegistry.cs::CrystalReportProfile` | Add exact metadata. |
| E-03 | Verified current | Render schema check only finds missing names. | `CrystalReportRenderService.cs::ValidateSchema` | Exact enforcement remains later; registry enables it. |
| E-04 | Verified current | Fiscal Years provider emits 16 fields and Code/Name filters. | `AccountingCrystalReportProviders.cs::FiscalYearsCrystalReportDataProvider` | Freeze schema/nullability. |
| E-05 | Verified current | Reporting DI registers Fiscal Years provider. | Reporting `DependencyInjection.cs` | Provider exists. |
| E-06 | Verified current | Web/Mobile use `fiscalyears`. | `FiscalYearReportPage.tsx`; `FiscalYearReportView.tsx` | No client key change. |
| E-07 | Requested target | Business correctness first; security last. | Plan/requester decision | Keep security sibling out. |

## Existing-System Relationship Review

Reporting managed Crystal is the existing owner. This child replaces only its
duplicated contract source. Accounting/ReferenceData retain business truth through
public Contracts. The runtime remains an independent database-isolated SDK adapter.
No module, aggregate, endpoint, permission or client screen is added.

## Platform decisions

| Capability | API/runtime | Web | Mobile |
| --- | --- | --- | --- |
| Contract artifact/load | Required | Excluded | Excluded |
| Provider exact parity | Required | Excluded | Excluded |
| Fiscal Years runtime lookup | Required | No code change | No code change |
| Visible Fiscal Years PDF | Deferred | Deferred | Deferred |
| Report Manager changes | Deferred | Deferred | Excluded |
| Import | Excluded | Excluded | Excluded |
| Offline/mock data | N/A | N/A | N/A |

## Reporting contract

| Field | Decision |
| --- | --- |
| Engine | Managed Crystal |
| Entities | `countries`, `states`, `districts`, `addresstypes`, `fiscalyears` |
| Table | `ReportData` |
| Scope | Existing approved scopes; Fiscal Years is tenant/company |
| Types | `int32`, `string`, `datetime` |
| Parameters | Required single discrete string `Language`; `ar|en` |
| Permissions | Existing API permission and Run ACL unchanged |
| Verification | Artifact/parser/fingerprint/provider/runtime parity; PDF deferred |

## Findings and ownership

| ID | Severity | Finding | Owner | Resolution |
| --- | --- | --- | --- | --- |
| F-01 | Resolved | Runtime and Reporting lacked one exact entity contract. | Reporting/runtime | Canonical v1 artifact embedded from one source. |
| F-02 | Resolved | Fiscal Years had no runtime profile. | Reporting/runtime | Exact tenant/company entry and lookup verified. |
| F-03 | Resolved | Required Fiscal Year DataColumns inherited nullable defaults. | Reporting | All provider columns now declare exact nullability; tested. |
| F-04 | Resolved | Runtime had no automated registry tests. | Runtime | Legacy-compatible deterministic harness added and passed. |
| F-05 | Inherited | Planning checker recognizes contract v2.0 while user-edited Accounting Fiscal Years contract is v2.1. | Planning owner | Record only; do not alter Accounting work here. |

## Phase 00 verification

| Check | Result | Date |
| --- | --- | --- |
| Graphify query | Completed; direct runtime source inspection supplemented graph gaps | 2026-09-27 |
| Documentation baseline | Passed for 101 recipes before scaffold | 2026-09-27 |
| Scaffold preview/create | Passed | 2026-09-27 |
| Planning check | Inherited `accounting-core-gl` contract-version failure; this plan is separately parseable | 2026-09-27 |
| Phase 00 recipes/docs | 109-recipe documentation check passed | 2026-09-27 |
| Focused registry/provider tests | Passed 25/25 | 2026-09-27 |
| Full Reporting tests | Passed 110/110 | 2026-09-27 |
| API architecture tests | Passed 59/59 | 2026-09-27 |
| Runtime solution build | Release x64 passed for runtime and harness | 2026-09-27 |
| Runtime contract harness | Passed semantic negatives, five entities, Fiscal Years and byte/fingerprint parity | 2026-09-27 |

## Phase 00 decision

Ownership, boundary, UI exclusions, permissions, rules, edge cases and impact are
reconciled with implementation. Phase 00 and runtime gates passed. Phase 06 is
`Verified`; customer education is N/A for this internal foundation; this bounded
child is Closed. The finding F-05 remains inherited and outside this child.
