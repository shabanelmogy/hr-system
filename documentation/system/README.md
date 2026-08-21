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
```

Generation validates every required file and source collection before writing. Check mode also recomputes every selected output and fails when a packet is missing or stale.

## Workflow

1. Run check mode before starting. Resolve stale documentation first.
2. Read phase 00 and create a feature evidence artifact from `templates/FEATURE-REVIEW-ARTIFACTS.template.md`.
3. Complete phases 01 through 05 in order. Record evidence using repository-relative paths and exact symbols.
4. Complete phase 06 after tests and cross-client reconciliation.
5. If a canonical rule changes, update the canonical book and regenerate. Never patch generated output.

## Scope rule

Countries is a guide, not a global product requirement. Copy its architecture, transaction order, server-list discipline, permission model, localization practices, and verification approach. Re-decide feature-specific fields, views, actions, reports, imports, child relationships, and known gaps.
