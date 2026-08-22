# API Build Guidance

Before adding or restructuring an API feature, read the centralized [feature module guide](../documentation/api/Feature_Module_Implementation_Checklist.md) and [CQRS guide](../documentation/api/Clean_Architecture_CQRS_Guide.md).

When following Countries, read the [cross-platform master](../documentation/project/COUNTRIES_FEATURE_FULL_REVIEW.md), the [API applied profile](../documentation/api/Countries_API_Implementation_Profile.md), and phases 01, 04, 05, and 06 under `../documentation/system/generated/`.
When the feature has a required parent relationship, compare the States profiles as the closer applied reference. Always classify global, tenant, and company ownership independently.

- Keep controllers thin and send typed CQRS messages.
- Keep persistence and infrastructure concerns behind application abstractions.
- Persist and audit once, then schedule notification/realtime work after a successful commit.
- Register stores, validators, mapping, localization, permissions, and jobs explicitly.
- Add handler, architecture, controller, and contract-focused tests.
- Run `../documentation/system/Generate-Documentation.ps1 -Check` when a feature contract, source manifest, or guide changes.
- Do not create a new `api/Docs/` directory.

Before handoff, run from `api/`:

```powershell
dotnet restore HrManagementSystem.sln
dotnet build HrManagementSystem.sln --no-restore
dotnet test HrManagementSystem.Tests/HrManagementSystem.Tests.csproj --no-build --no-restore
```

If a running API locks normal outputs, use one explicit isolated `--artifacts-path` for restore, build, and test. Record any skipped integration or migration gate instead of reporting the feature as fully verified.
