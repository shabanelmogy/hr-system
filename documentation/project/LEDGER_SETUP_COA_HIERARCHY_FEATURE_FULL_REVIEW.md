# Accounting Chart of Accounts and Hierarchy — Cross-Platform Implementation Contract

Status: **Phase 01 API plus typed Web Phase 02 and Mobile Phase 03 implemented/static-verified; live Phase 06 closure remains pending.**

Plan: `accounting-core-gl` / `Slice 1 — Ledger setup spine` / child `ledger-setup-coa-hierarchy` (`1B`).

## 1. Scope, authority, and current/target boundary

This child owns `AccountHierarchyLevel` and `Account` setup only. It covers company
hierarchy, account tree/detail, create/edit/archive/restore, posting/manual-posting/
currency policies, and the D-024 server-proposed editable account code.

`VERIFIED CURRENT`: Accounting contains Account/Hierarchy domain entities,
CQRS commands/queries, persistence, versioned routes, typed Web/Mobile Ledger Setup
clients, tree primitives, mock-draft utilities and lifecycle tests. `AUTHORIZED TARGET`:
the focused child contract under
`documentation/plans/business/accounting-core-gl/decomposition/ledger-setup-coa-hierarchy.md`.
The umbrella generic client remains only for untouched sibling resources.

The v2 Screen Contract selects `P-002` for Accounts on both platforms, with a
secondary P-001 record list, and `P-001` for Hierarchy Levels. Both Account and
Hierarchy Level require distinct `NameAr` and `NameEn` through create/edit/detail/
list and mock-draft evidence; UI translations do not substitute for these values.

## 2. Existing-system relationship and closest reuse

The feature extends the existing Accounting Ledger Setup capability; it does not create
a new module or schema. API flow remains Controller → ISender → Handler → narrow port →
Infrastructure adapter. Fiscal Years is an architectural discipline reference only.

Web must reuse `web-next/src/shared/components/tree-view/SplitTreeView.tsx` and use
`web-next/src/modules/hr/basic-data/organizational-structure/management/components/tree-view/CostCenterTreeDiagram.tsx`
as the closest master/detail interaction reference: controlled selection, search,
detail/empty-detail panels, contextual child/edit actions and bounded detail pane.
No HR fields, permissions, move rules, ownership or domain logic are copied.

Mobile reuses `mobile-react/src/shared/components/tree-view/AppHierarchicalTree.tsx`.

## 3. Domain model and D-024 code baseline

`AccountHierarchyLevel`: company-scoped ordered level with bilingual names and `CanPost`.
`Account`: company-scoped code, bilingual names, hierarchy level, optional parent,
`AllowPosting`, `ManualPostingPolicy`, `CurrencyPolicy`, optional specific Currency,
archive state, audit fields and RowVersion.

D-024 freezes account-code proposal semantics: the server suggests a company-wide,
non-hierarchical `ACC-####` value using the next reserved numeric suffix across active
and archived accounts. Archived codes stay reserved. The suggestion is editable, is
not a reservation, and never determines hierarchy. `ParentAccountId` plus
`AccountHierarchyLevelId` are hierarchy authority. Concurrent callers may see the
same suggestion; the company unique DB key is race authority, one create wins, the
loser receives the stable duplicate conflict and refetches a fresh proposal.

Current API runtime exposes `GET /api/v1/accounts/code-proposal`; typed Web and Mobile
clients consume and preserve the proposal. Live API-backed acceptance remains a Phase 06 gate.

## 4. Business rules and lifecycle

- Company scope comes only from the trusted current actor.
- Hierarchy level number and Account code are company-unique; archived Account codes
  remain reserved.
- A posting Account requires its level `CanPost=true`, `AllowPosting=true`, and no children.
- A posting Account cannot accept a child; reparenting cannot create a cycle.
- Parent, level and specific Currency must be active same-company references.
- `SpecificCurrencyId` is required only for `SpecificCurrency` policy and forbidden otherwise.
- Used/referenced Accounts and referenced hierarchy levels cannot be archived.
- Protected updates/lifecycle use RowVersion; stale writers receive conflict/reload behavior.
- Account code is editable within validation/uniqueness rules and never hierarchy authority.

## 5. Read/query contract

Current Account reads include complete active tree, detail with RowVersion, active
lookup, and server-managed list/search/status/sort/paging with truthful
`PageResponse` metadata. Search field/operator and sort vocabularies are explicit and
ordering has a deterministic ID tie-break. Hierarchy Levels continue to expose
deterministic ordered active/archived/all discovery. Clients must consume that server
truth rather than synthesize totals or treat current-page filtering as collection-wide
truth.

## 6. Persistence, API, and permissions

Existing tables remain `acc.AccountHierarchyLevels` and `acc.Accounts`. Current EF
configuration already has unique `(TenantId, CompanyId, LevelNumber)` and
`(TenantId, CompanyId, Code)` indexes plus same-company composite FKs for level,
parent and specific Currency.

Canonical route family remains `/api/v1/accounts`: list, tree, lookup, detail,
hierarchy-level list/create/update/archive/restore, Account create/update/archive/
restore. Target adds a typed read-only proposed-code endpoint/query under this family;
the exact client route constant must be one canonical route. Reads require
the matching `Accounts:View` or `AccountHierarchyLevels:View`; mutations require
the exact resource `Create`, `Edit`, `Archive`, or `Restore` permission.

## 7. Web and Mobile product contract

Web `/finance/ledger-setup/accounts` becomes a focused typed master/detail tree
workspace, and `/finance/ledger-setup/hierarchy-levels` a focused typed level list/form.
The generic `LedgerSetupRecord` and resource-name renderer are explicitly not the
target architecture. Selecting a lightweight tree node fetches current detail before
view/edit/lifecycle actions. Create mode requests a D-024 proposal, allows editing it,
and never derives code from parent/level.

Mobile keeps separate Accounts and Hierarchy Levels routes, uses typed runtime schemas,
`AppHierarchicalTree`, explicit detail/form journeys and online-authoritative writes.
It does not imitate a desktop split pane on narrow phones.

Writable Account and Hierarchy Level forms on both clients expose the shared local
mock-data action when prerequisites are loaded. It fills a valid draft only, never
submits/persists or fabricates IDs, RowVersion, tenant/company, posting or auth state;
read-only/report/query-only surfaces are N/A.

## 8. Delivery phases and verification

Phase 00 freezes this contract and evidence. Phases 01–05 may refactor/extend API,
Web and Mobile. Phase 06 must verify the focused child against real runtime and record
`Verified` or `Not Verified`; static checks do not substitute for API-backed journeys.

Required critical evidence: D-024 proposal including archived reservations and race
behavior; hierarchy cycle/posting guards; RowVersion conflicts; truthful server list
metadata; Web SplitTreeView + Cost Center interaction reuse; Mobile tree/detail;
Accounts View/Manage/read-only; EN/AR RTL; compact Web and phone/tablet Mobile.

## 9. Risks, current gaps, and safeguards

Current gaps are target-vs-current findings, not implemented claims:

- live API-backed Web/Mobile Phase 06 journey evidence remains pending;
- the umbrella generic Ledger Setup runtime remains for untouched sibling resources;
- release/customer education stays blocked until Phase 06 records `Verified`.

The full Accounting module was revalidated on 2026-09-23 with **66/66 tests PASS**;
this includes the focused COA page/proposal/query-validator/controller evidence first
closed in Phase 01. No schema change or feature migration was required.

Safeguards: no hierarchy from code, no client code generator, no sequence table unless
the master plan is reopened, no copied HR domain logic, no runtime claim before Phase 06.

## 10. Phase 00 handoff

Phase 00 authorized runtime work on 2026-09-22. API Phase 01 and typed Web/Mobile
Phase 02/03 implementation are recorded; Phase 06 remains the acceptance gate. `1B`
is **Queued** in the current human run until Fiscal Years and Currency close in
order. Existing source does not make it active. Completion of this child does not
imply Dimensions or umbrella Slice 1 completion.
