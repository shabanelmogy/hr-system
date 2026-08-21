# API Build Guidance

Before adding or restructuring an API feature, read the centralized [feature module guide](../documentation/api/Feature_Module_Implementation_Checklist.md) and [CQRS guide](../documentation/api/Clean_Architecture_CQRS_Guide.md).

When following Countries, read the [cross-platform master](../documentation/project/COUNTRIES_FEATURE_FULL_REVIEW.md), the [API applied profile](../documentation/api/Countries_API_Implementation_Profile.md), and phases 01, 04, 05, and 06 under `../documentation/system/generated/`.

- Keep controllers thin and send typed CQRS messages.
- Keep persistence and infrastructure concerns behind application abstractions.
- Persist and audit once, then schedule notification/realtime work after a successful commit.
- Register stores, validators, mapping, localization, permissions, and jobs explicitly.
- Add handler, architecture, controller, and contract-focused tests.
- Run `../documentation/system/Generate-Documentation.ps1 -Check` when a feature contract, source manifest, or guide changes.
- Do not create a new `api/Docs/` directory.
