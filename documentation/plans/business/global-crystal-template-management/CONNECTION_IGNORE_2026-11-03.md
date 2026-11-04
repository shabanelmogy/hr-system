# Ignore all design connection inspection — GCT-1 corrective revision

Historical scope: saved-data rejection and instructions to clear it are superseded
by CONTAINER_DATA_2026-11-03.md / current feature section26.

## Request and bounded preflight

Requester explicitly reiterated2026-11-03: ignore connection checks entirely; the
report is a container for data supplied by the ERP API. This supersedes the
embedded-password check retained in COMMAND_PUSH_DATA_2026-11-03.md. Active owner
remains GCT-1/Crystal inspection and render, with the existing ERP inspection
adapter. No new feature/module/endpoint, data pull mode or schema is introduced.
DEF-028 empty-template/base-layout work and DEF-027 Builder remain Deferred.

Frozen rules: never inspect LogOnInfo/ConnectionInfo, password, server, database,
user, driver or integrated-security settings during admission. Do not log or
return connection contents. The native inspection receipt omits the obsolete
hasEmbeddedCredentials property rather than asserting it is false. ERP ignores
that obsolete optional property in older receipts as well. Retain explicit
single-table pushed-data binding, exact managed fields/parameters, saved-row,
SQL-expression and subreport rules. Do not change files or execute design SQL.

Public EN/AR guidance describes connection metadata as ignored. No client UI or
consumer payload changes. No EF model/schema change or migration. Inspector
compatibility tests cover omitted/true/false legacy connection flags, no detail
leak and continued saved-row rejection. Both services require requester publication.

G0–G3 scope/ownership frozen for this existing-feature corrective revision. Native
positive render acceptance remains FOLLOW-024/PROD-028; Phase06 Not Verified.
This request does not authorize continuing empty-template preparation.

## Observed root causes for the uploaded file

1. Countries1.rpt fails the existing entity-prefix rule before native inspection:
   its derived key is countries1, not countries or countries-*. Countries.1.rpt
   derives countries-1 and passes that naming rule. No naming policy was relaxed.
2. Before the latest complete-connection-ignore change, authenticated health at
   crystalreport-generator.runasp.net returned200 and matched local build
   9d3340c0-da53-48c3-aad1-5965106b6b1c. The Command-support build is deployed;
   this is not a match claim for the later complete-ignore build.
3. Exact user file G:/Countries.1.rpt,5120bytes,
   SHA256 5bbc369aa1b83e08ebb8e161e50e49ab41c14bbb4c3d057f4da483945f014a4f,
   returns400 crystal_runtime_source_rejected with the fixed reason:
   one table/Command is required. A read-only Crystal10 RDC check reports0 tables,
   no fields and no parameters. Original hash is unchanged. There is no table to
   bind API rows to; ignoring connection settings cannot add a field definition/layout.
4. G:/Countries.test.rpt,44032bytes, SHA256
   98a06e844a1fcdc3d9118b6914fa7e80f196782d505dd75e790eef42faa4d744,
   is rejected by the deployed native service for saved data. Its original hash
   is unchanged. Crystal10 RDC also reports0tables, but current native inspection
   stops at saved data first; do not infer its later checks passed.
5. The reviewed Countries.WithStates.rpt Command fixture reaches native parameter
   mismatch on the deployed service. Its source policy and six-field validation
   pass; it lacks the required Language parameter. This proves neither a PDF nor
   the validity of either user file.

No user report was edited, refreshed, saved, published or created in ERP by these
probes. Inspection uses the service's existing temporary upload workspace only.
No passwords or connection values appear in portable diagnostic evidence.

## Verification and next exact action

Build both Crystal projects and run their contract/HTTP harness. Run full ERP
Release restore/build/tests and documentation/planning checks. Keep actual reports
unchanged. Publish the latest Crystal and ERP projects through existing profiles.
The user must supply a designed report containing a table/Command and report fields;
for Countries.test remove File / Save Data with Report and save a separate copy.
Reinspection must then check actual field/parameter compatibility. Positive native
PDF, empty/filter isolation and no design database calls remain FOLLOW-024/PROD-028.

Primary research retained from the preceding revision: the SDK's table-specific
SetDataSource mechanism and SAP's ReportDocument.Load guidance explain binding
and native inspection; they do not identify a file's failure without inspecting it.
https://learn.microsoft.com/en-us/previous-versions/cc411386(v=vs.90)
https://help.sap.com/docs/SAP_CRYSTAL_REPORTS%2C_DEVELOPER_VERSION_FOR_MICROSOFT_VISUAL_STUDIO/0d6684e153174710b8b2eb114bb7f843/45b0db796e041014910aba7db0e91070.html


## Completed technical verification

Independent Crystal projects and contract/HTTP harness pass. ERP Release restore,
build and1248tests pass (Reporting211, Architecture70, Integration189), with3
existing opt-in browser skips. Local analyzer warnings remain; no Angular/Next/
Mobile runtime changed or suite rerun. Portable evidence and source hashes are in
the owning feature verification/connection-ignore/. Actual native PDF/no-design-SQL
proof remains unverified; the latest code was not remotely deployed by this work.
