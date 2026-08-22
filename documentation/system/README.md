# Feature Documentation System

This system turns reviewed implementations such as Countries and States into repeatable evidence-based workflows for API, Next.js, and Expo features. It follows the useful structure of the Sigma ERP recipe system while remaining specific to this repository.

## Authority model

The canonical books own factual rules:

- `../project/COUNTRIES_FEATURE_FULL_REVIEW.md`
- `../api/Countries_API_Implementation_Profile.md`
- `../web-next/features/countries-frontend-reference.md`
- `../mobile-react/countries-mobile-reference.md`
- `../project/STATES_FEATURE_FULL_REVIEW.md`
- `../api/States_API_Implementation_Profile.md`
- `../web-next/features/states-frontend-reference.md`
- `../mobile-react/states-mobile-reference.md`

`recipe-manifest.json` declares which numbered sections support each phase. `Generate-Documentation.ps1` hashes those sections and writes derivative packets into `generated/`. The generated packets are navigation and verification aids; they never replace the canonical books.

## Layout

| Path | Responsibility |
| --- | --- |
| `recipe-manifest.json` | Books, section dependencies, recipe outputs, and required-file manifests |
| `Generate-Documentation.ps1` | Generation, fingerprinting, required-path validation, and stale-output checks |
| `New-FeatureDocumentation.ps1` | Safe draft artifact, required-file plan, and feature-scoped recipe-registration scaffold |
| `templates/` | Human-maintained phase and review templates |
| `generated/` | Machine-generated phase packets; never edit directly |
| `features/countries/required-files.json` | Source/configuration evidence needed to review Countries end to end |
| `features/countries/COUNTRIES-REVIEW-ARTIFACTS.md` | Completed Countries review evidence and handoff record |
| `features/states/required-files.json` | Source/configuration evidence needed to review States end to end |
| `features/states/STATES-REVIEW-ARTIFACTS.md` | States review evidence, State-specific decisions, and open findings |

## Commands

From the repository root:

```powershell
./documentation/system/Generate-Documentation.ps1
./documentation/system/Generate-Documentation.ps1 -Recipe phase-02-web-client
./documentation/system/Generate-Documentation.ps1 -Check
./documentation/system/New-FeatureDocumentation.ps1 -FeatureId employees -FeatureName "Employees" -ReferenceFeature countries
```

Generation validates every required file and source collection before writing. Check mode also recomputes every selected output and fails when a packet is missing or stale.

## Choose the operating mode

### New feature

1. Run check mode against the already registered references.
2. Choose the closest reference deliberately:
   - `countries`: flat global reference data, lifecycle, bulk actions, reports, and multi-view lists;
   - `states`: parent-dependent reference data and parent-filter/selector behavior.
3. Run `New-FeatureDocumentation.ps1`. Its required-file and recipe-registration manifests remain draft files and are intentionally excluded from `recipe-manifest.json` while runtime paths are being created.
4. Freeze the feature contract in the evidence artifact, then implement phases 01 through 05.
5. Create the cross-platform master and API/web/mobile applied profiles from verified source.
6. Replace the required-file draft with a complete `required-files.json`, review and merge `recipe-registration.draft.json`, and generate outputs under `generated/<feature>/`.
7. Complete phase 06 and run check mode.

### Existing-feature review

Default to read-only inspection unless implementation changes were also requested. Start from the feature's final required-file manifest and generated phase packets. Record exact paths and symbols for verified current behavior, keep requested behavior separate, document intentional platform differences, and turn every unresolved mismatch into a finding with severity and ownership.

### Existing-feature change

Read only the relevant generated phases and applied profiles, preserve the frozen contract or update it explicitly, implement the change, then repeat phase 04–06 reconciliation for the affected actions and integrations. Update the required-file manifest only when the evidence surface changes.

## Workflow

1. Run check mode before starting. Resolve stale registered documentation first.
2. Read the selected reference's phase 00 and create a feature evidence artifact from `templates/FEATURE-REVIEW-ARTIFACTS.template.md`.
3. Complete phases 01 through 05 in order. Record evidence using repository-relative paths and exact symbols.
4. Complete phase 06 after tests and cross-client reconciliation.
5. If a canonical rule changes, update the canonical book and regenerate. Never patch generated output.

## Final registration rules

- Draft manifests are planning aids and are never listed in `requiredFileManifests`.
- Final manifests contain no placeholder paths; every file and source collection must exist.
- Use unique book IDs prefixed by the feature ID.
- Use recipe IDs `<feature>-phase-00-discovery-evidence` through `<feature>-phase-06-final-reconciliation`.
- Write outputs to `generated/<feature>/PHASE-00-discovery-evidence.md` through `PHASE-06-final-reconciliation.md`.
- Point recipe sources at the new feature's canonical books. A reference feature may guide decisions, but its fingerprints are not evidence for the new implementation.
- Run generation, then `Generate-Documentation.ps1 -Check`. Phase 06 records exact commands, skipped gates, and one handoff decision.

## Scope rule

Countries and States are applied guides, not global product requirements. Copy the selected reference's architecture, transaction order, server-list discipline, permission model, localization practices, and verification approach. Re-decide ownership, fields, views, actions, reports, imports, child relationships, and known gaps.
