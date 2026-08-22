<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-final-reconciliation.template.md -->

# States Phase 06 - Final Reconciliation

## Purpose

Close the evidence loop and decide whether the feature is ready for handoff.

## Reconciliation gates

- [ ] Every requirement maps to implementation evidence and a verification result.
- [ ] Required-source manifest validation passes.
- [ ] No draft manifest, placeholder path, reference-only fingerprint, or shared output path is registered as final evidence.
- [ ] Generated documentation is current.
- [ ] API contract tests and focused feature tests pass.
- [ ] Web typecheck, lint, architecture checks, focused tests, and production build pass.
- [ ] Mobile typecheck, lint, architecture checks, focused tests, and supported platform checks pass.
- [ ] Desktop, compact browser, phone, tablet, English, Arabic, LTR, RTL, keyboard, and touch behavior are reviewed where applicable.
- [ ] Search, filter, sorting, pagination, refresh, mode switches, selection, forms, archive, restore, bulk, report, import, notification, and realtime paths are reconciled.
- [ ] Intentional API/web/mobile differences are documented.
- [ ] Open findings have severity, evidence, owner, and a release decision.
- [ ] No reference-specific field, ownership rule, view, or known gap was copied without a feature requirement.
- [ ] The chosen applied reference and every intentional departure from it are recorded.

## Handoff decision

Record one outcome: `Ready`, `Ready with accepted findings`, or `Not ready`. Include the exact commands run, dates, failed or skipped gates, and the responsible owner.

## Approved references

- **States cross-platform master review:** `../project/STATES_FEATURE_FULL_REVIEW.md` sections 8, 9, 10
- **States API implementation profile:** `../api/States_API_Implementation_Profile.md` sections 10, 11
- **States Next.js implementation profile:** `../web-next/features/states-frontend-reference.md` sections 12, 13, 14
- **States Expo implementation profile:** `../mobile-react/states-mobile-reference.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| states-master | 8 | `4943e0d1fc6a2d0893837c810839ab2fb28cfadee58e6b7a57e1cd5e318e4699` |
| states-master | 9 | `3bb32b0b771b82c4f9f9369d2aac0af5ad543878f7e223b3f4b989555486ff28` |
| states-master | 10 | `0166f31ed3a894bd0e8caf2a191e128085fc6447772a6b564755b3bb02ca860f` |
| states-api | 10 | `86e2ea950a4ca4301825133cc4e23a5fb901d665a9105e81b22821a9080ef4d5` |
| states-api | 11 | `539f37f24d7580f0ff02e92c6172aa48665203d2179e10f21b91074b929472a8` |
| states-web | 12 | `ecb38dd9b6149a025aa10b1edca9ed23050620cedf2f397b10ff34764e10874d` |
| states-web | 13 | `48a89826eaa88cdbbfb10e23d72ae3e27889b82befa84294db8b5f2d1d1de232` |
| states-web | 14 | `3dfbf0dde3dc0418dfa72481ca85dd39d0b073a438c87a8d14fcb623cd8ccc35` |
| states-mobile | 14 | `7d5c6b9e3f30747a1618af874a2eedd703bc07977d38eafa2068069da9e76028` |
| states-mobile | 15 | `4b53b4a14da5675cf262da99e7d8698c0fdd0159f1f488b3fee1d616d08c7b6d` |
