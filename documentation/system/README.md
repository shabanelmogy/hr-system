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
- `../project/ADDRESSES_DOMAIN_FULL_REVIEW.md`
- `../api/Addresses_API_Implementation_Profile.md`
- `../web-next/features/addresses-frontend-reference.md`
- `../mobile-react/addresses-mobile-reference.md`

`recipe-manifest.json` declares which numbered sections support each phase. `Generate-Documentation.ps1` hashes those sections and writes derivative packets into `generated/`. The generated packets are navigation and verification aids; they never replace the canonical books.

## Layout

| Path | Responsibility |
| --- | --- |
| `recipe-manifest.json` | Books, section dependencies, recipe outputs, and required-file manifests |
| `Generate-Documentation.ps1` | Generation, fingerprinting, required-path validation, and stale-output checks |
| `New-FeatureDocumentation.ps1` | Safe implementation request, draft artifact, required-file plan, and feature-scoped recipe-registration scaffold |
| `templates/` | Human-maintained phase and review templates |
| `generated/` | Machine-generated phase packets; never edit directly |
| `features/countries/required-files.json` | Source/configuration evidence needed to review Countries end to end |
| `features/countries/COUNTRIES-REVIEW-ARTIFACTS.md` | Completed Countries review evidence and handoff record |
| `features/states/required-files.json` | Source/configuration evidence needed to review States end to end |
| `features/states/STATES-REVIEW-ARTIFACTS.md` | States review evidence, State-specific decisions, and open findings |
| `features/addresses/required-files.json` | Source/configuration evidence for the shared Address domain and owner links |
| `features/addresses/ADDRESSES-REVIEW-ARTIFACTS.md` | Address design evidence, decisions, and deferred client surfaces |
| `generated/addresses/` | Generated phase 00–06 packets for the Address domain foundation |

## Commands

From the repository root:

```powershell
./documentation/system/Generate-Documentation.ps1
./documentation/system/Generate-Documentation.ps1 -Recipe phase-02-web-client
./documentation/system/Generate-Documentation.ps1 -Check
./documentation/system/New-FeatureDocumentation.ps1 -FeatureId employees -FeatureName "Employees" -ReferenceFeature countries
```

Generation validates every required file and source collection before writing. Check mode also recomputes every selected output and fails when a packet is missing or stale.

The new-feature scaffold also writes a copy-ready `IMPLEMENTATION-REQUEST.md`.
Complete its decision tables, then use that file as the request given to an
implementing agent. The review artifact records evidence and findings; the request
records the desired work. Neither replaces the canonical applied profiles.

## Decision vocabulary

Use these meanings consistently for every optional capability and for each client:

| Decision | Meaning | Required evidence |
| --- | --- | --- |
| Required | Must exist and pass its gates in the current release. | Runtime/config/localization/test paths, exact contract, verification result |
| Deferred | Accepted requirement intentionally scheduled later. | Reason, owner, trigger or target milestone; no reachable placeholder UI |
| Excluded | Not part of this feature/platform contract. | Product/domain reason; no route, view, endpoint, or unused implementation |

`Deferred` is not a synonym for unfinished, and `Excluded` is not permission to
silently omit a copied reference capability. Reopen either decision explicitly
when requirements change.

## Choose the operating mode

### New feature

1. Run check mode against the already registered references.
2. Choose the closest reference deliberately:
   - `countries`: flat global reference data, lifecycle, bulk actions, reports, and multi-view lists;
   - `states`: parent-dependent reference data and parent-filter/selector behavior.
3. Run `New-FeatureDocumentation.ps1`. Complete the generated
   `IMPLEMENTATION-REQUEST.md` and review artifact before runtime work. Its
   required-file and recipe-registration manifests remain draft files and are
   intentionally excluded from `recipe-manifest.json` while runtime paths are
   being created.
4. Freeze the feature contract in the evidence artifact, including a separate
   Required/Deferred/Excluded decision for every optional view on web and mobile.
   When Import is Required, freeze its format, exact API envelope, limits,
   duplicate/relationship rules, atomicity, permissions, side effects, and tests.
   Then implement phases 01 through 05.
5. Create the cross-platform master and API/web/mobile applied profiles from verified source.
6. Replace the required-file draft with a complete `required-files.json`, review and merge `recipe-registration.draft.json`, and generate outputs under `generated/<feature>/`.
7. Complete phase 06 and run check mode.

### Existing-feature review

Default to read-only inspection unless implementation changes were also requested. Start from the feature's final required-file manifest and generated phase packets. Record exact paths and symbols for verified current behavior, keep requested behavior separate, document intentional platform differences, and turn every unresolved mismatch into a finding with severity and ownership.

### Existing-feature change

Read only the relevant generated phases and applied profiles, preserve the frozen contract or update it explicitly, implement the change, then repeat phase 04–06 reconciliation for the affected actions and integrations. If Import is created or refactored, also repeat phases 01 and 02 because its server envelope and browser parsing contract are coupled. Repeat phase 03 when mobile Import changes. Update the required-file manifest whenever the evidence surface changes.

When a change creates or extends a reusable web behavior, record its general
contract in `web-next/features/server-managed-feature-reference.md` and its
applied behavior in every affected feature profile. Regenerating the affected
phase packets then propagates those canonical rules automatically; never copy
the rule into `generated/` files or feature-local documentation by hand.

## Workflow

1. Run check mode before starting. Resolve stale registered documentation first.
2. Read the selected reference's phase 00 and create a feature evidence artifact from `templates/FEATURE-REVIEW-ARTIFACTS.template.md`.
3. Complete phases 01 through 05 in order. Record evidence using repository-relative paths and exact symbols.
4. Complete phase 06 after tests and cross-client reconciliation.
5. If a canonical rule changes, update the canonical book and regenerate. Never patch generated output.

## Change-impact matrix

Use the smallest complete phase set; do not rerun only the visible client when a
shared contract changed.

| Change | Required reconciliation |
| --- | --- |
| Fields, ownership, relationships, validation, errors, paging, or sort vocabulary | Phases 00–06 and all affected applied profiles |
| API route, request/response envelope, permission, batch limit, or atomicity | Phases 01, 02, 04–06; phase 03 when mobile consumes it |
| Browser-only layout or reusable web behavior with no transport change | Phases 02 and 06; update the generic web guide and every affected applied profile |
| Mobile-only native presentation with no transport change | Phases 03 and 06 plus the mobile applied profile |
| Lifecycle, archive/restore, bulk action, audit, notification, or realtime | Phases 01 and 04–06 plus both clients that expose the action |
| Import created or refactored | Phases 00–02 and 04–06; phase 03 when mobile Import is Required |
| Report engine, dataset, filters, ACL, viewer, or deployment contract | Phases 00–06 and the selected reporting engine's canonical guide |
| Required source added, removed, or moved | Required-file manifest, source minimums, affected canonical books, regeneration, and phase 06 |
| Documentation-only wording with no contract change | Owning authored source, regeneration when templated/numbered, link check, and check mode |

## Evidence and handoff rules

- Cite repository-relative files and exact symbols; folder names alone are not
  implementation evidence.
- Record exact request/response examples for every new or changed public endpoint.
- Separate feature regressions, inherited repository failures, environment
  blockers, and manual release checks. Do not merge them into one pass/fail claim.
- A focused pass proves the changed slice; it does not erase a failing full gate.
- Preserve the command, date, result count, and failure identity in phase 06.
- Update a reusable rule in its generic guide and applied behavior in affected
  feature profiles, then regenerate. Do not hand-edit generated packets.

## Final registration rules

- Draft manifests are planning aids and are never listed in `requiredFileManifests`.
- Final manifests contain no placeholder paths; every file and source collection must exist.
- A final manifest that declares `implementationRequest` must list that file
  exactly once in `requiredFiles`; check mode rejects unresolved angle-bracket
  placeholders in it.
- Use unique book IDs prefixed by the feature ID.
- Use recipe IDs `<feature>-phase-00-discovery-evidence` through `<feature>-phase-06-final-reconciliation`.
- Write outputs to `generated/<feature>/PHASE-00-discovery-evidence.md` through `PHASE-06-final-reconciliation.md`.
- Point recipe sources at the new feature's canonical books. A reference feature may guide decisions, but its fingerprints are not evidence for the new implementation.
- Run generation, then `Generate-Documentation.ps1 -Check`. Phase 06 records exact commands, skipped gates, and one handoff decision.
- Keep the generated implementation request as working scope evidence or archive
  its final decisions into the review artifact; do not register an uncompleted
  placeholder request as final evidence.

## Scope rule

Countries and States are applied guides, not global product requirements. Copy the selected reference's architecture, transaction order, server-list discipline, permission model, localization practices, and verification approach. Re-decide ownership, fields, views, actions, reports, imports, child relationships, and known gaps. Classify Import independently for API, web, and mobile; a browser workbook flow is not evidence that native mobile Import is required or can reuse browser file APIs.
