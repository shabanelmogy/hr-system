# RPT as an API-data container — final requester clarification2026-11-03

## Authorized GCT-1 corrective scope

Requester explicitly requires uploading the RPT as supplied, regardless of its
design connection or saved data. This supersedes both earlier connection/password
and saved-row admission restrictions. There is no requirement to rebind to XSD,
clear saved data in Crystal Designer or edit design connections to upload.

Owner: existing Crystal native inspector/renderer and Reporting inspection adapter.
No new endpoint, schema, permission or client UI. DEF-028 empty-template library and
DEF-027 Builder remain Deferred. Current work remains the ready-made report journey.

## Frozen behavior and impact

- Neither service reads design connections/passwords or saved-data flags for
  admission. Obsolete private receipt properties hasSavedData/hasEmbeddedCredentials
  are omitted rather than asserted false; ERP ignores old receipts' optional flags.
- Keep an openable RPT, the existing naming/size/signature rules and compatible
  report structure/fields/parameters. One table/Command is bound to the supplied
  data; unsupported subreports/SQL-expression fields are separate structural limits.
- Load a temporary report instance, bind the received DataTable unconditionally
  (including zero rows), disable dummy-data/save-data/save-summary options on that
  in-memory instance, then export. No skip on empty results, native Refresh,
  credential setting, design-query fallback or export of an unbound report.
- SetDataSource is the data replacement mechanism. Save options alone are not
  claimed to purge native caches. Positive native tests must still prove supplied,
  empty and filtered data do not display cached records or query the design database.
- Do not save/edit the user's RPT. Private source/version storage keeps the original
  bytes, including any saved data. Existing source-download grants consequently
  govern access to the original file; record that distinction under RISK-019.
- Public EN/AR errors no longer claim connection/saved-data content is rejected.
  No Angular/Next/Mobile UI or payload change; prior consumer ownership stays intact.

G0–G3 scope/ownership frozen for this existing-feature correction; user explicitly
authorizes these removals. FOLLOW-024/PROD-028 retain native acceptance. Phase06
Not Verified; no original-RPT edit, remote deployment or positive PDF is claimed.

## Exact current file evidence

G:/Countries.tests.rpt,46592bytes, SHA256
af7246f6610b45dc279f831c5db2377f503cee5595af9ec270702cb3393de856,
is rejected by the currently published old build specifically for saved data.
The old build ID is9d3340c0-da53-48c3-aad1-5965106b6b1c; the earlier local
connection-ignore build was9e0bf30b-26d5-439b-bae0-931a3fab6bee. The new container
build must be published by the requester before that gate changes on Host.
The original file hash was unchanged by the native read-only inspection.

The new policy removes that rejection; it does not certify this report's later
structure/field/parameter checks without executing the new native build. The
local managed x86 probe did not complete and was terminated as a bounded diagnostic;
the earlier x64 constructor failed. This is a local environment blocker, not PDF proof.

## Verification

Both Crystal projects and their contract/HTTP harness must pass. ERP tests cover
missing/true/false obsolete saved-data and connection flags, retained schema evidence
and runtime rejections. Full Release restore/build/test and canonical documentation
checks are Required. No persistence shape changed; existing local ERPSYSTEM_Local
schema/View verification remains in LOCAL_SQL_DATABASE_2026-11-03.md.

The first parallel full run hit the unrelated bounded message-history Snapshot SQL
write timeout. Preserve that receipt. Run the complete suite with the documented
xUnit.ParallelizeTestCollections=false setting; do not modify tests or raise timeouts.
https://xunit.net/docs/config-runsettings

SDK basis: Table.SetDataSource passes supplied records to the report table;
ReportOptions exposes dummy/save-data options. These document the mechanism and
do not replace native cached-row/empty-result acceptance.
https://learn.microsoft.com/en-us/previous-versions/cc411386(v=vs.90)
https://learn.microsoft.com/en-us/previous-versions/ms226126(v=vs.90)

## Publication order

Requester publishes CrystalReportGeneratorApi and ErpSystem.Api using the existing
profiles, then reuploads the original report without clearing its saved data or
changing its connection. Confirm native field/parameter compatibility, publish and
exercise actual PDF output using known API-only records plus an empty dataset.
Any later native structure error is separate from the removed admission gates.


## Completed technical verification

Independent Crystal build/harness passes. Full ERP Release restore/build and1250
tests pass with3existing opt-in browser skips, Reporting213, Architecture70 and
Integration189. Full rerun used the official serial-collections switch after the
unrelated bounded MessageLog Snapshot timeout; tests/timeouts were not weakened.
Portable source hashes, first failure and final receipts: owning feature
verification/container-data/. No client UI change or suite rerun. Native cached/
empty PDF proof remains unverified and no remote deployment occurred.
