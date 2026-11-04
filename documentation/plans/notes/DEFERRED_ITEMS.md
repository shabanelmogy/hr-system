# Deferred Items

Accepted work intentionally postponed. A deferred item is **owned work**, not an
untracked TODO.

| ID | Surface | Area | Item | Reason deferred | Owner | Status | Reopen trigger | Target | Canonical source |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-025 | Cross-platform | Additional UI languages | Add language creation and metadata/direction/plural support beyond English/Arabic as separately scoped work. | Requester selected English/Arabic only for the first phase on 2026-10-17. | Product + Platform | Deferred | An additional language is explicitly required | After company localization V1; date not scheduled | `documentation/plans/business/platform-user-permissions-and-company-localization/SPEC_SUMMARY.md` |
| DEF-001 | Web | i18n/performance | Load only the active language instead of all translation resources. | Current startup baseline is acceptable; optimize from measured evidence. | Web | Deferred | Production bundle/runtime evidence shows material translation cost | Evidence-driven | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| DEF-002 | Cross-platform | Reporting/charts | Introduce chart-specific whole-dataset contracts where needed. | Not a startup blocker. | Web/API | Deferred | A concrete chart requires large unpaged datasets or current query shape becomes bottleneck | Evidence-driven | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| DEF-003 | Web | Realtime | Reduce realtime-token hop if latency/complexity justifies it. | Current contract is hardened and functioning. | Platform/Web | Deferred | Production trace shows meaningful token-hop cost | Evidence-driven | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| DEF-004 | Web | Calendar/Kanban | Additional FullCalendar/Kanban tuning. | No confirmed production bottleneck. | Web | Deferred | User-visible latency or performance telemetry identifies issue | Evidence-driven | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| DEF-005 | Web | Entitlements | Fetch tenant entitlements on intent instead of current timing. | Current behavior is acceptable. | Platform/Web | Deferred | Production navigation/startup evidence shows material benefit | Evidence-driven | `documentation/guides/web/ERP_FRONTEND_MASTER_PLAN.md` |
| DEF-006 | API | Address owner links | Add Company/Branch/Employee/Work Location owner-link CQRS commands with purpose-specific policy and transaction locks. | Address foundation and core CQRS are already complete; owner-specific slices are separate work. | ReferenceData/API | Deferred | An owning feature requires writable address links | Feature-driven | `documentation/modules/reference-data/features/addresses/addresses-api.md` |
| DEF-008 | Cross-platform | Workforce separation of duties | Replace the temporary built-in admin approval exception with a delegated separation-of-duties policy. | Current V1 explicitly allows the built-in admin exception while non-admin self-approval fails. | HR/Product/Security | Deferred | Delegated approval governance is required by product/compliance | Policy-driven | `documentation/modules/hr/features/workforce-planning/workforce-planning-api.md` |
| DEF-009 | API | Workforce budget approval permission | Introduce delegable `WorkforceBudgets:Approve` instead of direct built-in admin restriction. | V1 budget approval is intentionally admin-only. | HR/API Authorization | Deferred | Delegated budget approvers are required | Policy-driven | `documentation/modules/hr/features/workforce-planning/workforce-planning-api.md` |
| DEF-011 | Mobile | Attendance devices | Keep Attendance device/provider workflow out of Mobile until provider/device and hosted HR contracts are approved. | Mobile route/registry intentionally absent. | HR Attendance + Mobile | Deferred | Provider/device matrix and hosted HR contract are approved | Capability-driven | `documentation/guides/mobile/MOBILE_CAPABILITY_MATRIX.md` |
| DEF-012 | Mobile | Push notifications | Add native push only after device-registration and notification-privacy contracts are approved. | Current mobile notification contract is in-app/realtime only. | Platform Notifications + Mobile | Deferred | Device registration contract and privacy policy are approved | Capability-driven | `documentation/guides/mobile/MOBILE_CAPABILITY_MATRIX.md` |
| DEF-013 | Mobile | Cross-module approvals inbox | Add a shared approvals inbox only after workflow ownership and a shared workflow API are accepted. | Approval flows remain module-owned today. | Platform Workflow + Product | Deferred | Shared workflow API and ownership are approved | Capability-driven | `documentation/guides/mobile/MOBILE_CAPABILITY_MATRIX.md` |
| DEF-014 | Mobile | Barcode scanning | Add scanner/device support only when POS or Inventory release scope requires it. | No scanner dependency is justified in the current foundation. | POS/Inventory + Mobile | Deferred | A Required POS/Inventory workflow needs device scanning | Capability-driven | `documentation/guides/mobile/MOBILE_CAPABILITY_MATRIX.md` |
| DEF-015 | Mobile | Receipt/document printing | Add native printer integration only after supported hardware/protocols are frozen. | Current contract shares/opens generated files instead. | POS/Reporting + Mobile | Deferred | Printer protocols and supported hardware list are approved | Capability-driven | `documentation/guides/mobile/MOBILE_CAPABILITY_MATRIX.md` |
| DEF-016 | Mobile | Global ERP search | Add cross-module global search only after the server search and result-authorization contract exists. | Current search is feature-scoped and server-owned. | Platform Search + Mobile | Deferred | Cross-module search API and authorization contract are approved | Capability-driven | `documentation/guides/mobile/MOBILE_CAPABILITY_MATRIX.md` |
| DEF-017 | Cross-platform | Work Location entity | Introduce a standalone Work Location aggregate only when assignment, working-hours, capacity, attendance, or geofencing needs an independent lifecycle. | Branch plus `BranchAddress` currently supplies physical work location. | HR + ReferenceData | Deferred | First workflow needs Work Location lifecycle independent of Branch | Domain-driven | `documentation/modules/reference-data/GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md` |
| DEF-018 | Cross-platform | Branch/location target authorization | Add branch/location target-population authorization and `UserBranchAccess` with the first branch-restricted workflow. | Current token/session model does not need branch identity embedded. | Platform + HR | Deferred | A Required workflow is branch-restricted | Domain-driven | `documentation/modules/reference-data/GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md` |
| DEF-019 | Cross-platform | Geographic effective dating | Add effective dating to the relationship that needs historical truth rather than to the Country master. | Current Branch lifecycle already owns open/close dates; other relations do not yet need temporal history. | ReferenceData + owning modules | Deferred | A Required workflow needs historical operating-country/address/location truth | Domain-driven | `documentation/modules/reference-data/GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md` |
| DEF-020 | Cross-platform | Employee and emergency addresses | Add privacy-governed EmployeeAddress and EmergencyContactAddress APIs/clients when the employee feature requires them. | Reusable Address foundation exists; privacy-specific owner surface is not yet Required. | HR + ReferenceData | Deferred | Employee profile/emergency-contact scope requires structured addresses | Feature-driven | `documentation/modules/reference-data/GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md` |
| DEF-021 | Cross-platform | Country-specific address formatting | Add country-specific postal validation and presentation rules only when target-country rollout requires them. | Reusable Address remains country-neutral; statutory owner rules belong to owner-link commands. | ReferenceData + Product | Deferred | A target country requires validated postal/address formatting | Country-rollout | `documentation/modules/reference-data/GEOGRAPHICAL_INFORMATION_DOMAIN_GUIDE.md` |
| DEF-022 | Cross-platform | Inventory PIM/Catalog extraction | Split a dedicated PIM/Catalog context from Inventory only if media/content, variants, or multi-channel localization complexity justifies an ADR. | Operational product truth remains Inventory-owned today. | Inventory + Architecture | Deferred | Catalog/content complexity exceeds the operational Inventory boundary | Architecture-driven | `documentation/modules/inventory/ARCHITECTURE.md` |
| DEF-023 | Cross-platform | Attendance geofence radius | Add `GeofenceRadiusMeters` to the branch work-location address for mobile check-in. | No mobile attendance capture exists yet. | HR + ReferenceData | Deferred | Mobile attendance capture enters scope | Feature-driven | `documentation/modules/hr/DELIVERY-ROADMAP.md` |
| DEF-024 | Cross-platform | Employee management | Complete the Employee feature: direct manager on `EmployeeAssignment`, web and mobile management screens on the shared patterns, and Excel import / ID-card export. Employee addresses are DEF-020. | `Employee`, `EmployeeAssignment` and `EmployeeContract` exist in the HR domain; no client surface is Required yet. | HR | Deferred | Employee management becomes the current HR slice | Feature-driven | `documentation/modules/hr/DELIVERY-ROADMAP.md` |
| DEF-026 | Web | Partial Prefetching adoption | Review existing full-prefetch links, capture production navigation baselines and adopt Next.js Partial Prefetching with authenticated navigation regression coverage. | The 2026-10-27 security update uses the documented `partialPrefetching: false` compatibility setting to preserve current behavior; changing prefetched UI is a separate navigation migration. | Web Architecture | Deferred | A navigation-performance migration is authorized, or before a Next.js major removes the compatibility option | Before the framework requires the new behavior | `web-next/next.config.ts`; `documentation/guides/web/architecture/frontend-architecture-reference.md`; https://nextjs.org/docs/app/guides/adopting-partial-prefetching |

| DEF-027 | Cross-platform | Reporting View Builder | Build the visual query/source builder and approve additional module/company data contracts, integrating the existing manual View/template workflow. | Requester chose manual SQL View names and initial shared global data until the Builder is separately implemented. | Reporting + source-module owners | Deferred | Requester authorizes the Builder or another scoped source contract | Separate approved feature; no date promised | `documentation/plans/business/global-crystal-template-management/DESIGN_SOURCE_WORKFLOW_2026-11-02.md` |

| DEF-028 | Cross-platform | Crystal empty-template preparation and base-design library | Resume the empty-template preparation journey and introduce a folder/library of reusable base RPT designs with Designer packages and template selection. | Requester explicitly deferred this step on 2026-11-03 to test a ready-made RPT and actual rendering first. | Reporting + Angular Architecture + QA | Deferred | A ready-made RPT passes inspection, explicit publication and actual PDF display; then the requester explicitly resumes this work | After ready-made report rendering acceptance; no date scheduled | `documentation/plans/business/global-crystal-template-management/PLAN.md`; `documentation/modules/reporting/features/global-crystal-template-manager/global-crystal-template-manager-review.md` |

## DEF-028 — Empty-template preparation and reusable base designs

- Source/context: requester decision2026-11-03: postpone the empty-file step, upload
  a ready-made RPT and verify display first; explicitly requested central deferral.
- Surface: API, Web, Data, Cross-platform. Owner: Reporting + Angular Architecture + QA.
- Status: Deferred. Target: after ready-made report rendering acceptance; no date set.
- Deferred scope: further empty-template preparation work and its acceptance journey;
  collecting/reviewing multiple blank/base RPT files, their central Templates folder,
  selectable layout library and inclusion in Designer packages. The base-design
  library was discussed only; it is not claimed implemented or delivered.
- Verified baseline/impact: existing metadata-only drafts, SQL Views, XSD packages
  and source bindings remain implemented. This documentation decision does not
  remove controls, delete drafts/files/Views, roll back migrations or change runtime.
  None of the deferred work blocks testing an existing ready-made report.
- Current priority: upload a ready-made RPT using the existing file-first path or
  add a version to an existing draft, inspect it, correct any actual validation
  failure, explicitly publish a valid version and verify real PDF rendering/display.
  Retain native validation, approved source contracts and company/role authorization.
- Reopen trigger: record successful inspection, publication and real PDF display
  of a ready-made RPT, then receive an explicit requester instruction to resume the
  deferred preparation/library work. Passing this check alone does not auto-start it.
- Related IDs: FOLLOW-024/PROD-028 retain real hosted/native acceptance. DEF-027 is
  the separately deferred View Builder; this item does not merge with or reopen it.
- Closure evidence: none; this item is not Verified or Closed. On resumption,
  scope/validate the supplied base RPT files and record their own acceptance evidence.


### DEF-028 — optional RPT Language guidance2026-11-03

On explicit resumption of designer preparation, reconcile package/UI guidance so
render-input ar/en requirements are distinguished from optional RPT Language binding.
The current ready-made-report correction is native-only and does not resume DEF-028.
Canonical active evidence: OPTIONAL_RPT_LANGUAGE_2026-11-03.md in the current plan.


### DEF-028 — first display prerequisite2026-11-03

Requester confirmed report display with data. This advances the display prerequisite
only; no explicit resumption instruction was given. DEF-028 stays Deferred. Exact
evidence boundaries are FIRST_REPORT_DISPLAY_2026-11-03.md in the current plan.
