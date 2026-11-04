# Global Crystal Template Management — Research

- SAP dataset/XSD binding: https://userapps.support.sap.com/sap/support/knowledge/en/1219251
- Current source: CrystalReport and CrystalReportVersion derive TenantAuditableEntity;
  ReportingDbContext rejects missing tenant scope for those objects. Global templates
  require explicit owned persistence, not removal of this guard.
- Current source: PrivateCrystalReportFileStorage uses private GUID sources and verified
  reads; version commands use SQL resource locking and unit-of-work compensation.
- Angular installed versions are22.2.3 and PrimeNG22.1.4. No PrimeNG MCP tool is
  available in this session; this is a metadata limitation, not validation evidence.
- The implemented shared FileField uses installed-version FileUpload metadata and official documentation; full Angular checks pass and physical browser behavior remains Required live acceptance.

## Applied runtime evidence2026-11-01

PrimeNG FileUpload official docs https://primeng.dev/fileupload and installed22.1.4 types were checked. FileField uses customUpload with no automatic HTTP and the shared CVA/form contract. Official Angular skill was read and repository Reactive Forms/external resources/shared policies retained. No PrimeNG MCP tool existed. Full Angular verification passes; real browser/file-picker layout remains pending. EF explicit state semantics https://learn.microsoft.com/en-us/ef/core/change-tracking/explicit-tracking guided explicit Added tracking for client-generated version GUIDs. Actual SQL test verifies publication rowversion and ownership.
