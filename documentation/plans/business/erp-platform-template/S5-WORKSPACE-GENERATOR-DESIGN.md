# S5 — New-product workspace generator design

| Field | Value |
| --- | --- |
| Plan | `erp-platform-template`, slice S5 |
| Status | Design draft; script not written yet |
| Prepared | 2026-10-06 from the API sources and module manifests staged during the 2026-09-28 review |
| Output | `templates/New-ErpWorkspace.ps1` (PowerShell 7, same style as `api/scripts/New-ErpModule.ps1`) |

## 1. Goal

One command creates a new product repository from this platform with only the modules the
product needs, builds green, and starts with clean planning registries:

```powershell
./templates/New-ErpWorkspace.ps1 `
  -ProductName "Nile Trading" `
  -ProductSlug "niletrading" `
  -Modules ReferenceData, Contacts, CRM `
  -Destination G:\products\niletrading `
  [-WhatIf]
```

`Platform` is always included. The code namespace stays `ErpSystem` (D-008); only product
identity (names, bundle ids, titles) changes.

## 2. Source of truth: `documentation/modules/*/module.json`

Every module already has a machine-readable manifest. Verified fields (Accounting, CRM):

| Field | Generator use |
| --- | --- |
| `moduleName`, `docSlug`, `databaseSchema` | Identify the module and its schema |
| `requiredModuleDependencies` | Dependency closure (must be included) |
| `optionalModuleDependencies` | Allowed to be absent |
| `runtimePaths.*` | API folders to remove when the module is not selected |
| `webNextSurface.sourceRoot`, `.moduleDefinition` | Web folder and definition to remove |
| `documentationPaths.root` | Module documentation package to remove |

**Prerequisite S5.0 (manifest completion):** add to every `module.json`

```json
"mobileReactSurface": {
  "status": "active",
  "sourceRoot": "mobile-react/src/modules/<slug>",
  "moduleDefinition": "mobile-react/src/modules/<slug>/moduleDefinition.ts"
},
"registrationPoints": [
  { "file": "api/ErpSystem.Api/Modules/ErpModuleRegistry.cs", "marker": "erp-module-registrations" }
]
```

and extend `New-ErpModule.ps1` to write them. `registrationPoints` lists every file outside
the module folder that names the module (host registry, web module registration, mobile route
manifest, navigation). The generator removes exactly those lines; it never searches and
replaces blindly. The web and mobile registration files are **not yet verified** in this
review; S5.0 starts with `git grep -l "<ModuleName>\|<slug>" -- web-next/src mobile-react/src`
outside each module folder to list them.

## 3. Algorithm

1. **Validate input.** Product name/slug format; destination empty; every requested module
   has a manifest.
2. **Close dependencies.** Add `Platform`, then repeat: add `requiredModuleDependencies` of
   every selected module. Also read each selected module's `.csproj` `ProjectReference`s; a
   reference into an unselected module's project is a hard dependency even if the manifest
   calls it optional — stop with a message naming both modules.
3. **Export a clean copy.** `git archive HEAD` into the destination, so ignored and untracked
   files (`node_modules`, `bin`, `obj`, `graphify-out` caches, local secrets) never travel.
4. **Remove unselected modules.** For each: delete `runtimePaths.root`,
   `webNextSurface.sourceRoot`, `mobileReactSurface.sourceRoot`, `documentationPaths.root`;
   remove its lines at every `registrationPoints` marker; `dotnet sln remove` its projects
   (including tests).
5. **Reset product planning.** Keep the planning and documentation *system* (standards,
   templates, scripts, catalogs, ADRs, skills). Reset *product state*:
   `PLAN_REGISTRY.md` tables empty; `plans/business/` empty (README kept); `plans/notes/*`
   tables empty with headers; feature evidence under `documentation/system/features/` and
   `generated/` kept only for features of selected modules, then regenerate.
6. **Apply product identity.** Web metadata title and manifest name; mobile `app.json`/
   `app.config.ts` name, slug, iOS bundle identifier, Android package; root `README.md`
   title; container image and CI artifact names; JWT `Issuer`/`Audience` in
   `appsettings.example.json` (resolves DEC-012 for new products).
7. **Initialize.** `git init`, first commit "Workspace generated from ERP platform <commit>".
8. **Verify (unless `-SkipVerify`).** `dotnet build` + `dotnet test`; modularity test (registry
   equals module folders on disk); web `npm ci`, `type-check`, `lint`, `build`; mobile
   `npm ci`, `check`; `Check-Planning.ps1`; `Generate-Documentation.ps1 -Check`. Print a
   summary with any failing step.

`-WhatIf` prints the closure, every path to delete, every registration line to remove, and
every identity value to change, without writing.

## 4. Minimal and full profiles

| Profile | Modules | Use |
| --- | --- | --- |
| Minimal | Platform, ReferenceData | Smallest buildable product; used by CI |
| Business core | + Contacts, Reporting | Common starting point |
| Full | All modules | Same as this repository |

Commercial packages (DEC-013) are removed with their owning module; until DEC-013 isolates
Syncfusion and Mescius in the web client, the generator warns that they remain.

## 5. CI

A job runs `New-ErpWorkspace.ps1 -Modules ReferenceData -Destination $RUNNER_TEMP/minimal`
and its verification step on every change to `templates/`, `api/scripts/`, any
`module.json`, or registration files. A failing generated workspace blocks the change.

## 6. Mobile module scaffold (S5.2)

`New-ErpModule.ps1` creates API + documentation; web has `generate:module`. Mobile needs the
same: `mobile-react/scripts/generate-module.mjs <slug>` creating
`src/modules/<slug>/moduleDefinition.ts`, an empty route group, translation namespaces, and
the registration line, matching the existing module boundary rules. Shape to be copied from
an existing small module (CRM) once the repository is reachable.

## 7. Exit checks

- S5.0 manifests complete and written by `New-ErpModule.ps1`.
- Generator with `-WhatIf`, dependency closure, project-reference guard, identity changes.
- Minimal and full profiles generate and pass verification locally and in CI.
- Mobile module scaffold (S5.2).
- `erp-business-planning` §2 updated from "stop" to the generator command.
