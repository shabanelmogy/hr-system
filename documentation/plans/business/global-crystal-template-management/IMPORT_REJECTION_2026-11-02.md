# Existing-report registration rejection — verified preflight

Corrective change within GCT-1; no new screen, lifecycle, permission or schema.
Reporting owns global/tenant upload and imported-source orchestration; Crystal's
independent inspection service owns native validation. Existing storage, inspection
ports, error codes/localization, controllers and client error adapters are reused.

## 1. Verified behavior and defect

Authenticated read-only probes of the exact hosted Countries.rpt (8704bytes) and
Countries.WithStates.rpt (9728bytes) verify their OLE signatures and downloaded
SHA-256 against the deployment catalog. Both native inspections return HTTP400,
`crystal_runtime_invalid_report`, with the fixed source-policy reason that database
connection metadata is present. No report, grant, database or published source was
changed by inspection. The requester is unsure which designer datasource was used.

The inspector currently classifies managed datasource-policy rejection as invalid
file. The ERP adapter removes raw runtime details, and storage maps inspection
rejection to CrystalReport.InvalidFile. Thus the observed generic message does not
prove a corrupt RPT. The catalog's IsImportable currently proves catalog/file
eligibility, not successful native managed-template inspection.

## 2. Frozen corrective rules

Keep extension, size, OLE signature, upload inspection, mandatory native inspection,
current schema/fingerprint and immutable-source rules. A rejected source must not
create a report/version, publish, bypass its inspector or overwrite existing files.
Do not infer that the stored connection metadata is harmless: SAP documents both
XML/XSD design locations and persistent database connections. No policy relaxation
is justified without actual native provider/connection evidence.

Use existing `crystal_runtime_source_rejected` for inspection, consistently with
render. Extend internal inspection/storage failure enums additively and map this
condition to existing localized CrystalReport.SourceRejected. For the already
published runtime only, recognize its invalid-report code plus an exact allowlist
of existing fixed managed-source policy messages. Never forward arbitrary runtime
messages, connection strings, credentials or paths to a public error. Unknown or
malformed responses retain existing fail-closed/unavailable behavior.

No migration is needed because persistence/domain shape is unchanged. Angular,
Next and Mobile already consume the public SourceRejected error; their registered
adapters are checked for compatibility. New UI administration is not introduced.

## 3. Verification and impact

Required: inspector modern/legacy-code tests, arbitrary-detail non-disclosure,
storage mapping, global create/import no-side-effect regression, full ERP build
and tests, independent Crystal build/harness, canonical documentation generation.
The registration layout correction has separate final-build browser evidence in
REGISTRATION_LAYOUT_2026-11-02.md and is retained.

Real registration/PDF success remains unverified until a compatible source passes
native inspection. Existing FOLLOW-024 and PROD-028/PROD-025/RISK-008 own the native
acceptance and report-design recovery. Correcting the error cannot close those
checks. User publication via existing profiles remains required; no remote deploy.

## 4. Research

- [SAP datasource connectivity](https://help.sap.com/doc/1eb6ed2630b940d49d85e22ba94c35bc/4.3.2/en-US/Datasourceconnectivity.html)
- [SAP datasource connection properties](https://help.sap.com/doc/1d6ae14abd4a4796b450fe5a6839f025/4.3.2/en-US/Datasourceconnectionproperties.html)
- [SAP XML/XSD connection locations](https://help.sap.com/docs/SAP_CRYSTAL_REPORTS/dfc124becfa845ffa91b1e717b20e3ec/475a98396e041014910aba7db0e91070.html)

These sources establish that datasource metadata needs inspection; they do not
prove the provider or safety of these particular RPT files.

## 5. Completed native metadata inspection and correction

The installed Crystal10 RDC COM reader successfully read the downloaded originals
without refreshing data, logging on, saving or modifying files. Their SHA-256
values match the current hosted sources inspected above. Both contain a single
`Command` table using `crdb_ado.dll`, with OLE DB connection-property names, rather
than the approved ADO.NET/XML pushed-data driver. Countries.rpt exposes CountryId,
CountryAr and CountryEn only; Countries.WithStates.rpt also exposes StateId,
StateAr and StateEn. Neither contains a report parameter. The canonical contract
requires table ReportData, all six fields and the exact Language parameter.
Connection-property values, credentials and SQL text were not emitted.

ERP now classifies both the new source-rejected code and the exact legacy fixed
policy messages as SourceRejected. The private storage and global/tenant command
mapper retain that distinction; no rejected report/version/private file is created.
Unknown runtime details remain hidden. Crystal inspection now uses the same
source-rejected code as rendering. Both projects build; the full ERP suite passes
1223tests (188Reporting,70architecture), with3existing opt-in browser skips.
The independent Crystal contract/HTTP boundary harness passes.

No source policy, report layout or original RPT has been changed. Working copies
and the canonical countries.xsd were prepared in an ignored temporary directory.
The requester elected to install Crystal Reports2013 before continuing designer
work. Stop further designer/file conversion attempts until that installation is
finished. Native rebind/save/inspection/PDF acceptance remains FOLLOW-024.

## 6. Concrete designer recovery contract

Use the existing canonical countries.xsd under
documentation/plans/business/managed-crystal-reporting-reliability/runtime-correction-2026-11-01/.
On a separate report copy, replace the current Command datasource through the
designer's Database / Set Datasource Location with ADO.NET(XML) and ReportData from
that schema. Map existing fields to the canonical Country/State fields while
preserving the report layout. Ensure all six schema fields remain available even
when the design displays only countries. Add the required single-valued discrete
string parameter Language with ar/en values and no custom values; remove saved
data and database credentials. Submit the resulting file to native inspection
before import/publication. These are required recovery steps, not a claim that a
corrected RPT or valid PDF has already been produced.
