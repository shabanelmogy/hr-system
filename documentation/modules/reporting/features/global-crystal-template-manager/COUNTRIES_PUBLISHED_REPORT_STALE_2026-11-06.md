# Published Countries report omitted from consumer catalog

User symptom: Countries displays “No published Crystal Report is available for
Countries. Publish one in Report Manager and grant Run access.” The template had
already been published.

## Verified evidence

A read-only probe against the project's configured Reporting design-time database
found active global report `countries-tests`, published version3, with stored
validation status `Valid`. Its validation fingerprint begins `0fe8d65f18`, while
the current embedded artifact fingerprint begins `2e0dfd64ef`. They do not match.
The other Countries registration is archived and has no published version.
No template, validation record, publication, permission or business data was changed.

This is evidence from the configured database and working source, **not a live
authenticated response from the deployed API**. The user's browser session was
unavailable to the connected browser tool, so deployed identity/configuration
parity must not be inferred from this probe.

`GetGlobalCrystalReportsQueryHandler` returns only entries whose published version
passes `IsValidFor(contracts.Fingerprint)`. That method requires `Valid`, a positive
schema version and exact fingerprint equality. A previously published `Valid`
version can therefore be omitted after the contract artifact changes. Angular
parses the returned catalog; it does not independently hide a published item.

The registry fingerprints the full embedded contract artifact. The current
working artifact includes system-error-logs in addition to the five previous
entities. An unrelated artifact change can require revalidation of an unchanged
Countries RPT. The available evidence establishes the fingerprint mismatch; it
does not date every intervening contract revision.

## Correct recovery path

1. Open Global Report Manager, report `countries-tests`, Versions.
2. Revalidate version3 against the current contract. The handler reopens the
   verified stored RPT and asks the inspector; it never replaces the stored
   fingerprint without validating the actual file.
3. Successful revalidation updates the existing version. If it is already the
   published version, refresh the Countries Report view; a new version still
   needs its normal Publish action.
4. If revalidation returns `CrystalReport.ContractStale`, align/rebuild/deploy
   both the ERP API and independent CrystalReportGeneratorApi against the same
   embedded artifact, then revalidate. The generator project embeds the shared
   managed-crystal-report-contracts.v1.json; publishing an RPT alone does not
   update either application's embedded artifact.

The platform-reader catalog bypasses per-report Run grants only for the existing
super_admin + GlobalCrystalReports:View policy. Ordinary tenant consumers still
require their normal scope/permission and Run grant. Do not loosen either path
to make stale templates appear. Real hosted provider/RPT/PDF acceptance remains
under the existing PROD-031 release check.

Sources: Reporting QueryHandlers, GlobalCrystalReportVersion.IsValidFor,
ManagedCrystalReportContractRegistry.Load, RevalidateGlobalCrystalReportVersionCommandHandler,
and api/CrystalReportGeneratorApi/CrystalReportGeneratorApi.csproj embedded resource.
