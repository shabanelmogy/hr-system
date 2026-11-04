# Command design datasource with API-pushed runtime data — GCT-1

Historical scope: saved-data rejection and instructions to clear it are superseded
by CONTAINER_DATA_2026-11-03.md / current feature section26.

## Authorized revision / Phase00

Existing-feature change within active GCT-1, authorized2026-11-03. Requester keeps
the RPT Command and its View-based design connection. The ERP API reads scoped
data; the independent Crystal API receives that data and produces the PDF. No
XSD rebind/conversion is required solely because a design connection is present.
DEF-028 empty-template/base-layout work remains Deferred; DEF-027 Builder unchanged.

## Current evidence / relationship and impact review

CrystalReportManagedSourcePolicy currently rejects server/database/user/integrated
security and every driver except crdb_adoplus. Inspection and render both call it
before SetDataSource. The native field validator additionally requires ReportData
as the RPT table alias. ERP validates the inspection receipt and keeps rejected
uploads side-effect free. The user reports this Command-based push model worked
previously; positive current-file native execution is not yet observed.

Owner: existing Crystal runtime inspection/rendering; ERP owns scoped data contracts,
authorization, storage and fixed localized errors. Extend these existing paths;
no new module, endpoint, database pull mode, connection-string input or schema.
Angular/Next/Mobile administration/consumer payloads remain unchanged. Only public
error wording changes in ERP; no client UI or permission/migration change.

## Frozen rules / edge cases

- Do not validate the design server, database, user, integrated-security setting
  or driver against a runtime connection. Do not use them to connect or execute SQL.
- Permit a single named main-report table/Command, including a renamed alias.
  Preserve Command text, original file bytes and layout. Bind the received DataTable
  explicitly to that table; rename only the in-memory DataTable to its design alias.
- Keep the exact approved field count/order/types and Language parameter contract.
  A Command selecting different/wider fields still needs matching API contract fields.
- Saved report rows, subreports, additional tables, SQL-expression fields and actual
  embedded passwords remain unsupported. Design server/database/user metadata alone
  is not an embedded password. These checks keep all runtime data supplied explicitly.
- No Refresh, VerifyDatabase, SetDatabaseLogon, ApplyLogOnInfo or connection fallback.
  A binding/export failure returns the existing bounded error and never retries SQL.
- Inspection and rendering use the same policy. Only a passing inspection returns
  the existing saved-data/password-free receipt. Legacy fixed error compatibility
  remains intact. Update public EN/AR text so it does not mandate XSD conversion.
- File identity/size/OLE, immutable versions, publish/ACL/tenant/company policy and
  approved backend View fingerprint/provider remain Required and unchanged.

G0–G3 frozen for this bounded revision; requester authorization covers runtime work.
G4 real hosted/native acceptance remains FOLLOW-024/PROD-028. Phase06 Not Verified;
Phase07 not started. This supersedes earlier blanket design-connection rejection.

## Verification contract

Independent Crystal build and contract/HTTP harness; meaningful policy and renamed
Command alias cases, unchanged schema/parameter rejection. Full ERP Release checks
for public error/catalog compatibility. Native acceptance must export a PDF from a
Command RPT using known API-supplied rows while the design database is unavailable;
test filtered/empty data and confirm no saved or database rows appear. No positive
native result is inferred from pure metadata tests or a successful build.

Current local native baseline cannot construct ReportDocument (type initializer
exception); this is an environment blocker to record, not a reason to bypass tests
or claim a successful PDF. Original ready-made user RPT path has not been supplied.

## Primary platform evidence

- Microsoft SDK Table.SetDataSource accepts a supplied dataset for a report table:
  https://learn.microsoft.com/en-us/previous-versions/cc411386(v=vs.90)
- SAP represents SQL Commands as table objects in the designer:
  https://help.sap.com/docs/SAP_CRYSTAL_REPORTS%2C_DEVELOPER_VERSION_FOR_MICROSOFT_VISUAL_STUDIO/0d6684e153174710b8b2eb114bb7f843/45baf8716e041014910aba7db0e91070.html

These document the binding mechanism; actual native execution must still establish
compatibility of a specific RPT/runtime installation.


## Completed technical checks

Both independent Crystal projects build and the contract/HTTP harness passes,
including Command/renamed alias, missing/wrong/reordered fields, parameters and
source-policy cases. ERP Release restore/build passes and all1244 tests pass with
3 existing opt-in browser skips. No schema/client/runtime UI change or deployment.
Native PDF/no-database-call acceptance is still not verified; see the local native
initialization log and FOLLOW-024/PROD-028. Current portable receipt and source hashes:
documentation/modules/reporting/features/global-crystal-template-manager/verification/command-push-data/verification.json.
