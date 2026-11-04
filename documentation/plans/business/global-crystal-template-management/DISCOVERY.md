# Global Crystal Template Management — Discovery

The requester selected Angular, super_admin restricted to editable modules, and
upload/replace/inspect/download on2026-11-01. The final explicit storage decision is
immutable versions and publication like the existing managed-report workflow.
Direct modification of runtime Reports files and backup-only replacement are rejected.
Earlier PrimeNG/shared-first/external-resource/no-BFF/no-NgRx decisions persist.
Angular remains stopped until the requester asks to restart it.

| Discovery area | Decided requirement / applicability |
| --- | --- |
| 1 Outcome | Administer global reference-data templates through Angular. |
| 2 Current process | Global reports run deployment RPTs; existing managed versions are tenant-owned. |
| 3 Actors | super_admin, exact global report permissions and actual entity Edit authority; role alone grants no access. |
| 4 Ownership | Reporting owns template metadata/version lifecycle. Reference Data owns report business data. |
| 5 Lifecycle | Upload → native inspection → immutable valid version → explicit publish. New upload never silently changes the published version. |
| 6 Rules | Exact canonical schema/parameter/source policy; current fingerprint; invalid versions cannot publish/render. |
| 7 Money/capacity | Financial postings and stock N/A. Existing bounded storage/native runtime capacity apply. |
| 8 UI | Shared P-001 collection, form dialog and version detail; EN/AR/RTL; PrimeNG-backed controls. |
| 9 Integration | ERP mediates all native calls and owns version metadata/private source; internal key never reaches browser. |
| 10 Concurrency | SQL resource coordination, append-only version identities, RowVersion for publish;409requires refresh. |
| 11 Audit/privacy | Actor/time/machine/correlation; private immutable RPT source; no saved business data/credentials. |
| 12 Import/export | Native RPT upload/download, source import, XSD download and validation Required. Business data export Excluded. |
| 13 Release | Live schema/migration, tenant isolation, native fixtures and AR/EN browser journeys required before closure. |
| 14 Scope | Countries/States/Districts global. No HR/Accounting/company impersonation or Mobile administration. |

ASSUMPTION A1: entity Edit permissions express the requested module-edit boundary.
Owner ERP owner; prove exact authority/revocation with policy and UI tests. No wildcard
shortcut is accepted. The versioned/publication decision itself is confirmed, not an assumption.
