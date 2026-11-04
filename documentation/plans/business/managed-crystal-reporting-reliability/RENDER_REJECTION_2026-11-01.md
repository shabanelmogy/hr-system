# Hosted Countries render rejection — 2026-11-01

## Verified diagnosis

The caller's `CrystalReport.RenderUnsupported` does not prove that Countries lacks
a runtime profile. The canonical registry and deployed catalog both contain
`countries`. Authenticated downloads and entity-aware inspection of the exact
hosted files returned:

| File | Inspect status | Verified rejection |
| --- | ---: | --- |
| Countries.rpt | 400 | Crystal Report files containing database connection metadata are not accepted. |
| Countries.WithStates.rpt | 400 | The same datasource-policy rejection. |

The sanitized receipt is
[`runtime-correction-2026-11-01/hosted-template-rejections.json`](runtime-correction-2026-11-01/hosted-template-rejections.json).
No template, source path, database, or hosted configuration was changed by these
probes. A valid PDF was not produced. This is a later observation than the earlier
catalog/authentication failures; it does not rewrite their historical evidence.

The render service converted every managed-source rejection and every template
contract rejection into `UnsupportedCrystalReportProfileException`. The runtime
returned `crystal_runtime_unsupported_profile`; ERP correctly mapped that code to
the misleading public unsupported-entity message.

## Corrective behavior implemented

The runtime now preserves template schema/parameter failures and emits
`crystal_runtime_source_rejected` for rejected source metadata. ERP maps these to
localized `CrystalReport.SchemaMismatch`, `CrystalReport.ParameterMismatch`, and
`CrystalReport.SourceRejected`. Unknown entities still return
`CrystalReport.RenderUnsupported`. Raw runtime messages, credentials and local
paths are not passed into public ProblemDetails.

The existing source policy and exact canonical contract remain enforced. This
correction improves diagnosis; it does not make an incompatible or rejected RPT
renderable. We have not established whether the rejected connection fields are
database access settings or designer metadata of a pushed-data report. Native
metadata inspection could not run locally: both x86 and x64 initialization report
that the installed Crystal runtime is unavailable/incompatible. No security policy
was weakened to conceal that uncertainty.

## Concrete designer artifact and recovery

The schema exporter reads the one canonical contract rather than maintaining a
second manual list:

```powershell
./api/scripts/Export-ManagedCrystalReportSchema.ps1 `
  -EntityKey countries `
  -OutputPath '<existing-directory>/countries.xsd'
```

The output must not already exist. The generated
[`countries.xsd`](runtime-correction-2026-11-01/countries.xsd) contains table
`ReportData`, with these ordered fields:

| Field | Type | Nullable |
| --- | --- | --- |
| CountryId | Int32 | No |
| CountryAr | String | No |
| CountryEn | String | No |
| StateId | Int32 | Yes |
| StateAr | String | Yes |
| StateEn | String | Yes |

The report also requires the exact `Language` string parameter: required,
single-valued, discrete values `ar` and `en`, and no custom values.

In the Crystal designer, review Database → Set Datasource Location and confirm
whether the template uses the approved ADO.NET (XML) pushed-data source. Bind the
managed table to the canonical XSD if it currently uses another source. Remove
saved report data and database credentials, then inspect the corrected file again.
Any remaining provider/design-time metadata rejection must be examined with actual
native metadata before changing the policy. An XSD file is a designer schema, not
a replacement `.rpt` and not proof that the existing template has been corrected.

SAP documents that reports populated by `SetDataSource` must be designed against
the matching dataset schema:
[SAP KBA 1219251](https://userapps.support.sap.com/sap/support/knowledge/en/1219251).

## Publication and verification boundary

Publish both `CrystalReportGeneratorApi` and `ErpSystem.Api` through their existing
configured Visual Studio profiles to receive the new error classification. The
currently published runtime still has the preceding behavior until republished.
The matching private key/profile wiring is unchanged. No remote publication was
performed here.

The runtime contract harness now checks HTTP400 schema failure separately from
unsupported entity before entering the native engine. Reporting tests cover all
specific runtime codes and their public application errors. Native valid-template
render, actual AR/EN PDF and integrated hosted acceptance remain open under
`PROD-028`, `PROD-025` and `RISK-008`. Angular remains stopped by explicit request.

Current full ERP Release build has zero errors. The initial parallel test attempt
recorded nine SQL command timeouts and one Platform message-recording assertion;
its failure log is retained. A complete sequential run on the existing local SQL
instance passes1175 tests with zero failures and3 pre-existing browser-probe skips.
It includes all142 Reporting tests. The test concurrency settings follow
[xUnit's documented RunSettings](https://xunit.net/docs/config-runsettings), without
changing application code or test assertions to hide the earlier failures.

Angular full check passes formatting, lint, configuration/token/font/catalog checks,
26 architecture/dependency cases, strict types/templates,479 unit tests and the
495.64kB initial production build. No Angular server or new browser run was started.
Known bounded public template messages now appear in the existing shared error
state; arbitrary keys, HTML and oversized messages stay generic. The messages remain
owned and translated by the API; no generated locale file was edited manually.
