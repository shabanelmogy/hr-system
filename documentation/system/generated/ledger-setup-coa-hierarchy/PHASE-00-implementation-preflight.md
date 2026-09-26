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
| ledger-setup-coa-hierarchy-master | 1 | `9c3e84d1acb42069d4e5f4d01a1662750d3f4ec3ff8b49c6682a4340345285a2` |
| ledger-setup-coa-hierarchy-master | 2 | `50baa75ceea6d5203d4d6cd35a3c2f55d2d0e9810fe0edad21cb8f9ea9f01965` |
| ledger-setup-coa-hierarchy-master | 5 | `0976c6ca329e0384e1cafbb08925931731db09b8d9000d03864ee5c72913020d` |
| ledger-setup-coa-hierarchy-master | 8 | `f381f5b8e20edecbb259bae89a027a9c5d53f2f4681a22476941c738d69653b9` |
| ledger-setup-coa-hierarchy-master | 9 | `18d3ec5849cc352024286af9cdf57d35681fe9873a7d9e6495d5afc11cf10506` |
| ledger-setup-coa-hierarchy-api | 1 | `e2c839e0c968b6e7aa5cba8ed03dde1391d48c46c58e89f1c2110a9798469a82` |
| ledger-setup-coa-hierarchy-api | 10 | `92b6ee99a4b7937cb020709d6fbcd182c273535be0067760f35ba068aaf5ace4` |
| ledger-setup-coa-hierarchy-api | 11 | `c0b66f04b8d5a431607823c1023d1de7cc683b20f4b8468227e397bb75df2e7e` |
| ledger-setup-coa-hierarchy-web | 1 | `02005ad7db1bdd920dff8ecca61d70bbc0eb64185c3d3baa085debd0fb6f8357` |
| ledger-setup-coa-hierarchy-web | 2 | `68bf31d309b040ef18be86eabd7b6a429f29b52e079959caf939878564ed83c1` |
| ledger-setup-coa-hierarchy-web | 12 | `c1d6dd5013924c2f67afeb404ed8060c65cee180dee0ef8059c7afcc34d1807c` |
| ledger-setup-coa-hierarchy-web | 13 | `8b93bc6b97cf54398c3e16940c46c65f873bc7b80c05b2fd9164ea69bf516e74` |
| ledger-setup-coa-hierarchy-mobile | 1 | `b8f1766431871a99355100a8ef8b56b160205a65540b1f9fc3263e768b8a2f06` |
| ledger-setup-coa-hierarchy-mobile | 14 | `f3ef28aeabcfd9de709dc4e97d93bd46c03ddb50a578c220773d7d9ad2039e59` |
| ledger-setup-coa-hierarchy-mobile | 15 | `fd777f1160cb0a2076ea34e551efeb53102377cff6225cf39f19dc9037f4fe3f` |
