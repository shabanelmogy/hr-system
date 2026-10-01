# Managed Crystal Reporting Reliability — Implementation Roadmap

## Status authority

This is the dependency/status roadmap for Plan
`managed-crystal-reporting-reliability`. `PLAN.md` owns product scope and business
decisions.

**ACTIVE_FEATURE_STEP:** managed-crystal-manager-experience

Exactly one feature may be Active. Every later feature remains Queued until the
active child is Verified and its documentation/closure stage is Closed.

## Delivery order

| Order | Feature ID | Phase | Status | Outcome | Entry gate | Exit gate |
| ---: | --- | --- | --- | --- | --- | --- |
| 0 | `managed-crystal-planning-preflight` | Planning and contract preflight | Closed | Approve target contract, migration policy, child contract, required files and exact acceptance fixtures. | Requester authorized continuation on 2026-09-27. | Phase 00 scaffold, execution matrices, initial applied books, final preflight manifest and generated Phase 00 check passed. |
| 1 | `managed-crystal-contract-registry` | Business contract foundation | **Verified / Closed** | One canonical typed registry covers all supported entities and includes exact `fiscalyears` schema/scope/filters/parameters. Providers and runtime prove parity. | Approved child contract plus Phase 00 exit. | 110 Reporting tests, 59 architecture tests, Release x64 runtime/harness build and byte/fingerprint parity passed. |
| 2 | `managed-crystal-template-validation` | Entity-aware inspection and lifecycle | **Verified / Closed** | Upload/import/version/publish operate on an entity contract fingerprint; incompatible templates cannot become Valid or published; existing versions are revalidated. | Phase 1 Closed. | Code, migration, live development schema, 120 Reporting tests, 59 architecture tests and semantic runtime harness pass. Real `.rpt`/PDF acceptance is Deferred to Phase 4 under `RISK-008` and does not block current development. |
| 3 | `managed-crystal-manager-experience` | Report Manager workflow | **Active — integrated verification** | Web manager selects a supported entity, displays compatibility/revalidation state and actionable errors, and preserves exact permissions/concurrency behavior. | Phase 2 Closed. | API-backed Web create/import/upload/revalidate/publish/grant/archive journeys and focused tests pass in EN/AR + RTL/LTR. |
| 4 | `fiscal-years-managed-crystal-report` | Fiscal Years business acceptance | Queued | A real `fiscalyears` template renders company-scoped Fiscal Years/Periods with Code/Name filters and Language `ar|en` through Web and actual Mobile. | Phase 3 Closed and approved Fiscal Years `.rpt` fixture exists. | Authenticated API/Web/Mobile live journey, tenant/company isolation, Run ACL and visual/business acceptance are Verified. |
| 5 | `managed-crystal-runtime-operations` | Runtime reliability and deployment | Queued | Runtime tests, package/catalog readiness, cancellation, bounded concurrency, memory/streaming and diagnostics are production-operable without changing business ownership. | Phase 4 Closed. | Release package + installed runtime + catalog + failure/recovery/load smokes pass; `PROD-025` evidence is recorded for the candidate environment. |
| 6 | `managed-crystal-security-hardening` | Security and dependency hardening — final implementation phase | Queued | Remove default/committed secrets and Swagger exposure, enforce protected transport/configuration, upgrade supported Crystal/logging dependencies and verify redaction. | Phase 5 Closed; current vendor documentation rechecked. | Threat/config/dependency tests and staging render regression pass; no unresolved release-blocking security finding remains. |
| 7 | `managed-crystal-closure` | Integrated verification and documentation closure | Queued | Canonical API/Web/Mobile/Reporting/runtime books, manifests, recipes and customer/admin guidance match the verified implementation. | Phase 6 Closed. | Phase 06 is `Verified`, Phase 07 is Closed, docs generation/checks pass, and the plan status is updated. |

## Sequencing rules

1. Only one feature may be Active, and its vertical order is API/runtime contract →
   Web → Mobile where applicable → integrated live verification → documentation.
2. A later phase cannot begin merely because code exists; the prior phase must meet
   its tests, migration/documentation and acceptance gates.
3. Phase 4 is the first complete business proof. Passing Phase 1–3 alone does not
   prove Fiscal Years reporting works.
4. Security remains last by request, but Phase 7/release cannot close without it.
5. Any change to the canonical entity contract reopens provider, runtime, template,
   Web/Mobile viewer and generated-documentation verification.

## Planned feature decomposition

The runtime implementation units are the Phase 1–6 Feature IDs above. Each receives
its own version 2.0 contract immediately before authorization. Infrastructure-only
children still record Web and Mobile as explicit `Excluded` or `Deferred` rows; the
manager and Fiscal Years children record their real screens/routes and platform
decisions. This prevents a generic “Crystal hardening” umbrella from claiming that
all business journeys are complete.
