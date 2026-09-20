<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Accounting Ledger Setup Phase 06 - Verification and Acceptance

## Purpose

Perform the final implementation review, verification, and acceptance decision.
This is the mandatory gate between implementation and any customer-facing
education/closure phase.

## Verification gates

- [ ] Every authorized Plan/Slice requirement maps to implementation evidence and a
      verification result.
- [ ] Required-source manifest validation passes.
- [ ] No draft manifest, placeholder path, reference-only fingerprint, or shared
      output path is registered as final evidence.
- [ ] Generated documentation is current.
- [ ] API contract tests and focused feature tests pass.
- [ ] Web typecheck, lint, architecture checks, focused tests, and production build
      pass where Web is Required.
- [ ] Mobile typecheck, lint, architecture checks, focused tests, and supported
      platform checks pass where Mobile is Required.
- [ ] Desktop, compact browser, phone, tablet, English, Arabic, LTR, RTL, keyboard,
      and touch behavior are reviewed where applicable.
- [ ] Required journeys, lifecycle/actions, validation, permissions, scope,
      concurrency, integration, reporting/import/export, notification/realtime, and
      recovery paths are reconciled.
- [ ] Intentional API/Web/Mobile differences match the approved plan.
- [ ] No reference-specific field, ownership rule, view, or known gap was copied
      without an authorized requirement.
- [ ] Every implementation discovery that materially changed product/business
      meaning was reconciled back into the canonical plan before acceptance.
- [ ] Open non-feature findings have severity, evidence, owner, and release decision.

## Verification decision

Record one outcome: `Verified` or `Not Verified`. Include the exact commands run,
dates, counts, failed or skipped gates, and responsible owner.

`Verified` means:

- every Required delivered behavior exists;
- the implementation was reviewed against the authorized Plan/Slice;
- feature-owned correctness gates pass;
- canonical docs/contracts match runtime;
- no unresolved feature regression remains.

Classify each non-passing external gate as:

- `Inherited repository failure`;
- `Environment blocker`;
- `Manual release check`.

Such findings require an explicit owner/release decision and must not hide a feature
regression. A focused test pass alone is never a `Verified` decision.

Any missing Required behavior or feature regression makes the result
`Not Verified`.

## Customer-education gate

Phase 07 Customer Education & Closure must not start until this phase records
`Verified`. The customer document must be based on the runtime verified here, not
on the original plan alone.

## Approved references

- **Accounting Ledger Setup cross-platform implementation contract:** `../project/ACCOUNTING_LEDGER_SETUP_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **Accounting Ledger Setup API implementation contract:** `../api/AccountingLedgerSetup_API_Implementation_Profile.md` sections 10, 11
- **Accounting Ledger Setup Next.js implementation contract:** `../web-next/features/accounting-ledger-setup-frontend-reference.md` sections 12, 13, 14
- **Accounting Ledger Setup Expo implementation contract:** `../mobile-react/accounting-ledger-setup-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| accounting-ledger-setup-master | 8 | `ba380ad637a7a499170084d624ed6bfda318ca5317a1ee93a61f4a625ae71187` |
| accounting-ledger-setup-master | 9 | `4614badb58c2768d465aac681ad22c3f2fa4c16ee17cc05a8fe62177d99374a7` |
| accounting-ledger-setup-master | 10 | `b4085e540c58462cf0c23318c9f23ab60d94448d3b0dc572006266170445f30d` |
| accounting-ledger-setup-api | 10 | `64036fe6cbe6fdf951737688b0a782b317968fbbfa9fadc83066973ac550f0ef` |
| accounting-ledger-setup-api | 11 | `bacf9dc76718244f38220ef882f14c48d62caeba700a4ce2b78f979a641037fd` |
| accounting-ledger-setup-web | 12 | `75b439b17df73a16cffffd8e97025484311c390d0e5e112953df1e212bdb5290` |
| accounting-ledger-setup-web | 13 | `2dbb41708fc772c97f51356c9903a258148eff82d8f0eca2499e8fc4c3d081c1` |
| accounting-ledger-setup-web | 14 | `7cf8cac0782842ea3c906b7026abed71dbf887b6a8fc8a85521470d742578a9e` |
| accounting-ledger-setup-mobile | 14 | `fa1a6a215ab292e596db868893998a319a541ebfdb8cf5bb79212d1990c639cc` |
| accounting-ledger-setup-mobile | 15 | `bf90a02cc0efd84b676907c5a05d0d311c1e7d41561635afe08363e1cefa84ef` |
