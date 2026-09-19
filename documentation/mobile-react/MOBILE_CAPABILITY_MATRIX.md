# Mobile capability decisions

Date: 2026-09-19. These decisions define the mobile foundation boundary. A
Deferred or Excluded capability has no runtime placeholder that implies support.

| Capability | Decision | Owner | Current contract | Reopening trigger |
|---|---|---|---|---|
| Auth, tenant and company switching | **Required** | Platform Identity/Tenancy | Server-authoritative session with bounded offline lease | Always required |
| Scoped module entitlements | **Required** | Platform Modules | Encrypted bounded snapshot tied to the session lease | Always required |
| Files and attachments | **Required** | Platform Files | Online-authoritative bearer upload/download and sensitive cache cleanup | Offline attachment work requires a separate retention and replay protocol |
| Managed reporting | **Required** | Platform Reporting | Online generation/download; no embedded Crystal runtime | Offline report packs require an explicit product requirement |
| Workforce-plan offline drafts | **Required** | HR Workforce | RowVersion, outbox, uncertain reconciliation and Sync Center | Extend only per certified command |
| General offline writes | **Excluded** | Each business module | No generic HTTP queue | Reopen per operation after idempotency/concurrency/reconciliation approval |
| Payments, posting and stock reservation offline | **Excluded** | Accounting/POS/Inventory | Online-authoritative | Reopen only with server idempotency and financial/stock reconciliation design |
| Push notifications | **Deferred** | Platform Notifications | In-app/realtime notifications only | Server device-registration contract and notification privacy policy approved |
| Cross-module approvals inbox | **Deferred** | Platform Workflow | Module-owned approvals remain in their modules | Shared workflow API and ownership accepted |
| Barcode scanning | **Deferred** | POS/Inventory | No scanner dependency | POS or Inventory release scope requires device scanning |
| Receipt/document printing | **Deferred** | POS/Reporting | Share/open generated files | Printer protocols and supported hardware list approved |
| Biometric unlock | **Excluded** | Platform Identity | It cannot replace server authority; tokens remain in SecureStore | Reopen only as local convenience after threat-model review |
| Global ERP search | **Deferred** | Platform Search | Feature-scoped server search | Cross-module search API and result authorization contract exists |

Every new module must update this table when it adds a device capability,
background behavior, local persistence, notification channel, file type, or
offline mutation.
