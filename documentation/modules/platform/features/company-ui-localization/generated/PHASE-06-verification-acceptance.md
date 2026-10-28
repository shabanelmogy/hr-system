<!-- GENERATED FILE. DO NOT EDIT. Source: recipe-manifest.json + templates/PHASE-06-verification-acceptance.template.md -->

# Company UI localization Phase 06 - Verification and Acceptance

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

- **Company UI localization cross-platform master review:** `../modules/platform/features/company-ui-localization/company-ui-localization-review.md` sections 8, 9, 10, 11, 14, 15
- **Company UI localization API implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-api.md` sections 10, 11, 15
- **Company UI localization Next.js implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-web.md` sections 8, 10, 12, 13, 14, 15
- **Company UI localization Expo implementation profile:** `../modules/platform/features/company-ui-localization/company-ui-localization-mobile.md` sections 8, 10, 11, 12, 14, 15

## Source fingerprints

| Book | Section | SHA-256 |
| --- | ---: | --- |
| company-ui-localization-master | 8 | `5160fa6f53e6af0ebc984c515f094804b3ceb46dae4e94867f9d3966a3f4e32a` |
| company-ui-localization-master | 9 | `63b51c88d8a5d88a50e30ccc350a867f17af354c861fdd25adf44fbb52a11be2` |
| company-ui-localization-master | 10 | `07654d5f6221eb14bfe8d22b86b5c53ef329e5a78d9e9d889878a52d0375ff82` |
| company-ui-localization-master | 11 | `7f698de8266b2aecf7ecac40311d191f7592e72c5b6755110ce7f5bb89ece9cb` |
| company-ui-localization-master | 14 | `641fc43b5813adb022c972fd3a106872605d940bf293410b09b41dab94b10b9f` |
| company-ui-localization-master | 15 | `aa364ea286e8e7800844e5b31b29d6adc852b88b2ca35e88dfbf7cf051cc3fb0` |
| company-ui-localization-api | 10 | `b5f6e14b9b81bf8ac113a69cab0f7b7f88e7eb976b9e25abb54acb9638961531` |
| company-ui-localization-api | 11 | `fcd94fd891ee1b70ec15e7d307e138643b8b8fb068ec3c4560ed6869532fa372` |
| company-ui-localization-api | 15 | `1fac03ff927bb2e37f778fcea565b000f888764ed0b5738bd0a86a9eae14a410` |
| company-ui-localization-web | 8 | `78ba4e90fdd9faf3454d489beb2d3cc6a92791f1532eeaf426e432e25dc6fd83` |
| company-ui-localization-web | 10 | `171febad967d8bd7827cbabe7f5e7a6d1f6f2b57a553a618231c346caaf78765` |
| company-ui-localization-web | 12 | `04a29c8dee8ffb8fecfa36c1a9c56ce5e121f6938204c92b8612b86495c316fb` |
| company-ui-localization-web | 13 | `aa6304c75e09579546d9af39a377e27ab6cc2e8e10604f1533a6a92ed64f97d4` |
| company-ui-localization-web | 14 | `f63002f1d6fd28a8c0df12b2ecb4735dd0b78cf016c3f844d74a957b2b05bc5a` |
| company-ui-localization-web | 15 | `5ace5290b6143ea357797f538e2d986b4fa025343cd948b8e108f609b1f0c2de` |
| company-ui-localization-mobile | 8 | `68187684a5597e52010df9222e3bf5096ee38467c36e447c42badf898460ac5c` |
| company-ui-localization-mobile | 10 | `4618cad0837107f97db6a31c332b07dc7b28cc96b8d1981871305dcd4290a853` |
| company-ui-localization-mobile | 11 | `a60d252f08206ad41a752583668c2cb3bbd03680c84ec4352a3e263e6296c6ea` |
| company-ui-localization-mobile | 12 | `5fd60e867cfca77071ee32c5414c78e9e1d5410f7d126aacc4e1ba481d702e8a` |
| company-ui-localization-mobile | 14 | `1970d14f7733bc4a36b1dfd8d4fa8174672cffe378f7d44341b67f6e5884b0bb` |
| company-ui-localization-mobile | 15 | `abdd7be309129ae44f826a2ef3210c9d6c4ef5ec58e8a4deae184a8d239fd0db` |
