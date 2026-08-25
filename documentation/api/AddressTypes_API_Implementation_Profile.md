# Address Types API Implementation Profile

## 1. Purpose

This profile defines the server authority for company-scoped Address Type business data.

## 2. Domain and persistence

`AddressType` owns required Arabic/English names and a collection of Addresses.
The configuration keeps required maximum lengths, composite company-scoped unique
indexes for `NameAr` and `NameEn` (including archived rows), and a required
company-matching Address foreign key. `TenantId` and `CompanyId` are automatic
scope fields and are never accepted from client requests.

## 3. Contracts

Separate list, detail, relation, lookup, create/update, bulk create and bulk
archive contracts. List adds `AddressesCount`; mutable requests contain only
`nameAr` and `nameEn`; bulk envelope is `{addressTypes:[request]}`.

## 4. Query contract

Page input validates positive one-based page and 1-5000 size; status is
active/archived/all; text search uses the explicit two-field allow-list and six
operators; sort uses Name EN/AR or Created On with ID tie break. Lookup exposes
only active rows ordered Name EN then ID.

## 5. Command contract

Create/update normalize fields, validate allowed scripts and 2-100 length, check
independent name conflicts within the active company, save atomically, and
schedule after commit.
Archive and bulk archive check active Address references under the Address Type
lifecycle lock. Address create/update/restore takes the same lock and rechecks the
target Address Type inside the atomic operation. Restore is idempotent. Bulk
create/archive bound size at 100 and write all-or-nothing.

## 6. Authorization and scope

`TenantMember` and an active company context are required. Controller permissions
are AddressTypes View/Create/Edit/Delete; storage never trusts a client
tenant/company identifier. The active-company actor supplies scope for every
query and command.

## 7. Error behavior

Return Problem Details for validation, not found, use-by-Address, and duplicate
conflict. Close persistence races by translating unique-constraint failures to a
stable conflict rather than leaking database text.

## 8. Report data profile

`ICrystalReportDataSource` accepts only entity key `addresstypes`; only NameAr
and NameEn are approved filters. It queries active rows no-tracking in ID order,
counts active Addresses, and writes explicit-schema `ReportData` columns
`AddressTypeId:int`, `AddressTypeAr:string`, `AddressTypeEn:string`,
`AddressesCount:int`. The Crystal runtime profile declares exactly the same
columns.

## 9. Side effects

After a committed Add, Update, Archive, Restore, BulkAdd or BulkArchive, schedule a
notification/realtime job using resource `address-types`, action URL
`/basic-data/address-types`, and the active-company `AddressTypes:View` audience.
Report data and realtime delivery use the same active-company scope.

## 10. Tests

Prove query bounds/ordering/search, command validation/normalization/conflicts,
active-Address archive guard, restore/idempotency/bulk atomicity, post-commit
scheduling, controller routes/permissions, and report schema/filter behavior.

## 11. Deployment

Deploy HR API and Crystal runtime profile together. Drain old Address Type
Hangfire jobs, apply the global-to-company data migration (cloning existing rows
to every existing company), then import/publish reports and grant role `Run` to
intended current-company users. New companies start empty unless a future
template-copy policy is enabled. Users should re-login and switch company context.

A future unauthenticated Job Portal must derive tenant/company from an approved
published job or portal identity and apply that server scope before returning
Address Type lookups. It must not accept an arbitrary client-supplied company ID.

