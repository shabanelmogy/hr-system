# S7 — Record scope (row-level access) design

| Field | Value |
| --- | --- |
| Plan | `erp-platform-template`, slice S7 |
| Status | Design draft for G2 review; no runtime change yet |
| Prepared | 2026-10-06 from the API sources staged during the 2026-09-28 review |
| Consumers waiting on it | `education-module` (teacher, guardian, student visibility), HR (manager sees own team), CRM (own appointments), any approval inbox (P-014) |

## 1. Problem

Authorization today answers **may this user perform `Resource:Action` in this tenant and
company?** It does not answer **which rows of that resource may this user see or change?**

Current layers, verified in source:

| Layer | Where | What it guarantees |
| --- | --- | --- |
| Permission claim + live role check + module entitlement | `PermissionAuthorizationHandler` → `ITenantModuleEntitlementSource.UserHasPermissionAsync` / `HasAccessAsync` | The action is allowed at all |
| Tenant filter | `ApplicationDbContext` named query filter `TenantFilter` | Rows of other tenants are invisible |
| Company filter | `ApplicationDbContext` named query filter `CompanyFilter` | Rows of other companies are invisible |
| Module-local scope helpers | `CRM …/AppointmentScope.cs` (user + tenant + company), `Inventory …/CatalogScope.cs` (tenant + company) | Each module re-derives the actor scope by hand |

Missing: a shared, declarative way to narrow rows inside a company by **ownership** or
**relationship** (own records, my team, my classes, my children), applied the same way to
lists, single reads, writes, exports, reports, dashboards, and realtime notifications.

## 2. Design

### 2.1 Scope levels

Each scoped resource supports a subset of these levels, ordered from narrowest to widest:

| Level | Meaning | Example |
| --- | --- | --- |
| `Own` | Rows whose owner is the current user | My appointments, my leave requests |
| `Assigned` | Rows linked to the user through a module-owned relationship | Teacher → students of classes taught; guardian → own children |
| `Team` | `Own` plus rows owned by the user's reports (direct and indirect) | Manager → team leave requests |
| `Company` | Every row in the current company (today's behavior) | HR administrator |

`Company` is the default for every existing role and resource, so introducing the mechanism
changes nothing until an administrator narrows a role.

### 2.2 Grants

Scope is a property of a **role for a resource**, next to the existing role permissions:

```text
RoleResourceScope (TenantId, RoleId, Resource, Level)
```

- `Resource` is the same name used in permissions (`EducationStudents`, `LeaveRequests`).
- A user with several roles receives the **widest** level among them (union semantics,
  consistent with how permissions combine across roles). See DEC-019.
- A resource opts in by declaring its supported levels; roles cannot be granted a level the
  resource does not support.
- Editing scopes reuses the Role Permissions screen (P-006): each resource row gains a level
  selector limited to the supported levels.

### 2.3 Resolution

```csharp
// BuildingBlocks.Authorization (contract only)
public enum RecordScopeLevel { Own = 0, Assigned = 1, Team = 2, Company = 3 }

public interface IRecordScopeSource
{
    // Widest level across the user's roles for the resource in the current tenant.
    Task<RecordScopeLevel> GetLevelAsync(string userId, string tenantId, string resource, CancellationToken ct);
}
```

- Platform implements `IRecordScopeSource` beside `ITenantModuleEntitlementSource`, reading
  `RoleResourceScope` with the same caching and invalidation as role permissions (role edit,
  user role change, security-stamp change).
- Levels are **not** placed in the JWT (token size, staleness); they are resolved server-side.

### 2.4 Predicates are owned by the module

```csharp
// BuildingBlocks.Authorization
public interface IRecordScopePolicy<TEntity>
{
    string Resource { get; }
    IReadOnlySet<RecordScopeLevel> SupportedLevels { get; }
    Expression<Func<TEntity, bool>> Predicate(RecordScopeLevel level, RecordScopeActor actor);
}

public sealed record RecordScopeActor(string UserId, string TenantId, int CompanyId);
```

- The owning module writes the predicate; it must translate to SQL (no client evaluation).
- Relationship data needed by predicates is stored or projected inside the owning module:
  - `Team`: HR maintains an employee hierarchy closure table
    `(TenantId, CompanyId, AncestorEmployeeId, DescendantEmployeeId)` updated when managers
    change, so `Team` is one indexed join.
  - `Assigned` for Education: `TeachingAssignment`/enrollment tables already inside the module.
  - Another module's data is consumed through its public Contracts or a local projection
    (the Accounting ↔ Contacts pattern), never by joining its schema.
- `RecordScopeActor` is built from `ICurrentExecutionContext`, replacing the per-module
  `AppointmentScope` / `CatalogScope` helpers over time.

### 2.5 Applying the scope

Explicit, not a global query filter:

```csharp
var level = await scopeSource.GetLevelAsync(actor.UserId, actor.TenantId, policy.Resource, ct);
IQueryable<Student> query = db.Students.ApplyRecordScope(policy, level, actor);
```

Why not a fourth named query filter: levels differ per resource and per request, internal
operations (posting, aggregation, integrity checks, background jobs) must see all company
rows, and an invisible global filter makes those failures silent. Tenant and company filters
stay global as today.

Rules every scoped resource follows:

1. **Lists, searches, counts:** query through `ApplyRecordScope`.
2. **Read by id:** load through the scoped query; a row outside scope returns **not found**
   (no existence leak — School analysis IDOR policy).
3. **Update, delete, lifecycle actions:** load the target through the scoped query before
   mutating; creation validates that referenced parents are inside the actor's scope.
4. **Exports, reports, dashboards, imports:** use the same predicate as the list.
5. **Realtime:** notifications for scoped resources carry the resource name and id only; the
   client refetches through the scoped API. No row payload is broadcast to a group.
6. **Background jobs and integrations** run with an explicit system actor at `Company` level
   and are audited as such.

### 2.6 Enforcement

- Architecture test: every query/command handler that reads a type implementing
  `IRecordScoped` must call `ApplyRecordScope` or be annotated `[CompanyScopeIntended]` with a
  reason.
- Contract tests per resource: for each supported level, out-of-scope id → 404, list excludes
  out-of-scope rows, export count equals list count.
- Multi-role test: the widest level wins.
- Change test: narrowing a role takes effect on the next request after cache invalidation.

## 3. Reference implementation (first consumer)

Recommended order:

1. **CRM appointments, `Own` + `Company`.** `AppointmentScope` already carries the user id, so
   moving it onto the shared mechanism proves storage, resolution, caching, and tests with no
   change in what users see.
2. **HR employees, `Team`.** Needs the reporting-line closure table from §2.4; confirm in HR
   source which field holds the manager before planning (not verified in this review).
3. **Education, `Assigned`.** First relationship-based consumer, inside the `education-module`
   plan.

## 4. Client impact

- Web and mobile need no new pattern: the API returns only visible rows.
- Role Permissions (P-006) gains the level selector on web and mobile.
- Empty states must not imply "no data exists" when scope hides rows; copy uses "No records
  visible to you".

## 5. Open decisions

| ID | Question | Recommendation |
| --- | --- | --- |
| DEC-019 | Multi-role combination: widest level (union) or narrowest? | Widest, matching permissions |
| DEC-020 | Is `Team` derived from HR reporting lines only, or also from configurable groups? | HR reporting lines first; groups later |

## 6. Exit checks for S7

- Design approved at G2 (this document + DEC-019/020).
- Feature contract for the reference resource registered under the plan.
- Platform: `RoleResourceScope` storage, migration, `IRecordScopeSource`, cache invalidation.
- BuildingBlocks: contracts, `ApplyRecordScope`, architecture test.
- Reference resource implemented with all §2.6 tests on API; P-006 level selector on web and
  mobile.
- `PERMISSION_MODEL.md` updated with record scope; the `erp-business-planning` skill
  references it.
