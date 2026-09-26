<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-00-implementation-preflight.template.md -->

# Accounting Ledger Setup Phase 00 - Implementation Preflight

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

- **Accounting Ledger Setup cross-platform implementation contract:** `../project/ACCOUNTING_LEDGER_SETUP_FEATURE_FULL_REVIEW.md` sections 1, 2, 5, 8, 9
- **Accounting Ledger Setup API implementation contract:** `../api/AccountingLedgerSetup_API_Implementation_Profile.md` sections 1, 10, 11
- **Accounting Ledger Setup Next.js implementation contract:** `../web-next/features/accounting-ledger-setup-frontend-reference.md` sections 1, 2, 12, 13
- **Accounting Ledger Setup Expo implementation contract:** `../mobile-react/accounting-ledger-setup-mobile-reference.md` sections 1, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| accounting-ledger-setup-master | 1 | `5b73e353ec94c99bbf2f74f18662bb1ec9791d359ac7b0fdce6618013e2f82e3` |
| accounting-ledger-setup-master | 2 | `ba74f8d48e16a3250ea09da5dca94fd96d8060a1801484679bf473110211c694` |
| accounting-ledger-setup-master | 5 | `87f60e757fef7a4b41105347f7ce21ce3a142761a1508c3cbea45625d4ea7557` |
| accounting-ledger-setup-master | 8 | `4b12f431b5a5534b82d13f0645a56b7f91b345e4a9338b9513e0958389746876` |
| accounting-ledger-setup-master | 9 | `7054a939e6cc2faa4f8f97e8271de948ae6139f7049594b236d8d1c430f81d6e` |
| accounting-ledger-setup-api | 1 | `417381f17e083b917b4a8f0873653bde08595ae4044523b1311618eae9b43f9d` |
| accounting-ledger-setup-api | 10 | `c511792f4de9f865da515ffa7dfd97555512ead0b5f30bdffe33e991971a9f8d` |
| accounting-ledger-setup-api | 11 | `bacf9dc76718244f38220ef882f14c48d62caeba700a4ce2b78f979a641037fd` |
| accounting-ledger-setup-web | 1 | `ff0807989e460de1494195417eb17b7d4bc481688c8d18a1addf17c945cdd2db` |
| accounting-ledger-setup-web | 2 | `9a77fa3eeeb87e9be4e27b877282a7d198c5bfd9dda3d4e05689273b51887341` |
| accounting-ledger-setup-web | 12 | `e413f46c08ba02958ed38359eef8c959607ed7cf151ea359ea3678a143ddc1e2` |
| accounting-ledger-setup-web | 13 | `2dbb41708fc772c97f51356c9903a258148eff82d8f0eca2499e8fc4c3d081c1` |
| accounting-ledger-setup-mobile | 1 | `c1376fa68a5d894e4d9be286fa3fa86fe38af4b3ed5f49a38d9b65a4bd09296c` |
| accounting-ledger-setup-mobile | 14 | `8163ce60439f08b3672e819111412fd25cd41fc01f3ed4b07d68eb5e8559233a` |
| accounting-ledger-setup-mobile | 15 | `bf90a02cc0efd84b676907c5a05d0d311c1e7d41561635afe08363e1cefa84ef` |
