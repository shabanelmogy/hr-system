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
3. Inspect the current owning runtime capability and verify there has been no
   material drift since planning.
4. Complete the Existing-System Relationship Review and shared-reuse inventory.
5. Map each slice requirement to Domain/Application/Infrastructure/Presentation,
   Web, Mobile, tests, migrations, integrations, and documentation as applicable.
6. Import approved business decisions from the plan into the implementation request;
   do not create a competing rule set.
7. Record any implementation-only detail that the plan intentionally left to the
   execution workflow.
8. Define the exact verification commands/evidence required before Phase 06 can
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
| accounting-ledger-setup-master | 1 | `e9650cded47b5bf93234a8644af5322e2483f0a2513eda29e3c4e91be9806da7` |
| accounting-ledger-setup-master | 2 | `ba74f8d48e16a3250ea09da5dca94fd96d8060a1801484679bf473110211c694` |
| accounting-ledger-setup-master | 5 | `87f60e757fef7a4b41105347f7ce21ce3a142761a1508c3cbea45625d4ea7557` |
| accounting-ledger-setup-master | 8 | `ba380ad637a7a499170084d624ed6bfda318ca5317a1ee93a61f4a625ae71187` |
| accounting-ledger-setup-master | 9 | `4614badb58c2768d465aac681ad22c3f2fa4c16ee17cc05a8fe62177d99374a7` |
| accounting-ledger-setup-api | 1 | `c17a4b5e92cd12468b6759103ae1148006b2d9089453e32211d497d9f21ef987` |
| accounting-ledger-setup-api | 10 | `64036fe6cbe6fdf951737688b0a782b317968fbbfa9fadc83066973ac550f0ef` |
| accounting-ledger-setup-api | 11 | `bacf9dc76718244f38220ef882f14c48d62caeba700a4ce2b78f979a641037fd` |
| accounting-ledger-setup-web | 1 | `a2917b800982d2ab738dd4c6d2207f5f323a3eac604fa4169f879a4dde91d544` |
| accounting-ledger-setup-web | 2 | `3ae47163facb78589b0d905e77eabfef8c91549bdf086af1a39397aa4900a3d2` |
| accounting-ledger-setup-web | 12 | `75b439b17df73a16cffffd8e97025484311c390d0e5e112953df1e212bdb5290` |
| accounting-ledger-setup-web | 13 | `2dbb41708fc772c97f51356c9903a258148eff82d8f0eca2499e8fc4c3d081c1` |
| accounting-ledger-setup-mobile | 1 | `48c21f85cae0b04ee0edb50b7b58ea61964016dd2538667745daff7276556f58` |
| accounting-ledger-setup-mobile | 14 | `fa1a6a215ab292e596db868893998a319a541ebfdb8cf5bb79212d1990c639cc` |
| accounting-ledger-setup-mobile | 15 | `bf90a02cc0efd84b676907c5a05d0d311c1e7d41561635afe08363e1cefa84ef` |
