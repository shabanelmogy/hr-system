# Planning Registry

This is the central index for ERP business/build plans.

## Rules

- Every plan gets one stable kebab-case Plan ID.
- Registry points to the canonical plan; it does not duplicate it.
- Update status whenever a quality gate changes.
- Never mark `Implementation Ready` until G0–G4 pass.
- Deferred plans require a reopening trigger.
- Closed plans remain indexed.

## Active plans

| Plan ID | Capability | Module | Status | Canonical plan | Target | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `frontend-foundation-hardening` | Frontend foundation / hardening | Cross-cutting Web | In Progress | `ERP_FRONTEND_MASTER_PLAN.md` | Current | Existing canonical plan; register in place rather than move it. |
| `enterprise-saas-core` | Enterprise SaaS production core | Cross-platform Platform | In Progress | `documentation/project/ENTERPRISE_SAAS_CORE_ROADMAP.md` | Enterprise Pilot | P0 contains completed and still-open items; canonical roadmap remains in place. |
| `workforce-planning` | Workforce Planning to Hire | HR + Accounting integration | In Progress | `documentation/system/features/workforce-planning/IMPLEMENTATION-REQUEST.md` | V1 | Phases 0–6 source/migrations and automated checks are recorded; deployment/browser/mobile evidence remains separately tracked. |
| `mobile-erp-readiness` | Mobile ERP foundation and release readiness | Cross-cutting Mobile | In Progress | `documentation/mobile-react/MOBILE_ERP_READINESS_AND_PHASED_PLAN.md` | Preview/Store readiness | Repository foundation is advanced; external artifact/device release gates are centralized under `notes/`. |

## Planned / Draft

| Plan ID | Capability | Module | Status | Canonical plan | Target | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `omnichannel-erp-product` | Omnichannel ERP / digital channels product blueprint | Cross-platform | Draft | `documentation/project/OMNICHANNEL_ERP_PRODUCT_BLUEPRINT.md` | Long-term | Product/ownership/sequencing blueprint; does not create runtime modules or routes. |
| `van-sales` | Van Sales / field sales | Sales + Inventory + Accounting + Mobile | Draft | `documentation/project/VAN_SALES_PRODUCT_PLAN.md` | Future MVP | Future product/implementation plan; prerequisite business modules must be stabilized first. |
| `accounting-delivery` | Accounting module delivery | Accounting | Draft | `documentation/modules/accounting/DELIVERY-ROADMAP.md` | Module roadmap | Canonical module roadmap; individual capabilities use separate gated business plans. |
| `accounting-core-gl` | Accounting Core General Ledger | Accounting | Draft | `documentation/plans/business/accounting-core-gl/PLAN.md` | Accounting Core V1 | Overall plan/release remains Draft/G4-gated; Slice 1 — Ledger Setup Spine is explicitly execution-ready after G0–G3 for that bounded slice. Existing Fiscal Years is reused rather than rebuilt. |
| `point-of-sale-delivery` | Point of Sale module delivery | PointOfSale | Draft | `documentation/modules/point-of-sale/DELIVERY-ROADMAP.md` | Module roadmap | Foundation exists; first domain slice still requires full planning gates. |
| `inventory-delivery` | Inventory module delivery | Inventory | Draft | `documentation/modules/inventory/DELIVERY-ROADMAP.md` | Module roadmap | Foundation exists; first domain slice still requires full planning gates. |
| `contacts-delivery` | Contacts module delivery | Contacts | Draft | `documentation/modules/contacts/DELIVERY-ROADMAP.md` | Module roadmap | First Party slice exists; future slices must be planned independently. |
| `crm-delivery` | CRM module delivery | CRM | Draft | `documentation/modules/customer-relationship-management/DELIVERY-ROADMAP.md` | Module roadmap | Appointments exists; broader CRM roadmap requires reconciliation and gated feature plans. |
| `reference-data-delivery` | Reference Data module delivery | ReferenceData | Draft | `documentation/modules/reference-data/DELIVERY-ROADMAP.md` | Module roadmap | Several geographic/reference slices exist; future capabilities require their own gated plans. |
| `reporting-delivery` | Reporting module delivery | Reporting | Draft | `documentation/modules/reporting/DELIVERY-ROADMAP.md` | Module roadmap | Crystal Reports exists; future reporting capabilities require gated plans. |
| `hr-delivery` | HR module delivery | HR | Draft | `documentation/modules/hr/DELIVERY-ROADMAP.md` | Module roadmap | Feature-specific canonical books remain authoritative over the high-level roadmap. |
| `platform-delivery` | Platform technical capability delivery | Platform | Draft | `documentation/modules/platform/DELIVERY-ROADMAP.md` | Module roadmap | Additional ownership moves require concrete evidence, not cosmetic restructuring. |
| `crystal-report-ai-view-designer` | AI report view/designer | Reporting | Draft | `documentation/system/features/crystal-report-manager/AI_REPORT_VIEW_DESIGNER_PLAN.md` | Future reporting slice | Must pass G0–G4 before runtime implementation begins. |

## Deferred

| Plan ID | Capability | Module | Owner | Reopen trigger | Canonical plan |
| --- | --- | --- | --- | --- | --- |

## Closed

| Plan ID | Capability | Module | Closed date | Canonical plan | Verification |
| --- | --- | --- | --- | --- | --- |

## Existing plans

Do not move established canonical plans just to make this registry tidy. Register the current canonical path first. Move only as a separate documentation restructuring task that updates all links/manifests/generation gates.

Existing plans imported into this registry default to `Draft` unless their current
canonical evidence clearly supports a stronger status under this planning system.
Being detailed or historically implemented is not by itself evidence that G0–G4
have been reconciled.

## Cross-plan note registries

Production-only checks, deferred improvements, known risks, follow-ups, and open
decisions are not duplicated across plans. They live under
`documentation/plans/notes/` and are referenced by stable IDs.
