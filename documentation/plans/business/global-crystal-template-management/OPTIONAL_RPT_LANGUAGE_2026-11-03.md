# Optional Language in an RPT — GCT-1 corrective revision

## Current issue and authorized correction

Requester reached parameter mismatch after correcting the Countries Command fields
and explicitly requested relief from repeated artificial upload conditions. Existing
GCT-1 correction: Language is an optional report binding, not a mandatory RPT field.
The ERP render request still selects ar/en. A report without that parameter simply
does not receive SetParameterValue. No designer edit is required to add Language.

The exact G:/Countries.tests.rpt,44544bytes, SHA256
e9505470cfeb41d6c1dc7f05eb04ad94870435a0387c6c8f1345d10829fa84d7,
passed native source/field validation and returned the previous exact parameter-set
failure on the deployed runtime. Original hash unchanged. The failure establishes
that the old required set did not match, not the exact list of actual parameters.

## Frozen bounded behavior / impact

- Zero RPT parameters passes for all5 approved entity profiles.
- If Language exists, accept its case-insensitive name, String/single discrete
  value shape and pass the requested language using its actual report name.
- Designer prompt-required/default-list/custom-value options do not determine
  compatibility because the runtime supplies the value explicitly.
- Unsupported parameter names, types, range/multiple-value shapes remain separate
  failures: the current render API does not supply arbitrary parameter inputs.
- Change only the independent Crystal validator, Language binder and harness.
  No ERP/Angular/Next/Mobile source, public transport, permission, persistence,
  canonical artifact bytes or fingerprint changes. Old compatible reports remain
  valid. No full ERP/client gate rerun is claimed for this independent-app change.
- Keep requester-approved container behavior: connection and saved data do not
  reject upload; explicit API table binding, including zero rows, remains intact.
- Existing designer package metadata describes the render-input ar/en contract.
  Further designer/library guidance is DEF-028; this does not resume its workflow.

G0–G3 ownership/scope frozen for existing GCT-1 maintenance. Native runtime owns
admission/binding; public ERP request-language validation is unchanged. FOLLOW-024/
PROD-028 retain real PDF/cache/empty-result proof. Phase06 remains Not Verified.

## Verification and handoff

Both Crystal projects build and the contract/HTTP harness passes. New cases cover
all5 profiles without Language, lowercase/optional-prompt/open-default Language and
retained rejection of unknown/multiple/numeric parameters. Existing schema and
source/HTTP boundaries continue to pass. No arbitrary suppression or fallback.

Publish CrystalReportGeneratorApi only for this revision, then reupload the same
RPT without adding a Language parameter. Actual native positive inspection/render
still needs the published new build; local native initialization remains blocked.
This work does not deploy, modify the RPT or claim a real PDF. DEF-028/DEF-027 and
RISK-019 remain as recorded. No new database work.

Primary research: SAP distinguishes default from current parameter values, and the
SDK sets values on existing named parameters. The implementation conditionally
calls the documented setter when the report defines Language; absence is a no-op.
https://help.sap.com/docs/SAP_CRYSTAL_REPORTS%2C_DEVELOPER_VERSION_FOR_MICROSOFT_VISUAL_STUDIO/0d6684e153174710b8b2eb114bb7f843/45b061276e041014910aba7db0e91070.html
https://learn.microsoft.com/en-us/previous-versions/ms226143(v=vs.90)
