# API Build Guidance

For every new API feature, use case, endpoint, business-rule change, integration,
or persistence change, start with the mandatory
[API Feature Development Workflow](../documentation/api/API_FEATURE_DEVELOPMENT_WORKFLOW.md).
Its Existing-System Relationship Review must be completed before new code is
introduced: inspect the current owner, reuse or extend the existing capability,
and modify the owning business model when the new requirement demands it instead
of creating a parallel implementation.

The [ERP Architecture Constitution](../documentation/api/ERP_ARCHITECTURE_CONSTITUTION.md)
is the authoritative architecture policy. The
[Clean Architecture and CQRS Guide](../documentation/api/Clean_Architecture_CQRS_Guide.md)
is the technical pattern reference. New bounded contexts additionally follow the
[Modular Monolith Architecture](../documentation/api/MODULAR_MONOLITH_ARCHITECTURE.md).

When following Countries, read the [cross-platform master](../documentation/project/COUNTRIES_FEATURE_FULL_REVIEW.md), the [API applied profile](../documentation/api/Countries_API_Implementation_Profile.md), and phases 01, 04, 05, and 06 under `../documentation/system/generated/`.
When the feature has a required parent relationship, compare the States profiles as the closer applied reference. Always classify global, tenant, and company ownership independently.

- Keep controllers thin and send typed CQRS messages.
- Keep persistence and infrastructure concerns behind application abstractions.
- Model real same-module relationships as EF navigation properties and prefer Mapster `ProjectToType<T>()` when it removes hand-written joins or intermediate `*ReadProjection` wrappers for ordinary relational DTOs. Reserve explicit joins/projections for aggregate, reporting, security, cross-module, provider-specific, or otherwise synthetic reads.
- Mapping is convention-first: Mapster already flattens `BranchNameEn <- Branch.NameEn` and `AttendanceAgentName <- AttendanceAgent.Name`. Add `.Map(...)` only for a non-inferable path or a real transform/computation/filter/order rule; do not create a mapping file or add Mapster to a module just for symmetry.
- Keep Domain-to-Application Mapster configuration in Application; put mapping in Infrastructure only when an Infrastructure-owned type participates.
- Persist and audit once, then schedule notification/realtime work after a successful commit.
- Register stores, validators, required custom mapping, localization, permissions, and jobs explicitly.
- Add handler, architecture, controller, and contract-focused tests.
- Run `../documentation/system/Generate-Documentation.ps1 -Check` when a feature contract, source manifest, or guide changes.
- Do not create a new `api/Docs/` directory.

Before handoff, run from `api/`:

```powershell
dotnet restore ErpSystem.sln
dotnet build ErpSystem.sln -c Release --no-restore
dotnet test ErpSystem.sln -c Release --no-build --no-restore
```

If a running API locks normal outputs, use one explicit isolated `--artifacts-path` for restore, build, and test. Record any skipped integration or migration gate instead of reporting the feature as fully verified.
