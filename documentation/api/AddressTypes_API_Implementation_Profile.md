# Address Types API Implementation Profile

## 1. Purpose

This profile defines the server authority for global Address Type reference data.

## 2. Domain and persistence

`AddressType` owns required Arabic/English names and a collection of Addresses.
The existing configuration keeps globally unique `NameAr` and `NameEn` indexes,
required maximum lengths, and the required Address foreign key. Archived values
remain reserved.

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
global independent name conflicts, save atomically, and schedule after commit.
Archive and bulk archive check active Address references under the Address Type
lifecycle lock. Restore is idempotent. Bulk create/archive bound size at 100 and
write all-or-nothing.

## 6. Authorization and scope

`TenantMember` is required even though Address Types are global. Controller
permissions are AddressTypes View/Create/Edit/Delete; storage never trusts a
client tenant/company identifier.

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

After a committed Add, Update, Archive, Restore, BulkAdd or BulkArchive,
schedule a notification/realtime job using resource `address-types`, action URL
`/basic-data/address-types`, and `AddressTypes:View` audience.

## 10. Tests

Prove query bounds/ordering/search, command validation/normalization/conflicts,
active-Address archive guard, restore/idempotency/bulk atomicity, post-commit
scheduling, controller routes/permissions, and report schema/filter behavior.

## 11. Deployment

Deploy HR API and Crystal runtime profile together. Report Manager then imports,
publishes, and grants role `Run` to the intended current-company users.

