<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Ledger Setup Currency Phase 00 - Implementation Preflight

## Purpose

Translate an already approved plan/slice into an implementation execution packet.
This phase does **not** repeat product discovery or silently re-decide approved
business rules.

For new business capabilities or substantial rebuilds, the central plan under
`documentation/plans/` is the authority for product intent, scope, ownership,
business rules, and approved decisions. This phase verifies that the current
repository still matches the evidence used by that plan and maps the authorized
slice onto concrete runtime surfaces.

## Required outputs

1. Record the canonical Plan ID, plan path, authorized slice/phase, and current gate
   status.
2. Confirm the requested implementation is inside the authorized slice.
3. Confirm the plan's Feature Decomposition Gate binds this Feature ID to one
   coherent execution unit. When the slice is `Decompose`, read and verify the
   child Screen/Workflow Contract and reuse audit created from
   `documentation/plans/FEATURE_DECOMPOSITION_TEMPLATE.md`.
4. Inspect the current owning runtime capability and verify there has been no
   material drift since planning.
5. Complete the Existing-System Relationship Review and shared-reuse inventory.
6. Map each feature-unit requirement to Domain/Application/Infrastructure/Presentation,
   Web, Mobile, tests, migrations, integrations, and documentation as applicable.
7. Import approved business decisions from the plan into the implementation request;
   do not create a competing rule set.
8. Record any implementation-only detail that the plan intentionally left to the
   execution workflow.
9. Define the exact verification commands/evidence required before Phase 06 can
   return `Verified`.

## Drift rule

If current source contradicts a material planning assumption or implementation
discovers a new business decision that changes persisted meaning, lifecycle,
ownership, scope, security, or a Required customer journey:

1. stop the affected implementation work;
2. update/reopen the relevant central plan gate;
3. resolve the decision in the canonical plan/decision log;
4. resume only after the affected slice is authorized again.

Do not resolve material product ambiguity inside a handler, migration, UI component,
or feature-local document.

## Preflight checklist

- [ ] Canonical Plan ID/path and authorized slice are recorded, or this is explicitly
      classified as a small change inside an already approved capability.
- [ ] Current plan gate authorizes this implementation scope.
- [ ] Feature Decomposition Gate contains this exact Feature ID for the authorized
      slice; `Decompose` slices have at least two distinct child Feature IDs.
- [ ] For a decomposed slice, this child has a complete Screen/Workflow Contract:
      closest reference, exact reusable components, workspace/screens/journeys,
      typed transport/server criteria, states, permissions/read-only, concurrency,
      i18n/RTL/accessibility/responsive behavior, tests, and child exit gate.
- [ ] Current runtime was inspected for drift since planning.
- [ ] Owning module/capability and relationship classification are confirmed.
- [ ] No parallel/legacy/workaround owner is being introduced.
- [ ] Shared BuildingBlocks, module-local abstractions, Web shared components, and
      Mobile shared components were inventoried before adding new ones.
- [ ] Plan requirements are mapped to concrete implementation surfaces.
- [ ] Approved plan decisions are referenced rather than duplicated/re-decided.
- [ ] Any new material business decision was routed back to the plan before coding.
- [ ] API/Web/Mobile Required/Deferred/Excluded decisions match the authorized slice.
- [ ] Migration/data compatibility impact is known.
- [ ] Verification evidence required for Phase 06 is explicit.
- [ ] Customer Education Pack is classified `Required` or `N/A — reason`; a
      customer-visible slice must be `Required`.

## Approved references

- **Ledger Setup Currency cross-platform master review:** `../project/LEDGER_SETUP_CURRENCY_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Ledger Setup Currency API implementation profile:** `../api/LedgerSetupCurrency_API_Implementation_Profile.md` sections 1, 10, 11
- **Ledger Setup Currency Next.js implementation profile:** `../web-next/features/ledger-setup-currency-frontend-reference.md` sections 1, 2, 12, 13
- **Ledger Setup Currency Expo implementation profile:** `../mobile-react/ledger-setup-currency-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-currency-master | 1 | `6dcf6bec83f4ac4b9b26d310a7d33c07f61fc057e139b74ad8d29116b71f86b9` |
| ledger-setup-currency-master | 2 | `d555dd7cbe0c8b8caf285e995954caa7d3d00d1e946302ae11c3494513454c2c` |
| ledger-setup-currency-master | 5 | `b3e3d7bd413f899da950055f337883bc97f93b9ce0ccbff5734be1218236625f` |
| ledger-setup-currency-master | 8 | `f35d7dda56d7fc291b43bfae11ec6854a54f4c5fed49738b726458153311452d` |
| ledger-setup-currency-master | 9 | `5a3e6ce360ee0b7f038040acc9ec07a0a59f1cbe5710006e98f9e13a0c6a0300` |
| ledger-setup-currency-api | 1 | `1e15069827ad074d82fd6e57d2b805aefa2eee0833aeb45962d8a9744275372c` |
| ledger-setup-currency-api | 10 | `01bbb185825055c46bcab3251bc15df822bd15ca88bbef31094caa68e25bbbb5` |
| ledger-setup-currency-api | 11 | `4ff40510c294f1aec649fd52096c51c054dd5604713a067212cc5311e42c3b7e` |
| ledger-setup-currency-web | 1 | `01511e01728749728fa55534fcece9d6e603e7a1983c8e739d9715c6e98610c8` |
| ledger-setup-currency-web | 2 | `4248e971f86312ce2ce72930128d5d6963b4afaafcf5e5a880f61b170498bb13` |
| ledger-setup-currency-web | 12 | `13bb67b7db8e13efe89161abce18607aee0b23d12d9c51b3aadccba4af0800a3` |
| ledger-setup-currency-web | 13 | `bec5dddf680765d4ec88fe5e57a2abcf83f2bc1621b8ae94a6353af85811b82f` |
| ledger-setup-currency-mobile | 1 | `badd004336f4c30b5c34155cd007cdb5bb38a5170038daae5b957522dcb51256` |
| ledger-setup-currency-mobile | 14 | `7d054bc8fcb0992efe55f564a9e6e952ff596976745603fcf6d591c9c04a29ab` |
| ledger-setup-currency-mobile | 15 | `25ded4e7261abd2a00f240ed30a4fed461ad82aa9c65da27ddeae8e2ecda2c79` |
