<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Company email templates Phase 06 - Verification and Acceptance

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

- **Company email templates cross-platform master review:** `../modules/platform/features/company-email-templates/company-email-templates-review.md` sections 8, 9, 10
- **Company email templates API implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-api.md` sections 10, 11
- **Company email templates Next.js implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-web.md` sections 12, 13, 14
- **Company email templates Expo implementation profile:** `../modules/platform/features/company-email-templates/company-email-templates-mobile.md` sections 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-email-templates-master | 8 | `4a8da1af76e17ddb92272e724cc218650102217c7dc717446c4a20ac35976cd8` |
| company-email-templates-master | 9 | `dc8a0c48da6dff2cdbf7eb91e9650a8fc95b858a926dea30048c04c74abe1262` |
| company-email-templates-master | 10 | `bd24d1669b5fa744de993fb09a4aa2fb7b5d96f14d39b482896bb79b11ccb3ef` |
| company-email-templates-api | 10 | `f96971b24f29c3303b7c8270d55f52d6ac4124567f0a7fcc359daf39688e313f` |
| company-email-templates-api | 11 | `708b0b68ed2f147e0cd48acbb55a15435a14be717673cab00753ea6fc4cc680a` |
| company-email-templates-web | 12 | `13bcc136704a2b02db0a639f0c9f6b6a62150e729f002ab0549ea6e0d10be9fa` |
| company-email-templates-web | 13 | `fb2dcbf05534e4901b95a48b0930b1fc695d12a4d55dd91f17ecb26ccdaa03c4` |
| company-email-templates-web | 14 | `5e53242eb88be6c2605787b21948d1c653213cd0c53fd670bd41b7aa70496956` |
| company-email-templates-mobile | 14 | `d1a123a663934fe7ed0c8e44b87e4acfe13d55094b5a947efd65f73ab481768d` |
| company-email-templates-mobile | 15 | `aaed8f6c9d9426c6042bbdb3d1d629e0a79c1365a5a67147547fbed445f269bb` |
