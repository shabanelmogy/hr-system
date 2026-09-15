# Foundation Closure Matrix

**Architecture-foundation status: CLOSED**  
**Final verification date: 2026-09-14**

This matrix closes the API architecture-foundation phase defined by
`ERP_ARCHITECTURE_CONSTITUTION.md`. It certifies the modular-monolith foundation,
ownership boundaries, CQRS/controller policy, isolation rules, persistence/migration
story, generator consistency, and automated regression gates. It does **not** claim
that future ERP business capabilities or production-environment deployment evidence
are complete.

## Final architecture findings

| Finding / gate | Root fix | Final evidence | Status |
| --- | --- | --- | --- |
| Business controllers could bypass CQRS through direct services | Invitations, Files, Authentication, Platform administration/localization/offline/modules/notifications/security audits/entity logs, Reporting exports/views, Accounting invoice QR, Inventory catalog, CRM appointments and Background Jobs use explicit requests through `ISender` | Executable `ControllerArchitectureTests`; Platform `BackgroundJobsController` is sender-only | Closed |
| Controller policy was convention-only rather than executable | Added solution-level controller constructor gate: business controllers require `ISender` and reject business service/store/repository/DbContext/UoW-style dependencies | `ErpSystem.ArchitectureTests` | Closed |
| Reporting view-management needs a runtime-only Development gate | Kept the transport/runtime check in Presentation instead of pushing host environment inward | Exact narrow exception: `ViewsController -> IWebHostEnvironment`; all business operations still dispatch through `ISender` | Accepted transport-only exception |
| Invitation lifecycle lived in persistence/service code | Invitation creation, renewal, acceptance, revocation, assignment normalization and default-company invariant moved to Domain; Application owns orchestration/ports | Platform invitation Domain/Application tests | Closed |
| Broad legacy business facades remained after CQRS replacements | Removed obsolete `IUserInvitationService`, `IFileOperationsService`, and pass-through `ITenantModuleEntitlementService`; no compatibility facade restored | Architecture/source scans plus module tests | Closed |
| Background Jobs controller depended directly on dashboard services and direct time | Added explicit dashboard requests; Application uses `TimeProvider`; Infrastructure owns Hangfire reader/session bridge | Platform Background Jobs tests and controller gate | Closed |
| Inner layers could regress to direct clocks/environment/crypto/EF/web dependencies | Added executable layer-purity tests for Domain/Application and kept provider implementations in Infrastructure | `LayerPurityTests` | Closed |
| SecurityAudit company scope could fall back to request data for a non-platform administrator | Non-platform administrators now require both tenant and company from execution context; request company cannot substitute for missing current company | Platform security-audit fail-closed test | Closed |
| Tenant and company boundaries could be conflated | Company-scoped DbContexts/read stores/write paths enforce tenant and company independently; cross-company writes fail closed | Module scope/isolation tests and Integration tests | Closed |
| Cross-module implementation references could bypass Contracts | Runtime project-reference rules enforce foreign-module references through `*.Contracts` only; BuildingBlocks remain business-neutral | Solution structure architecture tests; current reference scan | Closed |
| Test debt could be hidden with the old catch-all project or `Compile Remove` | Tests are module-owned plus Architecture/Integration/BuildingBlocks system projects; legacy `ErpSystem.Tests` is absent; hidden source removal is forbidden | `SolutionStructureTests`; final run has zero skipped tests | Closed |
| Module generator could drift from canonical module structure | Generator creates six runtime projects plus one owned test project, shared pipeline, versionless central packages, module-local EF boundary and documentation package | `ModuleGeneratorTests` | Closed |
| `CRM` acronym naming caused migration tooling to miss `CrmModule` | Registry parsing in migration/drift scripts is case-insensitive for the bootstrap type; generator emits CLR-safe `Crm*` symbols while keeping module/project identity `CRM` | Architecture regression plus live drift run includes CRM | Closed |
| EF drift CI was hard-coded to four DbContexts | Added `scripts/Test-ErpModuleModelDrift.ps1`; CI discovers every registered module and its one module-owned DbContext dynamically | Live drift verification passed for all 9 registered modules | Closed |
| Module migrations could be removed while static architecture tests stayed green | Created a clean initial migration plus model snapshot for every registered module and added a SQL-independent architecture gate requiring at least one migration, its designer, and the owning DbContext snapshot | `ModulePersistenceStructureTests.EveryModuleDbContext_HasBaselineMigrationAndModelSnapshot`; clean-database migration integration test | Closed |
| Deployment migration discovery had the same CRM naming weakness | `Apply-ErpModuleMigrations.ps1` uses the same registry-safe discovery and preserves immediate exit-code checks | Migration architecture tests | Closed |
| Documentation evidence still referenced retired `ErpSystem.Tests` paths | Required-file manifests now point at the owning module test projects and the current entitlement persistence adapter | Documentation generator check: 77/77 recipes | Closed |
| Important architecture rationale existed only in implementation/review history | Added seven focused ADRs covering module ownership, project shape, schema-per-module persistence, CQRS boundary, cross-module messaging, tenant/company isolation and analyzer adoption | `documentation/api/adr/README.md` | Closed |

## Earlier foundation findings retained

| Finding | Root fix | Status |
| --- | --- | --- |
| Contacts endpoints lacked module permission and entitlement enforcement | `TenantMember` plus `HasPermission` policies backed by the live Platform entitlement port | Closed |
| Contacts updates could overwrite a stale screen | Mandatory `ExpectedRevision`, aggregate `Revision`, EF concurrency token and stable conflict mapping | Closed |
| Accounting projection used timestamps as its ordering contract | Monotonic `SourceRevision` in public events and projection guard | Closed |
| Platform duplicated HR-owned identity/tenant mappings | Platform owns Identity, tenant/company membership, sessions and entitlement policy; obsolete compatibility stacks removed | Closed |
| Data Protection keys could be lost or unreadable after restart/scale-out | Persistent key ring, production certificate policy, shared-ring assertion and rotation support | Closed |
| ClamAV malformed responses could be trusted | Strict bounded fail-closed protocol parsing | Closed |
| UTF-8 sample boundaries could reject valid Arabic text | Stateful decoding with true end-of-stream validation | Closed |
| CI could hide an earlier EF failure | Migration/drift commands check exit codes immediately; drift discovery is now dynamic | Closed |
| Deployment migration script used unsupported EF CLI verbosity | Unsupported argument removed; migration ordering and failure propagation preserved | Closed |

## Final verification — 2026-09-14

- **Forced Release solution build (`--no-incremental`):** `0` errors and `387`
  Roslyn Code Analysis warnings. Compiler warnings remain errors; analyzer debt is
  explicitly governed by `ADR-007` and `CodeAnalysisTreatWarningsAsErrors=false`
  until it is burned down module-by-module. Incremental up-to-date builds are not
  used as evidence of zero warnings.
- **Unified Release solution tests:** `807 passed`, `0 failed`, `0 skipped`
  across `12` test projects.
  - Nine module-owned projects: `617 passed`.
  - `ErpSystem.ArchitectureTests`: `49 passed`.
  - `ErpSystem.BuildingBlocks.Tests`: `21 passed`.
  - `ErpSystem.IntegrationTests`: `120 passed`.
- **EF migration baseline:** all `9/9` registered modules own a clean initial
  migration plus DbContext model snapshot; the static architecture gate prevents
  silent migration removal without requiring SQL Server.
- **Clean-database migration composition:** the nine module migration chains apply
  successfully to one LocalDB database and a second migration pass is idempotent.
- **EF model/migration drift:** all `9/9` registered modules pass, including CRM.
- **NuGet direct/transitive vulnerability audit:** `74` projects audited, `0` known findings.
- **Documentation system:** `77/77` registered recipes pass check mode.
- **Whitespace gate:** repository-wide `git diff --check` passes with no
  non-warning findings.
- **Hidden-test gate:** no `Compile Remove` test hiding and no skipped tests in the
  final solution run. The retired `api/ErpSystem.Tests` filesystem residue was
  removed; module-owned/system test projects are the only live test ownership path.

### Reproduce the closure evidence

Run these commands from `api/` unless noted otherwise:

```powershell
dotnet build ErpSystem.sln -c Release --no-restore --no-incremental
dotnet test ErpSystem.sln -c Release --no-build --no-restore
./scripts/Test-ErpModuleModelDrift.ps1 -ApiRoot (Get-Location).Path -Configuration Release
dotnet test Tests/ErpSystem.IntegrationTests/ErpSystem.IntegrationTests.csproj `
  -c Release --no-restore --filter "FullyQualifiedName~ModuleMigrationIntegrationTests"
dotnet list ErpSystem.sln package --vulnerable --include-transitive
```

From the repository root:

```powershell
./documentation/system/Generate-Documentation.ps1 -Check
git diff --check
```

The repository worktree is intentionally still shared/dirty while the larger ERP
refactor is being segmented. This closure record certifies the verified current
working tree; it does **not** claim that all repository changes have already been
committed as one review unit. Do not collapse the shared worktree into a single
commit merely to make this matrix appear clean.

The previous 2026-09-12 totals (`870` tests, four EF contexts and 31 audited
projects) are historical evidence only and are intentionally superseded by the
current modular solution results above.

## Closure decision

All applicable P0/P1 architecture-foundation blockers in the constitution have
current executable evidence and no unresolved structural blocker remains in this
phase. The remaining analyzer diagnostics are tracked quality debt under ADR-007,
not hidden compiler failures or a second architecture path.
The **API architecture-foundation phase is CLOSED**.

Future Accounting, POS, HR, CRM, Inventory and other ERP work should now follow the
established vertical-slice pattern and concentrate on business behavior. Real
ClamAV/Redis/backplane/container/proxy and environment-specific database deployment
checks remain release/deployment evidence; they are not a reason to reopen the
architecture foundation unless they expose a structural defect.
