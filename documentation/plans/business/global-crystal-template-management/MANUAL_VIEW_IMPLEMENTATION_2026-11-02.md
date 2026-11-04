# Manual global View binding — implementation evidence

## 1. Delivered behavior

GCT-1 remains one active feature. Angular offers **New empty template**, alongside
the existing file-first and deployment-registration paths. The form selects the
server-provided module and approved field structure, accepts a two-part SQL View
name manually, then saves name/key/description as an unpublished metadata draft.
The approved structure is explicit because the existing native renderer accepts
reviewed contracts, not arbitrary columns. Current structures are Countries,
States and Districts in ReferenceData. Future Builder integration is DEF-027.

The form shows ordered fields/types/nullability and managed parameters. Its ZIP
download contains the canonical XSD, source.json and bilingual designer preparation
instructions. A blank application draft has no RPT binary or fake validation result.
Create a Blank Report in Crystal Designer, select the XSD through ADO.NET (XML),
add the exact Language parameter, design/save the RPT and upload it as version 1.
Existing inspection, source rejection, immutable versions, ACL and explicit publish
remain authoritative. Company consumers never see the empty draft.

## 2. API and ownership

Additive routes under `/api/v1/global-crystal-reports/manage`:

| Route | Authority | Result |
| --- | --- | --- |
| GET design-sources | super_admin + Global View + source Edit | Filtered module/source/field/parameter metadata |
| GET designer-package?sourceKey=... | Above + Global Download | ZIP with schema, source contract and preparation instructions |
| POST drafts | Above + Global Create | Draft after schema/fingerprint, View, identity and name validation |

Reporting owns orchestration, durable binding and rendering. ReferenceData owns
SQL access through `IReferenceDataPublicViewSource`; no foreign DbContext/table
access is introduced into Reporting. The old development-only raw ViewStore is
not used as report authorization. The frontend sends no SQL or connection string.
Connections come from the owning module's existing server configuration.

The ReferenceData adapter accepts bounded ASCII schema.View identifiers, checks
`sys.views`, visible schema-bound definition, and `sys.sql_expression_dependencies`.
Only direct approved global ref.Countries/States/Districts tables are allowed;
Countries/States sources cannot reference Districts. Tenant tables, other modules,
UDFs, synonyms, nested Views, unresolved/cross-database sources and tables supplied
as Views are rejected. Columns must exactly match the selected approved contract
in name, order, portable type and nullability. Filters are mapped by the owner and
parameterized. Reads are ordered, capped at maxRows+1 and use a 15-second timeout;
the existing XML byte limit is checked before calling Crystal.

The schema/definition fingerprint is captured without executing the View at draft
creation, stored immutably, and compared before rendering buffered rows. Definition
changes during execution are checked again. A changed/missing/unavailable View
fails with localized CrystalReport.InvalidView; it never falls back to the old
provider or deployment bytes. To use a changed definition, create a new explicitly
bound template; rebinding existing history is outside this slice.

## 3. Schema and migration

`20261102120604_BindGlobalCrystalReportViews` adds nullable ViewName and ViewFingerprint
to rpt.GlobalCrystalReports and a paired-binding constraint. Existing templates
retain null bindings and their existing providers. Source binding changes after
creation are rejected by Reporting persistence; marking a whole root Modified for
optimistic concurrency is allowed when binding values themselves are unchanged.

The repository migration script generated only the changed Reporting migration
and applied it to the configured Development database. Read-only live inspection
verified the history row, both columns and constraint without writing business
rows. Model drift check passed for all nine module contexts.

## 4. SQL prerequisite example

This is an internal setup example, not automatic application DDL. Use a new name
or deliberately review an existing definition before executing CREATE OR ALTER.
The View must exist in the ReferenceData connection's database. The service account
needs SELECT on the View and sufficient metadata visibility to inspect its definition
and dependencies; inability to inspect fails closed.

```sql
CREATE OR ALTER VIEW dbo.vw_CrystalCountries
WITH SCHEMABINDING
AS
SELECT c.Id AS CountryId,
       c.NameAr AS CountryAr,
       c.NameEn AS CountryEn,
       s.Id AS StateId,
       s.NameAr AS StateAr,
       s.NameEn AS StateEn
FROM ref.Countries AS c
LEFT JOIN ref.States AS s
  ON s.CountryId = c.Id AND s.IsDeleted = 0
WHERE c.IsDeleted = 0;
```

Official references: [Microsoft CREATE VIEW / SCHEMABINDING](https://learn.microsoft.com/en-us/sql/t-sql/statements/create-view-transact-sql)
and [SQL expression dependencies](https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-sql-expression-dependencies-transact-sql).
Designer preparation follows [SAP Blank Report](https://help.sap.com/docs/SAP_CRYSTAL_REPORTS%2C_DEVELOPER_VERSION_FOR_MICROSOFT_VISUAL_STUDIO/0d6684e153174710b8b2eb114bb7f843/45baabe16e041014910aba7db0e91070.html)
and [XML / XSD selection](https://help.sap.com/docs/SAP_CRYSTAL_REPORTS/dfc124becfa845ffa91b1e717b20e3ec/475a98396e041014910aba7db0e91070.html).

## 5. Angular composition and browser verification

GlobalTemplateDesignState owns the new typed Reactive Form, scoped source read,
requests, cancellation and unsaved draft registration. GlobalTemplateDesigner owns
presentation only and has an external HTML resource and component folder. Existing
shared DialogPanel/FormContainer/ReferenceField/TextField/SurfaceCard/MyDataGrid/
RecordSummary/FeedbackState/close guard are reused. No native controls or local
Grid/form shell were introduced. New server field errors focus the owning shared
field. Module changes clear the source; identity changes cancel requests and clear
the draft. Invalid Save stays enabled and reveals actionable field errors.

Browser inspection found a nested sticky Grid header painting over the persistent
Save footer. The generic dialog form content now establishes a stacking context
using isolation:isolate, keeping all consumers' nested headers below their action
footer. Built-in PrimeNG table behavior was reviewed; no PrimeNG MCP is available,
so no MCP validation is claimed. [CSS isolation reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/isolation).

The production build is loaded through Playwright request routing, without starting
or restarting Angular. All browser API data is explicitly mocked. Eight cases cover
EN/AR, RTL/LTR, light/dark and 1213/390px, shared missing-field focus, manual View
entry, fields/Language display, package download, server error then correction,
draft navigation, no document overflow and hit testing the unobscured sticky Save.
Existing registration dialog smoke also passes with translated stable selectors.

## 6. Verification and limits

Full ERP Release restore/build/test: **1239 passed, 0 failed, 3 existing opt-in
browser skips**, 12 projects; Reporting 203, Architecture 70, Integration 188 passed.
The actual SQL test covers canonical View inspection, filtered execution, injection,
wrong shape, unbound and tenant-table Views, persisted binding/zero versions,
immutable binding and definition change. Draft tests cover role/action/source
permissions, stale contract/module mismatch, duplicate key, no version until first
upload, and version 1 without auto-publication. ZIP metadata/schema match is tested.

Full Angular check: **504 tests / 90 files**, 26 architecture cases, format, typed
lint, strict types/templates, resources, tokens/fonts and production build. Five new
form tests cover validation/focus, manual request contract, source reset, server
field error and actor cancellation. Browser fixtures are separate from native/host
acceptance. The final current receipt and artifacts live in the owning feature's
verification/manual-view-workflow directory.

Next/Mobile administration stays Excluded. Their existing consumer DTOs are
unchanged; the new optional management-detail fields do not alter list/render/source
envelopes. Existing tenant/company filters, grants and source hash/token semantics
remain tested by the full ERP suite. No arbitrary JSON input or new structured
business collection was introduced on those clients.

No remote application publication, production View creation, original RPT edit or
positive native PDF acceptance occurred. FOLLOW-024 and PROD-028 remain open;
Phase06 remains Not Verified and Phase07 is not started. User publishes the ERP API
with the existing profile and deploys the Angular build; Crystal runtime code did
not change in this revision. Existing incompatible RPTs still need Designer correction.
