# Accounting Chart of Accounts and Hierarchy — Next.js Implementation Contract

Status: **Phase 02 typed client implemented and focused/static-verified; live Phase 06 acceptance pending.**

## 1. Feature boundary

Own focused Web workflows for `/finance/ledger-setup/accounts` and
`/finance/ledger-setup/hierarchy-levels`. The target uses typed COA models/services/
hooks/components; the umbrella `LedgerSetupRecord`/resource renderer is not the final architecture.

## 2. Route and module navigation

Keep existing Accounting Finance/Ledger Setup navigation and translation scope. Do
not create a second sidebar/root. Direct routes require `Accounts:View`; mutations
require `Accounts:Manage` and respect global read-only mode.

## 3. Transport and types

Use explicit AccountTreeNode, AccountDetail, AccountHierarchyLevel, paged Account list,
lookup and ProposedAccountCode transport types. Only feature services call `apiService`;
query keys are child-owned. RowVersion stays opaque. Tenant/company never appear in payloads.

## 4. Validation and forms

Use Zod + React Hook Form + shared `MyForm`/fields. Create mode obtains the D-024
server proposal, initializes Code from it and leaves Code editable. Changing parent or
level never rewrites Code. Server field errors map to controls; 409 reload/refetch is explicit.
Writable Account and Hierarchy Level forms expose `mockDataAction` after authoritative
lookups load; it fills a local draft only, preserves the server proposal and never
fabricates IDs, RowVersion or tenant/company scope. View mode has no mock action.

## 5. Account tree workspace

Reuse `SplitTreeView`/`HierarchicalTreeList`. The closest interaction reference is
`CostCenterTreeDiagram`: controlled selection, search, expand/collapse,
`renderDetailPanel`, `renderEmptyDetailPanel`, contextual add-child/edit and bounded
detail pane. Reuse composition only; do not copy HR fields, permissions, drag rules or domain code.

## 6. Account create/edit/detail

Selecting a lightweight tree node fetches full Account detail/RowVersion before
view/edit/archive. Form fields: parent, hierarchy level, proposed editable code,
bilingual names, AllowPosting, ManualPostingPolicy, CurrencyPolicy and conditional
SpecificCurrencyId. Account dimension constraints are composed later by the Dimensions child.

## 7. Hierarchy Levels screen

`/hierarchy-levels` uses a focused server-backed list/form for LevelNumber, bilingual
names, CanPost, active/archived discovery and archive/restore. It is not rendered
through a generic resource-definition table in the target architecture.

## 8. Lifecycle and feedback

Create/edit/view/archive/restore use shared forms, confirmations and feedback.
Archived Account codes remain reserved and are not offered as reusable codes.
Duplicate create after a proposal race shows the stable conflict, preserves user
input where safe, refetches a fresh proposal for the next attempt and never silently renumbers a submitted code.

## 9. Permissions and read-only mode

`Accounts:View` gates reads; `Accounts:Manage` gates mutations. Read-only keeps tree,
detail and lists usable while suppressing mutation controls. API denial remains authoritative.

## 10. Query state and truthful criteria

Tree/detail/lookup/list/proposal have separate stable keys. Server list state owns
page/search/status/sort. The UI uses real total metadata only; it must not synthesize
future pages. The typed COA page consumes real server totals; the umbrella generic runtime
remains only for untouched sibling Ledger Setup resources.

Those reachable sibling compatibility forms also expose the shared D-025 mock action.
Their pure generator requires every authoritative lookup, preserves a valid selected
scope lookup, uses distinct real currencies for an exchange-rate pair and never invents
an ID or RowVersion. This is a temporary cross-cutting safety guarantee, not typed-child
completion evidence for packages 1C–1H.

## 11. Localization, RTL, and accessibility

All visible strings are Accounting EN/AR. Split tree/detail, forms, actions and errors
are keyboard-accessible with focus management and translated labels/tooltips. Logical
spacing/direction owns RTL; no native alert/confirm/browser validation.

## 12. Responsive and shared-component contract

Desktop uses bounded master/detail internal panels. Compact widths stack or switch
detail presentation without page-level horizontal overflow. Reuse shared header,
form, select, confirmation, feedback and tree primitives before generic extension.

## 13. Integration and cache behavior

Committed Account/Level changes invalidate relevant list/tree/detail/lookups and
dependent selectors. Currency lookup stays Accounting-owned. Company/session changes
clear company-scoped cache. No realtime correctness dependency.

## 14. Verification and current gaps

Target verification covers D-024 create proposal/edit/duplicate-refetch, tree/detail,
add child, level lifecycle, account archive/restore, permission subsets, read-only,
EN/AR RTL, desktop/compact widths, local mock draft validity and API-backed errors.
Phase 02 typed routes/forms/services/hooks and mock utility tests are implemented and
static/focused verified. Live API-backed Phase 06 evidence remains pending; it is the
only remaining acceptance gate for this child.
