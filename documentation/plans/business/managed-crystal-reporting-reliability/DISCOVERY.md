# Managed Crystal Reporting Reliability — Discovery

## Request and planning authority

- The requested scope is a comprehensive review and a phased modification plan for
  `api/CrystalReportGeneratorApi` and the managed-reporting path that calls it.
- The requester explicitly prioritised business logic while the product is still in
  development. Security hardening is therefore the final implementation phase, not
  the first phase and not omitted from release readiness.
- Fiscal Years remains a supported managed-report entity. It is tenant/company
  scoped and does not become part of the global geographic report scope.
- This planning change does not authorize runtime implementation. The plan remains
  `Draft`; the first executable child contract and `ACTIVE_FEATURE_STEP` are created
  only after the requester approves starting implementation.

## Business problem

The Reporting module already owns report metadata, immutable versions, publication,
access grants and business data acquisition, while the independent .NET Framework
Crystal runtime inspects and renders `.rpt` files. The overall boundary is sound,
but the runtime and the manager do not share one exact, typed definition of a
supported entity. Consequently a template can be stored or published even when its
table, fields, field types, nullability or parameters do not match the DataSet that
will be sent at render time.

The clearest current failure is `fiscalyears`: API, Web and Mobile expose the entity
and the Reporting module has a provider, but the runtime profile registry does not
include it. A valid published Fiscal Years report therefore cannot render.

## Target users and jobs

| User / system | Job to be done |
| --- | --- |
| Reporting administrator | Select a supported report entity, upload/import a compatible `.rpt`, understand validation errors, publish a valid version and assign access. |
| Authorized ERP user | Discover and render a compatible published report in Arabic or English using the current entity screen. |
| Reporting module | Resolve tenant/company scope and ACL, acquire business data from the owning module, and send only an approved typed DataSet to the runtime. |
| Crystal runtime | Validate a template and render it against the exact approved contract without owning ERP business data or database access. |
| Release operator | Deploy matching Reporting/runtime artifacts and report sources, prove readiness, and diagnose failures by stable error codes and correlation IDs. |

## Confirmed decisions

1. Reporting remains the bounded-context owner of managed Crystal report lifecycle,
   contracts, publication, access, and runtime integration.
2. Accounting remains the owner of Fiscal Year and Fiscal Period business data.
3. The Crystal runtime remains an independent, database-isolated rendering adapter.
4. `fiscalyears` remains required and tenant/company scoped.
5. The first technical priority is one canonical typed entity contract consumed and
   verified by both Reporting and the runtime.
6. Template validation becomes entity-aware and happens before a version is marked
   valid or can be published.
7. Existing development data/templates may be invalidated and revalidated; backward
   compatibility with incorrectly validated development versions is not a goal.
8. Security and third-party dependency hardening is the last implementation phase.

## Explicit non-goals

- No browser or mobile Crystal report designer.
- No SQL, connection string, tenant ID, company ID or physical path supplied by a
  client to the Crystal runtime.
- No direct ERP database access from `CrystalReportGeneratorApi`.
- No subreports, saved report data or external database metadata in managed reports.
- No relationship between report availability and a selected/current fiscal year;
  `fiscalyears` is simply one reportable entity profile.
- No native Mobile administration screen for report definitions in this plan.
- No replacement of the separate RDLX/ReportTemplate capability.

## Discovery conclusion

The capability is an existing-feature reliability rebuild, not a new reporting
product. It should be delivered in dependency order: contract truth, entity-aware
validation, manager lifecycle/UX, Fiscal Years acceptance, runtime operations, and
finally security/release hardening. Cross-platform success is proven only when a
published Fiscal Years template renders through authenticated Web and actual Mobile
flows against the live Reporting API and Crystal runtime.
