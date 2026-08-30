# Core HR Functional Data Domain Design Guide

**Status:** Frozen design baseline (before the first Core HR migration)  
**Date:** 2026-08-30  
**Scope:** Employee master data and functional/organizational employment data  
**Reference:** Odoo Employees/Recruitment concepts, adapted to this system's
tenant/company/branch model and CQRS architecture.

This document is the domain decision record for the next Core HR features. It is
the source of truth before adding employee, department, job, assignment, or
contract tables. The existing employee and organizational classes are draft
classes and are currently ignored by `ApplicationDbContext`; they may be
refactored to this design before the first migration.

## 1. Decisions that are now closed

1. **A tenant may own multiple companies.** Every functional HR record is
   tenant- and company-scoped. `TenantId` and `CompanyId` come from the trusted
   current actor/context; they are never accepted as authority from a client
   body or route.
2. **A person is not the same thing as an employment record.** A tenant-scoped
   `Person` owns human identity. A company-scoped `Employee` is that person's
   employment record in one legal company. The same person can therefore have a
   second employment record in another company in the same tenant without
   copying identity data. Cross-tenant links are forbidden.
3. **Branch is an organizational/location unit, not the employee's whole
   address model.** A branch can have addresses from the company's geographic
   scope. An assignment may additionally select a work address and a work
   arrangement (on-site, remote, or hybrid).
4. **Department is company-wide and may span branches.** `BranchId` must not be
   mandatory on a department. A position/assignment can carry the physical
   branch. This avoids forcing one department to be duplicated for every branch.
5. **Division is optional.** It is a configurable layer below Department, not a
   required level for every employee. A position may have no division.
6. **Job Title, Position, and Assignment have different meanings.**
   - `JobTitle` is the reusable role name (for example, Accountant).
   - `Position` is a budgeted organizational seat/pool for a company, with a
     department, optional division/branch, job title, level, and headcount.
   - `EmployeeAssignment` is the employee's effective-dated placement in a
     position and reporting line.
7. **Contracts are separate from assignments.** A contract records the legal
   employment period and contract type/status. Salary structures, payroll rules,
   benefits, and working schedules belong to the later Payroll/Time domains.
8. **Effective dates are first-class.** Assignments, contracts, status changes,
   and future work-location changes must preserve history instead of overwriting
   the past. The database and handlers both prevent overlapping active records.
9. **A user account is optional.** Creating an employee never requires creating
   an application login. `UserId` is a nullable link and is managed only through
   an authorized account-link workflow.
10. **No self-service employee registration is in the foundation.** HR or an
    authorized tenant/company administrator creates the person and employment
    record; Recruitment may later create it from a hired candidate.

## 2. What Odoo contributes, and what we intentionally adapt

Odoo's Employees app centralizes employee files, contracts, and departmental
hierarchies, and also provides onboarding, skills, certifications, equipment,
and offboarding modules. Its employee Work tab combines company, department, job
position, job title, manager, work address, and work location. Departments have a
manager, parent department, company, and color; job positions add department,
location, and planned headcount. Contracts carry the employment terms,
compensation, work schedule, and benefits.

Official references:

- [Odoo Employees](https://www.odoo.com/documentation/19.0/applications/hr/employees.html)
- [Odoo New employees](https://www.odoo.com/documentation/19.0/applications/hr/employees/new_employee.html)
- [Odoo Departments](https://www.odoo.com/documentation/19.0/applications/hr/employees/departments.html)
- [Odoo Job positions](https://www.odoo.com/documentation/19.0/applications/hr/recruitment/new_job.html)
- [Odoo Contracts](https://www.odoo.com/documentation/19.0/applications/hr/payroll/contracts.html)

We keep the useful concepts but do not copy Odoo's flat employee form into one
large aggregate. This system additionally requires:

| Odoo concept | Frozen design here |
|---|---|
| Employee record | `Person` + company-scoped `Employee` |
| Company/department/job fields on employee | Current `EmployeeAssignment` snapshot and history |
| Job position | `Position` as a company-scoped, headcount-controlled seat |
| Manager | Effective `ReportsToEmployeeId` on assignment; department manager is a separate convenience role |
| Work location | Branch + optional company address + `WorkArrangement`; never infer location from nationality or registration country |
| Contract | Separate effective-dated `EmployeeContract`; payroll fields are a later bounded context |
| Odoo multi-company behavior | Explicit tenant/company foreign keys and server-side scope checks on every use case |

## 3. Frozen aggregate and entity map

### 3.1 Tenant-scoped identity

`Person` is the private identity root for a tenant:

```text
Person
  Id / PublicId
  TenantId
  FirstName / MiddleName? / LastName
  PreferredName?
  DateOfBirth?
  NationalityCountryId?  -> global Countries catalog
  PersonalEmail? / PersonalPhone?
  IsActive / audit / RowVersion
```

The global Country catalog remains platform-owned. Nationality is not filtered by
the company's operating countries. Sensitive identity fields must be returned
only by the detail contract and only to permissions that need them.

### 3.2 Company-scoped employment master

`Employee` represents a person's employment record in one legal company:

```text
Employee
  Id / PublicId
  TenantId / CompanyId
  PersonId  -> Person in the same TenantId
  EmployeeNumber (unique per TenantId + CompanyId, case-insensitive)
  CandidateId?  -> hired Recruitment candidate in the same scope
  UserId?      -> optional application account link
  HireDate
  Status: Draft | Active | Suspended | Terminated
  StatusEffectiveOn? / StatusReason? / TerminationDate?
  audit / RowVersion
```

Names are read from `Person`; list responses may project a display name for
search and rendering but must not duplicate mutable identity as a second source
of truth. A rehire after termination creates a new company employment record
linked to the same person; the old record remains a truthful historical record.

### 3.3 Organization foundation

All records below are `CompanyAuditableEntity` and therefore carry
`TenantId + CompanyId`:

| Entity | Required relationship | Frozen rules |
|---|---|---|
| `Department` | Company; optional `ParentDepartmentId`; optional manager | No mandatory Branch; parent cannot cross company or form a cycle; code is unique per company; active/archive lifecycle |
| `Division` | Department | Optional layer; parent department must match; code unique per company |
| `JobTitle` | Company | Reusable bilingual title and code; no employee assignment directly to a title |
| `JobLevel` | Company | Level code/order and management metadata; salary bands are Payroll/Compensation data, not a reason to block the organization foundation |
| `Position` | Company + `Department` + `JobTitle`; optional `Division`, `Branch`, `JobLevel` | Target headcount is non-negative; active assignment count cannot exceed it unless an explicit override permission is used |
| `JobDescription` | Company + `JobTitle` | Versioned draft/approved/expired content; approved versions are immutable; future job openings may reference an approved version |

`Position.DepartmentId` is authoritative. If a position has a division, that
division must belong to the same department. Assignment handlers re-check the
same compatibility instead of trusting a client-supplied combination.

### 3.4 Effective employment placement

`EmployeeAssignment` is the effective-dated organizational placement:

```text
EmployeeAssignment
  EmployeeId
  PositionId
  DepartmentId              (must match Position)
  DivisionId?               (must match Position when present)
  BranchId?                 (same company; active for the period)
  ReportsToEmployeeId?      (same company; not self; no reporting cycle)
  WorkAddressId?            (same company; compatible with branch)
  WorkArrangement: OnSite | Remote | Hybrid
  EffectiveFrom
  EffectiveTo?
  IsPrimary
  audit / RowVersion
```

Rules:

- At most one primary assignment for an employee at any date.
- Periods for the same employee cannot overlap when they are both primary.
- `ReportsToEmployeeId` is the employee's authoritative direct manager for that
  period. Department/branch manager fields are organizational role metadata and
  must not silently overwrite the reporting line.
- A remote assignment may omit Branch/WorkAddress; on-site requires a valid
  company location; hybrid may define both.
- Company Geographic Scope validates the Country -> State -> District hierarchy
  for work addresses. Nationality still uses global Countries.

### 3.5 Contract

`EmployeeContract` is an effective-dated legal employment agreement:

```text
EmployeeContract
  EmployeeId
  ContractNumber (unique per company)
  ContractType: Permanent | FixedTerm | Temporary | Internship | ...
  EmploymentType: FullTime | PartTime | Temporary | Contractor | Internship | ...
  StartDate / EndDate?
  ProbationEndDate?
  NoticePeriodDays?
  Status: Draft | Active | Expired | Terminated
  StatusEffectiveOn? / StatusReason?
  audit / RowVersion
```

The contract does not yet own salary rules, payroll structures, allowances,
deductions, bank accounts, or working schedules. Those are added by Payroll and
Time/Attendance contracts after this foundation is stable. At most one active
contract may cover an employee on a given date. An employee may exist in Draft
or Active HR state before payroll is enabled, but payroll processing must require
an eligible active contract.

### 3.6 History and supporting records

The current status fields are convenient projections. Every status transition
must also append an immutable `EmployeeStatusChange` record containing previous
status, next status, effective date, reason, actor, and correlation/audit data.
Assignment and contract rows already preserve their own periods; do not rewrite
them in place when the business meaning is a transfer or renewal.

The following records are designed but **Deferred** until their owning bounded
contexts are implemented: employee documents, emergency contacts, addresses,
skills, certifications, education, onboarding/offboarding plans, equipment,
benefits, leave, attendance, payroll, and recruitment portal data.

## 4. Scope and authorization matrix

| Data | Scope | Typical owner | Key rule |
|---|---|---|---|
| Countries / States / Districts | Global platform reference | Super Admin | Never copy per company; nationality reads active global countries |
| Company / Branch / company addresses | Tenant + Company | Tenant Admin / authorized company admin | Branch location must be in the company's geographic scope |
| Department / Division / JobTitle / JobLevel / Position / JobDescription | Tenant + Company | Company HR/tenant admin | Branch is optional on org definitions unless the model explicitly needs it |
| Person | Tenant | Tenant HR | Same tenant can reuse identity across company employments; no cross-tenant link |
| Employee / Assignment / Contract / Status history | Tenant + Company | Company HR | Company/branch IDs are validated from current context, never trusted from body |
| Application User link | Tenant | Security administrator | Optional; linking does not create or grant permissions automatically |
| Payroll/private financial data | Tenant + Company | Payroll | Separate permissions, detail contracts, audit, and localization rules |

Branch selection does not need to be present in the JWT. The current company is
resolved by the trusted context, and a selected `BranchId` is authorized against
that company on every command and query. Future branch permissions can narrow the
same server-side checks without changing the domain identity model.

## 5. Invariants that must be enforced twice

FluentValidation checks request shape; handlers/domain methods enforce the same
business rules again for race safety. EF indexes and filtered indexes provide a
third line of defense where the database can express the invariant.

1. Employee number, contract number, and organization codes are normalized and
   unique within tenant/company scope.
2. All foreign keys in one command share the same tenant/company scope.
3. Department parent, division parent, position organization, branch, work
   address, manager, and candidate references cannot cross company scope.
4. Department parent and employee reporting relationships cannot contain cycles.
5. A position cannot silently exceed target headcount.
6. Primary assignments cannot overlap; an assignment cannot end before it starts.
7. Active contracts cannot overlap; an end date cannot precede a start date.
8. Status transitions are explicit and effective-dated. Termination requires a
   reason and cannot be earlier than hire/assignment/contract rules chosen by HR.
9. Archived/deactivated organization nodes cannot receive new assignments;
   existing historical rows remain readable.
10. Updates include `RowVersion`/concurrency handling. A stale edit returns a
    stable conflict instead of overwriting a newer HR decision.
11. Hard deletion of employees, assignments, contracts, or status history is not
    part of the core lifecycle. Use archive/terminate/end-period operations.
12. Post-commit audit, notification, and realtime invalidation are scheduled only
    after the transaction commits.

## 6. CQRS/API shape to implement

Use one vertical slice per aggregate and keep controllers thin. Do not revive a
large `EmployeeService` or expose EF entities.

### Organization endpoints (first)

```text
GET/POST/PATCH  /api/v1/departments
GET/POST/PATCH  /api/v1/divisions
GET/POST/PATCH  /api/v1/job-titles
GET/POST/PATCH  /api/v1/job-levels
GET/POST/PATCH  /api/v1/positions
GET/POST/PATCH  /api/v1/job-descriptions
```

Each list is server-paged and exposes only approved search/filter/sort keys.
Archive/restore is explicit; do not use a generic toggle-delete endpoint.

### Employee endpoints (after organization)

```text
GET/POST/PATCH  /api/v1/employees
GET             /api/v1/employees/{id}
POST            /api/v1/employees/{id}/activate
POST            /api/v1/employees/{id}/suspend
POST            /api/v1/employees/{id}/terminate
GET/POST/PATCH  /api/v1/employees/{id}/assignments
GET/POST/PATCH  /api/v1/employees/{id}/contracts
GET             /api/v1/employees/{id}/status-history
```

Create, update, lifecycle, assignment, and contract operations are separate
commands. List responses contain display fields and the current assignment
summary; detail responses may include the effective history allowed by the
caller. Do not accept `TenantId`, `CompanyId`, or an unrestricted sort column in
the public request.

Recommended employee list criteria:

```text
search, status, departmentId, divisionId, branchId, positionId, jobLevelId,
managerId, contractStatus, contractType, hireDateFrom, hireDateTo,
sortBy (allow-list), sortDirection, pageNumber, pageSize
```

All requests use `Result`/stable error codes, `RowVersion` for updates, Mapster
for DTO projection where appropriate, and narrow Application-owned read/write
ports. Mapster should generate the routine mappings; hand-written mapping is
reserved for scope normalization, computed display values, and security
redaction.

## 7. Client and view decisions

The web and mobile employee baseline is:

- server-managed Grid/Table and Card views over one list/query state;
- page size 5 for table and 3 for cards, unless a feature's approved contract
  says otherwise;
- controlled search, filter, sort, and pagination through the existing shared
  components;
- edit/view forms use shared form primitives and Zod, with field errors under
  inputs and no native browser dialogs;
- active row/card, explicit checkbox selection, and edit flash use the shared
  `AppDataTable`/`AppDataCard` contracts;
- every mutation is permission- and read-only-guarded in the UI and handler;
- Grid/Card, Report, Chart, Import, and Export are decided per feature and per
  platform. Do not add a tab merely because another feature has one;
- employee financial/private fields are detail-only and never included in a
  broad list or chart response.

Import, onboarding, documents, skills, and payroll views are Deferred for the
foundation. When one becomes Required, freeze its exact envelope, limits,
duplicate/relationship rules, permissions, and retry behavior before building UI.

## 8. Implementation order

1. Refactor the current draft classes to this model and remove their explicit
   `ApplicationDbContext.Ignore(...)` entries only when each slice is ready.
2. Implement Organization: Department -> Division -> JobTitle/JobLevel ->
   Position -> JobDescription, including indexes and hierarchy tests.
3. Implement Person and company-scoped Employee master with list/detail,
   permissions, audit, concurrency, and status-history append behavior.
4. Implement effective-dated Assignment and reporting-line rules, including
   Position headcount and Branch/Address compatibility.
5. Implement Contract lifecycle with contract/employee date overlap tests.
6. Integrate Recruitment's hired-candidate link without making Employee depend on
   the Recruitment UI or its private services.
7. Add Web and Mobile vertical slices from the existing Countries reference and
   this frozen contract.
8. Add Payroll, Time/Attendance, Leave, documents, skills, onboarding, and
   offboarding only as separate bounded contexts with their own contracts.

## 9. Definition of done for the foundation

- The scope matrix and ownership rules are enforced in handlers and persistence.
- Department/Division hierarchy, Position headcount, assignment periods, manager
  cycles, contract periods, and employee status transitions have focused tests.
- Cross-company and cross-tenant IDs are rejected with stable errors.
- Employee list/detail contracts redact private data appropriately and use
  server-side paging/filtering/sorting.
- Mapster configuration and any manual computed/redacted mapping are tested.
- Audit, RowVersion conflict, post-commit jobs, realtime invalidation, and
  localization are covered before the first client page is called complete.
- The first migration contains only the approved foundation tables and indexes;
  payroll/leave/attendance tables are not pulled into it speculatively.

## 10. Explicit non-goals for this first implementation

- Full payroll calculation or Egyptian tax/social-insurance rules.
- Recruitment pipeline, public Job Portal, candidate self-service, or offer
  signing.
- Time schedules, shifts, biometric attendance calculation, or leave balances.
- Skills/certifications/training/equipment/benefits/document management.
- Matrix-management or multiple concurrent primary managers. If that becomes a
  requirement, introduce an effective-dated `EmployeeReportingLine` relation
  instead of weakening the single-manager invariant.
- Global employee search across tenants or unrestricted cross-company data.

This keeps the first domain implementation small enough to deliver while
preventing the common Odoo-style “one employee form owns everything” coupling.
