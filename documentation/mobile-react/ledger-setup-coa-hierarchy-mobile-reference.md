# Accounting Chart of Accounts and Hierarchy — Expo Implementation Contract

Status: **Phase 00 target contract; current generic Ledger Setup screen is evidence only.**

## 1. Feature boundary

Own focused Mobile Accounts and Hierarchy Levels workflows under existing Finance
Ledger Setup routes. Target code uses typed child domain/runtime schemas/repository/
use-cases/queries; the generic `LedgerSetupRecord` renderer is not the final architecture.

## 2. Route and module registration

Keep `/finance/ledger-setup/accounts` and `/finance/ledger-setup/hierarchy-levels`
inside the existing Accounting/Finance registration. RouteGuard/view permission and
global read-only behavior stay shared; no parallel module/root is introduced.

## 3. Domain and runtime schemas

Define runtime-validated AccountTreeNode, AccountDetail, AccountHierarchyLevel,
AccountPage, lookup and ProposedAccountCode schemas. RowVersion is opaque; company/
tenant scope is never authored by the device.

## 4. Repository and use-case layer

Remote data source serializes exact endpoints; repository maps transport to child
domain models; use cases orchestrate client-only behavior. D-024 proposal is fetched
from the server, never calculated by the device.

## 5. Query state

Use stable child keys for Account list/tree/detail/lookup/proposal and Hierarchy
Levels. Server page/search/status/sort are authoritative. Real totals are consumed
from the API; the current synthesized future-page total is a gap to remove.

## 6. Chart of Accounts tree

Reuse `AppHierarchicalTree` for touch-friendly hierarchy/search/selection/actions.
Do not infer hierarchy from code and do not implement custom tree physics. Parent
changes are form-driven unless a separate approved Accounting API contract is added.

## 7. Account form and detail

Create fetches the D-024 `ACC-####` proposal and keeps Code editable. Fields mirror
the approved Account contract. Opening a tree node fetches full detail before edit or
lifecycle action. Phones use explicit detail/form navigation; tablets may show more
context through existing responsive primitives.

## 8. Hierarchy Levels screen

Use shared `AppListScreen`/`AppDataTable`/`AppForm` for LevelNumber, bilingual names,
CanPost, status and lifecycle. Active/archived discovery and server errors remain explicit.

## 9. Lifecycle and permissions

Reads require `Accounts:View`; mutations require `Accounts:Manage`; app read-only
blocks mutation controls. Create/edit/archive/restore wait for server confirmation.
Duplicate proposal race displays conflict and refetches proposal; it does not silently alter submitted code.

## 10. Online/offline behavior

Offline financial writes are Excluded. Cached setup reads remain Deferred pending a
separate approved policy. There is no local draft, write queue or synthesized success.

## 11. Consistency and dependency behavior

Protected mutations use RowVersion and refetch authoritative state on conflict.
Account/Level changes invalidate tree/detail/list/lookups; company/session switch
must not retain prior-company financial setup.

## 12. Localization, RTL, and accessibility

Accounting EN/AR catalogs own strings. Shared logical layout provides RTL. Touch
targets, screen-reader labels, validation focus, safe areas and keyboard avoidance
follow the Mobile design system.

## 13. Responsive behavior and shared components

Phone tree/detail flows remain touch-first and do not copy a desktop split pane.
Tablet layouts may expose wider content without custom platform-specific domain logic.
Reuse `AppHierarchicalTree`, `AppListScreen`, `AppDataTable`, `AppForm`,
`AppStateView`, `AppPageHeader` and `ConfirmationDialog`.

## 14. Verification

Required tests cover runtime schemas, endpoint serialization, real server pagination,
D-024 proposal/edit/duplicate-refetch, tree/detail fetch, Account and Level lifecycle,
permission/read-only states, error/retry and key invalidation. Current generic source
does not prove these focused child requirements.

## 15. Deferred and handoff

Deferred/Excluded here: cached offline reads, offline writes, Import, bulk, report,
notifications/realtime correctness, JournalEntry/posting, GL/TB, Month Close and
custom drag/reparent. Phase 06 must observe API-backed phone/tablet EN/AR/RTL journeys
before this child is `Verified`.
