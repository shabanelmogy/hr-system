<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Accounting Chart of Accounts and Hierarchy Phase 00 - Implementation Preflight

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

- **Accounting Chart of Accounts and Hierarchy cross-platform implementation contract:** `../project/LEDGER_SETUP_COA_HIERARCHY_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Accounting Chart of Accounts and Hierarchy API implementation contract:** `../api/LedgerSetupCoaHierarchy_API_Implementation_Profile.md` sections 1, 10, 11
- **Accounting Chart of Accounts and Hierarchy Next.js implementation contract:** `../web-next/features/ledger-setup-coa-hierarchy-frontend-reference.md` sections 1, 2, 12, 13
- **Accounting Chart of Accounts and Hierarchy Expo implementation contract:** `../mobile-react/ledger-setup-coa-hierarchy-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| ledger-setup-coa-hierarchy-master | 1 | `8c12d116c4235b5503cd357c9f130ad0bfd1e1048afa9e21c8e6b4a807b3b29a` |
| ledger-setup-coa-hierarchy-master | 2 | `50baa75ceea6d5203d4d6cd35a3c2f55d2d0e9810fe0edad21cb8f9ea9f01965` |
| ledger-setup-coa-hierarchy-master | 5 | `0976c6ca329e0384e1cafbb08925931731db09b8d9000d03864ee5c72913020d` |
| ledger-setup-coa-hierarchy-master | 8 | `f381f5b8e20edecbb259bae89a027a9c5d53f2f4681a22476941c738d69653b9` |
| ledger-setup-coa-hierarchy-master | 9 | `f8eb2bb25c8d6c36569b01334319db94c48e9e766984c3cdac349af4408478fb` |
| ledger-setup-coa-hierarchy-api | 1 | `e2c839e0c968b6e7aa5cba8ed03dde1391d48c46c58e89f1c2110a9798469a82` |
| ledger-setup-coa-hierarchy-api | 10 | `7977bfeaae288d0578f9b01da67facc08a62e49cdbee75cd43791e00b50aa0df` |
| ledger-setup-coa-hierarchy-api | 11 | `c0b66f04b8d5a431607823c1023d1de7cc683b20f4b8468227e397bb75df2e7e` |
| ledger-setup-coa-hierarchy-web | 1 | `caa3204185b97905e4369dadabd0d4538f2aa6c09b114177e974e095303d99f3` |
| ledger-setup-coa-hierarchy-web | 2 | `4f2fd9712cf706d3a1f7d2e28b463bf227367abe2037446603bf14b012328ced` |
| ledger-setup-coa-hierarchy-web | 12 | `c1d6dd5013924c2f67afeb404ed8060c65cee180dee0ef8059c7afcc34d1807c` |
| ledger-setup-coa-hierarchy-web | 13 | `8b93bc6b97cf54398c3e16940c46c65f873bc7b80c05b2fd9164ea69bf516e74` |
| ledger-setup-coa-hierarchy-mobile | 1 | `c3397104f08d453c1a565901a271d0f087651fd7a389c4343cf6310b35408853` |
| ledger-setup-coa-hierarchy-mobile | 14 | `55c8ee742ffb67d5dc71bf45816276eef1ea72dc077d2c36739361509108a89d` |
| ledger-setup-coa-hierarchy-mobile | 15 | `fd777f1160cb0a2076ea34e551efeb53102377cff6225cf39f19dc9037f4fe3f` |
