# Database View selection — GCT-1 bounded revision

## Authorized change / Phase 00

Requester replaced manual SQL View typing with selecting Views read from the
database, until the future Builder exists. Extend the existing Reporting GCT-1
workflow; no new module, lifecycle, grant, SQL editor or View creation is authorized.
Current InvalidView response is HTTP400 after authentication; the earlier reported
401 is a separate request and is not assumed fixed or caused by View validation.

VERIFIED CURRENT: ReferenceData owns IReferenceDataPublicViewSource and its SQL
metadata/dependency policy; Reporting owns source contract matching and immutable
binding. Angular uses shared ReferenceField backed by PrimeNG Select. No generic
database-View catalog is currently connected to the draft form.

## Frozen contract / relationship review

- Reporting owns the permission-filtered endpoint and contract compatibility.
  ReferenceData owns sys.views/sys.schemas/dependency metadata through Contracts.
  Never query foreign DbContexts or expose raw View definitions, table data or
  connection strings from the list endpoint.
- GET manage/database-views accepts the selected source key, bounded search/page.
  Require super_admin + Global View + Global Create + the source entity Edit.
  Source catalog resolves module ownership; client module strings grant no access.
- List only Views directly dependent on the allowed global ReferenceData tables,
  retaining the existing source-specific dependency boundary. No cross-database,
  tenant/company, UDF, synonym or unrelated module source discovery. Show a
  non-schema-bound or shape-mismatched eligible View as disabled with a reason.
  Valid items must pass the exact existing inspection policy. Listing never reads
  result rows and does not approve or mutate a View.
- Stable schema/name ordering; server-side search/paging (max50 per page), row
  count and bounded database timeout. An unavailable catalog is an error, not an
  empty list. Empty, error, forbidden and loading are explicit shared states.
- Angular replaces manual View text with the existing shared searchable paged
  ReferenceField. Source/module changes clear selection and cancel old reads;
  identity changes cancel data. Refresh rechecks metadata. Invalid/disappeared View
  remains rejected on Save through the existing authoritative reinspection.
- Existing drafts/detail/version publication and nullable SQL binding schema stay
  unchanged. No EF migration. Next/Mobile administration remains Excluded and
  consumer contracts stay unchanged. Builder remains DEF-027.
- Screen: reporting.global-templates.manager; existing P-001/C-01 form/dialog.
  Create selects View, edits keep existing binding fixed, detail shows ViewName,
  listing keeps draft/source state, mock fixtures contain compatible/disabled and
  empty/unavailable data. EN/AR, RTL and keyboard selection are Required.

G0–G3 pass for this bounded revision; user authorization covers implementation.
G4 remains release-only FOLLOW-024/PROD-028 for real hosted/native acceptance.
Current scope is execution-ready; Phase06 Not Verified and Phase07 not started.

## Verification contract

API → Angular → consumer audit → integrated checks → evidence synchronization.
Test permission denial before metadata calls, discovery dependency filters, exact
shape compatibility, incompatible disabled reasons, search/page/empty/unavailable,
read-only behavior and absence of SQL/credentials. SQL tests use isolated databases;
read configured database metadata without changing Views. Angular tests cover
selection, paging/search/reset, refresh, stale response cancellation and invalid
selection. Run full ERP/Angular gates and production/existing-dev browser checks.
No shared control extension is needed; no PrimeNG MCP is available in this session.
Native RPT policy and schema-bound requirement are not relaxed to hide failures.


## Superseding prepared Views decision

Requester explicitly authorized one View per entity, selecting all root-table fields,
then authorized LEFT JOIN using the reviewed navigation relationships. Prepare
ref.vw_Countries (Countries→States), ref.vw_States (States→Country), and
ref.vw_Districts (Districts→State→Country). Explicitly enumerate root columns,
prefix navigation columns, and retain canonical aliases. Country/States collection
join intentionally repeats countries by state; do not add unrelated collections.
ReferenceData owns the migration/DDL. Existing name collisions fail instead of
overwriting user Views. Apply via repository migrations and inspect live metadata.

SQL Views may be wider than the managed report contract; the Backend projects only
required canonical fields in exact order before native rendering. Extra SQL fields
are metadata/preparation, not automatically exposed in the RPT/XSD. Unsupported
extra transport types (e.g. rowversion/binary) never enter Crystal datasets.
Canonical field type/nullability and all RPT native validation remain unchanged.

District AddressesCount is company-scoped. The global View must not join tenant
Addresses. When absent from the View, the source owner computes that approved field
using the existing ReferenceData tenant/company query filters and selected district
IDs. SQL discovery/inspection remains metadata-only and never reads company rows;
counts are populated only at authorized report execution. Test separate company
counts and that the three prepared Views cover all root-table columns.

G0–G3 frozen for this extension of active GCT-1. Prior no-migration statement applies
to discovery alone; prepared Views require a ReferenceData migration and actual
configured database verification. Native/host release acceptance remains FOLLOW-024.
