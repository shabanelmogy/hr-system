# Core Feature CQRS and Web Implementation Guide

This is the authoritative end-to-end guide for new core HR features. It joins the
API CQRS rules with the `web-next` page architecture so a feature is designed as
one vertical business slice instead of an unrelated controller and screen.

Use `Countries` as the implemented **global reference-data** slice. It has the CQRS API, REST
contract, server-managed collection, lookup endpoint, archive/restore lifecycle,
Mapster mappings, and web grid/card implementation described here. The other
geographical-information features are still visual and migration references; do not
copy their legacy service APIs or client-managed collections.

Countries deliberately has no tenant/company ownership marker. Core HR aggregates
must add tenant/company scope, scoped indexes, cross-scope tests, and concurrency or
effective-date rules where applicable.

## 1. Decisions

The following rules apply to every new core HR feature:

1. New API workflows use MediatR commands and queries. Do not create a large
   `{Feature}Service` containing all use cases.
2. A controller binds HTTP input, sends exactly one request through `ISender`, and
   translates `Result` to HTTP. It contains no business or persistence logic.
3. An Application handler owns the use case: normalization, scope checks, business
   rules, transaction boundary, save, and post-commit scheduling.
4. Infrastructure is reached through small Application-owned ports. Do not expose
   `DbContext`, `DbSet`, `IQueryable`, Hangfire, or SignalR to Application.
5. Core business lists are paged, filtered, and sorted on the server. Loading the
   full table and using `useMemo` pagination is allowed only for demonstrably small
   lookup data.
6. `web-next/src/app` routes stay thin. Feature pages, hooks, forms, tables, cards,
   and dialogs belong to `web-next/src/features`.
7. Grid and card views are the normal page baseline. Chart, report, map, timeline,
   and import views are added only when the use case needs them.
8. Tenant and company scope is mandatory for tenant-owned HR data and must be
   enforced in every read and write, not inferred from a client-supplied ID.
9. Realtime messages invalidate cached data; they are not an authoritative entity
   transport. Durable, non-critical delivery is queued only after commit.
10. A feature is not complete until its API contract, permissions, localization,
    empty/error/loading states, and focused tests are implemented together.

## 2. Current Baseline

The CQRS foundation already exists:

- `api/HrManagementSystem.Application/Abstractions/Messaging`
- `api/HrManagementSystem.Application/Behaviors/RequestLoggingBehavior.cs`
- `api/HrManagementSystem.Application/Behaviors/ValidationBehavior.cs`
- `api/HrManagementSystem.Application/DependencyInjection.cs`

`Countries` is the first complete CQRS reference. Its controller injects `ISender`
only; create, bulk create, update, archive, atomic bulk archive, restore, page, lookup, detail, and
detail-with-states are separate use cases. The legacy country service, toggle-delete,
count payload, client-managed list, and entity-carrying SignalR method are removed.

The Countries web feature provides these reference patterns:

- thin App Router adapters;
- feature-owned page composition;
- `use*GridLogic` orchestration;
- grid/card multi-view with one server query state;
- React Hook Form plus Zod;
- TanStack Query keys and invalidation;
- module permission checks;
- Arabic/English localization and RTL support;
- feature-driven realtime query invalidation.

The remaining geographical features still have gaps that must not be copied:

- `Addresses` has an API but no `web-next` feature or route;
- States, Districts, and Address Types still use client-side collection controls;
- card control logic is repeated between features;
- State-by-Country fetches all states and filters locally despite an API endpoint;
- query-key coverage and related/count endpoints are inconsistent;
- several labels use English fallback literals;
- geographic feature tests are sparse;
- chart/report/import views are present in older features even where business value
  is unclear.

## 3. Target Vertical Slice

Use this structure for a new aggregate such as Employee:

```text
api/
  HrManagementSystem.Domain/
    CoreHr/Employees/Entities/Employee.cs

  HrManagementSystem.Application/
    Features/CoreHr/Employees/
      Commands/
        CreateEmployee/
          CreateEmployeeCommand.cs
          CreateEmployeeCommandValidator.cs
          CreateEmployeeCommandHandler.cs
        UpdateEmployee/
        ArchiveEmployee/
      Queries/
        GetEmployeeById/
          GetEmployeeByIdQuery.cs
          GetEmployeeByIdQueryHandler.cs
          EmployeeDetailsResponse.cs
        GetEmployees/
          GetEmployeesQuery.cs
          GetEmployeesQueryHandler.cs
          EmployeeListItemResponse.cs
      Abstractions/
        IEmployeeReadStore.cs
        IEmployeeWriteStore.cs
        IEmployeeChangeScheduler.cs
      Errors/EmployeeErrors.cs

  HrManagementSystem.Infrastructure/
    Features/CoreHr/Employees/
      Persistence/
        EmployeeConfiguration.cs
        EmployeeReadStore.cs
        EmployeeWriteStore.cs
      Jobs/EmployeeChangedJob.cs

  HrManagementSystem.Api/
    Features/CoreHr/Employees/V1/EmployeesController.cs

web-next/src/
  app/(main)/core-hr/employees/page.tsx
  features/core-hr/employees/
    api/
    components/
      grid-view/
      card-view/
      EmployeeForm.tsx
      EmployeeDeleteDialog.tsx
      EmployeesMultiView.tsx
    hooks/
      useEmployeeQueries.ts
      useEmployeePageLogic.ts
    pages/EmployeesPage.tsx
    schemas/employeeSchema.ts
    types/employee.ts
    index.ts
```

Avoid a folder per technical type at the solution root and avoid a project per HR
feature. The system remains one modular monolith with feature folders inside the
four existing API projects.

## 4. API Contract

### 4.1 Separate requests by use case

Do not use one nullable-ID request for create and update in new features.

```csharp
public sealed record CreateEmployeeCommand(
    string EmployeeNumber,
    string NameEn,
    string NameAr,
    int DepartmentId) : ICommand<Result<EmployeeDetailsResponse>>;

public sealed record UpdateEmployeeCommand(
    int Id,
    string NameEn,
    string NameAr,
    int DepartmentId,
    byte[] RowVersion) : ICommand<Result<EmployeeDetailsResponse>>;

public sealed record GetEmployeeByIdQuery(int Id)
    : IQuery<Result<EmployeeDetailsResponse>>;
```

This makes create/update validation explicit and leaves room for optimistic
concurrency on business records.

### 4.2 Paged list query

A core list request should expose a small, typed contract:

```csharp
public sealed record GetEmployeesQuery(
    int PageNumber = 1,
    int PageSize = 10,
    string? Search = null,
    EmployeeStatus? Status = null,
    int? DepartmentId = null,
    string SortBy = "employeeNumber",
    SortOrder SortOrder = SortOrder.Ascending)
    : IQuery<Result<PageResponse<EmployeeListItemResponse>>>;
```

Rules:

- validate `PageNumber`, `PageSize`, filter values, and sort direction;
- map public sort keys through a feature-owned allowlist;
- never build dynamic member access from an unchecked column name;
- always add a stable secondary order such as `Id`;
- project only list fields and use `AsNoTracking()`;
- include pagination metadata in the response;
- reset the web page to 1 when search, filter, or page size changes.

The existing generic `PaginationRequest` can support legacy endpoints, but a core
feature owns its filter and sort vocabulary instead of accepting arbitrary database
column names.

### 4.3 Result and error rules

- Expected failures return `Result`/`Result<T>` with a stable code and `ErrorType`.
- Use `NotFound`, `Validation`, `Conflict`, `Forbidden`, and `Unexpected` precisely.
- FluentValidation handles malformed requests before the handler.
- The handler still enforces business invariants and race-sensitive checks.
- Never return an EF entity from Application or expose exception text to clients.

## 5. Handler Ownership

The command handler owns its use case and must not be a one-line wrapper around a
legacy CRUD service. A query handler may be a thin delegate to one feature-owned
read-projection port that owns scope, projection, sorting, and paging.

### Command handler order

1. Resolve the current tenant/company/actor from trusted server context.
2. Normalize input.
3. Load only the records needed for the rule.
4. Enforce tenant/company ownership, lifecycle, FK, duplicate, and concurrency rules.
5. Change domain state.
6. Save/commit once.
7. Queue non-critical notification and realtime work after commit.
8. Return a response DTO.

### Query handler order

1. Resolve trusted scope.
2. Validate the requested filters and sort key.
3. Apply scope and active/deleted rules first.
4. Apply search and filters.
5. Apply deterministic sorting.
6. Project directly to the response DTO.
7. Page in the database.

Application-owned ports should answer business-shaped questions:

```csharp
public interface IEmployeeReadStore
{
    Task<PageResponse<EmployeeListItemResponse>> SearchAsync(
        EmployeeSearchCriteria criteria,
        TenantCompanyScope scope,
        CancellationToken cancellationToken);

    Task<EmployeeDetailsResponse?> GetByIdAsync(
        int id,
        TenantCompanyScope scope,
        CancellationToken cancellationToken);
}
```

Do not create a generic repository merely to hide EF. A narrow feature port is
preferred because it can express projection, scope, and use-case-specific queries.

### Mapping policy

Use Mapster consistently for entity/request/response mapping. Let convention map
members whose names and types already match. Add explicit feature-owned rules only
for a real difference, such as normalization, an ignored identity/audit/navigation
member during update, an active-child filter, or a computed count. Do not create an
empty mapping configuration, a mapping wrapper, or repeated same-name member rules.
Mapping transforms data shape; business validation remains in validators/handlers.

## 6. Controller Standard

```csharp
[ApiVersion("1.0")]
[Route(ApiRoutes.BaseRoute2)]
[ApiController]
[TenantMember]
public sealed class EmployeesController(ISender sender) : ControllerBase
{
    [HttpGet]
    [HasPermission(Permissions.ViewEmployees)]
    public async Task<IActionResult> GetAll(
        [FromQuery] GetEmployeesQuery query,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(query, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : result.ToProblem();
    }
}
```

Controller rules:

- inject `ISender` only in a fully migrated/new controller;
- send one command/query per action;
- keep authorization, API versioning, binding, response codes, and
  `CreatedAtAction` in the API host;
- do not inject feature services or `ApplicationDbContext`;
- do not manually call validators;
- preserve cancellation tokens end to end.
- Directly bind a command only when it intentionally is the public JSON contract;
  otherwise bind a transport request and construct one command.

## 7. Persistence and Data Safety

Before the first UI for a core aggregate:

- remove any intentional EF ignore for that aggregate only after its model is ready;
- configure tenant/company ownership and required relationships explicitly;
- add unique indexes that include the owning scope where appropriate;
- choose archive/soft-delete semantics deliberately;
- filter deleted/inactive rows consistently;
- add concurrency tokens to records with important concurrent edits;
- ensure audit fields are populated through the normal `SaveChanges` path;
- generate and inspect the migration; never accept unrelated model changes;
- test cross-tenant and cross-company access adversarially.

Bulk operations must not bypass auditing or business invariants. Default to at most
100 items/IDs. Load and validate the complete requested set, including missing IDs
and dependencies, before changing tracked entities; save once so the operation is
all-or-nothing. If a bulk library is required, set all audit values explicitly and
prove equivalent behavior in tests.

Document lifecycle behavior per endpoint. A management page may expose explicit
active/archived/all filtering, lookup normally hides archived rows, detail may
include archived rows for restore hydration, and archive/restore may be idempotent.
Do not replace that matrix with a blanket soft-delete assumption.

For important concurrent edits, include a row version/ETag in the public update
contract and return a stable conflict for stale writes. Countries can remain a
lower-risk reference-data exception; employee and policy records normally cannot.

## 8. Realtime and Notifications

- Application owns a small scheduling interface.
- Infrastructure implements it with Hangfire.
- Queue only after a successful commit.
- Use the entity's view permission and the correct tenant/company audience.
- Publish stable resource/action/entity-id invalidation events.
- The client invalidates feature query keys and refetches from the API.
- Never use `Clients.All` for tenant-owned data.
- A MediatR notification is in-process and non-durable; it does not replace
  Hangfire for required post-commit background delivery.
- A database commit followed by a Hangfire enqueue is a deliberate dual-write
  boundary. It is acceptable here only for non-critical UI invalidation and inbox
  delivery. If a business workflow requires guaranteed publication, introduce a
  transactional outbox and idempotent consumer instead of claiming the two writes
  are atomic.

## 9. Web Page Standard

### 9.1 Route and page boundaries

The App Router file is a thin adapter:

```tsx
import { EmployeesPage } from "@/features/core-hr/employees";

export default function Page() {
  return <EmployeesPage />;
}
```

`EmployeesPage` owns composition, while hooks own data/mutation/dialog state. Route
files do not contain business tables, forms, API calls, or permission logic.

### 9.2 Required page states

Every business list handles:

- initial loading;
- refetching without destroying the current view;
- empty database;
- no filter/search results;
- recoverable API error with retry;
- permission-denied actions;
- expired/read-only tenant state;
- create/edit/delete success and failure;
- RTL layout and translated validation.

### 9.3 Header and controls

Use the shared page header and keep controls predictable:

- breadcrumb/title and primary create action;
- search input with debounce;
- reusable filter button beside search with an active-filter count badge;
- sort controls where the selected view needs them;
- view switcher;
- export/import only when authorized and operationally useful.

Search/filter/sort/page state must produce one typed API query. Do not independently
reimplement the same filtering in grid and card views.

### 9.4 Multi-view policy

Required by default:

- **Grid** for dense administration and sorting;
- **Cards** for responsive scanning and mobile-sized web layouts.

Optional:

- chart only for a meaningful metric;
- report only for a defined printable/export workflow;
- map only for geographic coordinates;
- timeline/calendar only for time-based records;
- import only with mapping, validation, preview, error export, and permission checks.

All views share the same server query, filters, permissions, and selected record.
Switching view must not silently change the data set.

### 9.5 TanStack Query standard

Use stable feature keys that include every server query parameter:

```ts
export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (query: EmployeeListQuery) => [...employeeKeys.lists(), query] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (id: number) => [...employeeKeys.details(), id] as const,
};
```

- mutation success invalidates the smallest correct root;
- realtime registry maps the backend resource to the same feature keys;
- dependent dropdowns call their dedicated API endpoint;
- do not fetch a parent table only to filter it in the browser;
- keep API path definitions centralized and use a feature-owned typed service.

### 9.6 Forms, permissions, and localization

- React Hook Form owns form state and Zod owns client validation.
- Client validation improves UX; the API remains authoritative.
- Create and update payload types are distinct.
- Page and direct action handlers both fail closed on missing permission.
- Every visible label, fallback, validation message, empty state, and toast is in
  English and Arabic resources.
- Verify keyboard navigation, focus after dialogs, screen-reader labels, and RTL.

## 10. Countries Reference Map

Use these files as the implemented reference:

- Countries controller: `api/HrManagementSystem.Api/Features/GeographicalInformation/Countries/V1/CountriesController.cs`
- Commands/queries: `api/HrManagementSystem.Application/Features/GeographicalInformation/Countries`
- Mapster rules: `api/HrManagementSystem.Application/Features/GeographicalInformation/Countries/Mapping/CountryMappingConfig.cs`
- Persistence ports: `api/HrManagementSystem.Infrastructure/Features/GeographicalInformation/Countries/Persistence`
- Countries page: `web-next/src/features/basic-data/geographical-information/countries/pages/CountriesPage.tsx`
- Countries multi-view: `web-next/src/features/basic-data/geographical-information/countries/components/CountriesMultiView.tsx`
- Countries orchestration: `web-next/src/features/basic-data/geographical-information/countries/hooks/useCountryGridLogic.ts`
- Countries queries: `web-next/src/features/basic-data/geographical-information/countries/hooks/useCountryQueries.ts`
- Country form: `web-next/src/features/basic-data/geographical-information/countries/components/CountryForm.tsx`
- Shared server list state: `web-next/src/shared/hooks/useServerListState.ts`

Migrate the other geographic features toward this reference rather than copying
their current implementation. Remaining follow-ups are:

1. implement the missing Addresses web feature;
2. use the existing by-country/by-state API endpoints;
3. standardize their query keys and dialog state;
4. replace repeated client collection state with `useServerListState` and paged APIs;
5. remove hard-coded fallback labels and fix namespace mismatches;
6. add form, query invalidation, permission, and view tests;
7. fix each legacy API's correctness issues while migrating it to CQRS.

## 11. Recommended Core HR Delivery Order

Do not start with payroll. Build the dependency chain:

1. **Organization foundation**: legal entities/companies, locations, departments,
   positions/jobs, reporting lines, and effective dates.
2. **Employee master**: employee identity, employment record, contacts/addresses,
   assignment, status/lifecycle, documents, and audit trail.
3. **Employee lifecycle**: invite/activation, onboarding checklist, transfers,
   promotion, suspension, termination, and offboarding.
4. **Leave and approvals**: policies, balances, requests, approval routing, calendar,
   and notifications.
5. **Attendance/time**: schedules, shifts, punches, corrections, and approvals.
6. **Payroll/benefits** only after organization, employee, time, policy, audit, and
   entitlement foundations are stable.

Deliver one aggregate end to end before opening several unfinished screens.

## 12. Feature Implementation Playbook

### Discovery

- write the business invariants and user actions;
- identify tenant/company ownership and permissions;
- define list columns, filters, sort keys, and expected scale;
- define archive/delete, concurrency, audit, and effective-date behavior;
- decide which views have real business value.

### Backend

1. Domain entity/value objects and invariants.
2. EF configuration and scoped indexes.
3. Application response models and narrow ports.
4. List/detail queries and validators.
5. Create/update/archive commands and validators.
6. Infrastructure stores.
7. Controller and permissions.
8. Post-commit jobs and realtime registry contract.
9. Migration inspection.
10. Handler, persistence, authorization, and HTTP contract tests.

### Web

1. Central route and API path.
2. Types and Zod schemas.
3. Typed service and TanStack query keys/hooks.
4. Thin route and feature page.
5. Shared search/filter/sort/page state.
6. Grid and card views.
7. Form and destructive-action confirmation.
8. Permissions, read-only boundary, localization, RTL, accessibility.
9. Realtime invalidation.
10. Focused component/hook tests and required architecture checks.

## 13. Definition of Done

### API

- controller sends one MediatR request;
- command/query validators are discovered by the pipeline;
- handlers do not delegate to a legacy feature service;
- all reads/writes enforce tenant/company ownership where applicable;
- list filtering/sorting/paging occurs in the database;
- save completes before background scheduling;
- error codes and HTTP statuses are stable;
- migration contains only intended model changes;
- tests cover success, validation, duplicate, not-found, FK/dependency,
  cross-scope, concurrency, cancellation, and post-commit scheduling.

### Web

- App Router adapter is thin;
- types match the API contract without `any`;
- search/filter/sort/page parameters share one source of truth;
- grid and cards show the same server result;
- loading/empty/no-results/error/read-only states work;
- direct mutation handlers enforce permission, not only hidden buttons;
- EN/AR, RTL, keyboard, and dialog focus are checked;
- query invalidation and realtime refresh are tested;
- architecture, type, strict type, lint, tests, and production build pass.

Run the checks documented in:

- `web-next/docs/architecture/frontend-architecture-reference.md`
- `api/Docs/Clean_Architecture_CQRS_Guide.md`
- `api/Docs/Realtime_Updates_Guide.md`

Do not update `graphify-out` as part of ordinary feature implementation.

## 14. Anti-Patterns

- one service class containing every CRUD/query/business workflow;
- a handler that only calls that service;
- `DbContext` or Hangfire in a controller;
- Infrastructure request/response types leaking into Application;
- one request DTO reused for create and update;
- arbitrary client-provided database column names used for sorting;
- loading all employees and paginating in React;
- duplicated filter logic in grid and card views;
- feature UI placed inside `src/app`;
- chart/import/report tabs added only because another feature has them;
- authorization implemented only by hiding a button;
- realtime payload treated as the saved record;
- cross-tenant IDs trusted from the request body.
