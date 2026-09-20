# Accounting Core GL — Research Notes

## Repository research

| Topic | Finding | Planning use |
| --- | --- | --- |
| Accounting foundation | Existing module layers/bootstrap/tests/DbContext/schema/migrations | Reuse current module |
| Fiscal Years | Existing CQRS/API/Web/Mobile/lifecycle/permissions/tests | Verified dependency/reference |
| Messaging | Accounting-local Inbox/Outbox exist | Reuse integration reliability |
| Contacts | Accounting PartyReference projection exists | Preserve Party ownership |
| Web components | Shared forms/grid/header/dialogs/states/tree exist | Reuse mapping |
| Mobile components | AppForm/AppDataTable/AppListScreen/AppHierarchicalTree/dialogs/states exist | Reuse mapping |
| Planning system | Discovery → Evidence → Spec → Plan → G0–G4 | Canonical planning flow |

## Source material

- `ACCOUNTING_MODULE_PHASES_AR.md`
- `documentation/modules/accounting/phases/SOURCE-PLAN_AR.md`
- `documentation/modules/accounting/ARCHITECTURE.md`
- `documentation/modules/accounting/DELIVERY-ROADMAP.md`

Historical plans are context, never proof of current implementation when runtime
source disagrees.

## External comparison material

The historical Accounting source includes Odoo, Dynamics 365 Finance and NetSuite
comparison links. They are capability-completeness references only; they do not
freeze ERPSYSTEM policy, country compliance, UI or ownership.

## Research still required

1. Statutory/accounting/retention requirements after DEC-007 selects jurisdiction.
2. Exact multi-book/reporting-currency requirements if DEC-008 enables them.
3. Representative journal/ledger/query scale before production approval.
4. Legacy-source schema/quality when a real cutover source is selected.
