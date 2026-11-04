# GCT-1 corrective slice: explicit publication in the report viewer

The user reported that the report selector includes unpublished reports. Source review verified that the platform-reader catalog synthesizes `IsPublished = true` for importable files in the Crystal deployment folder, and rendering accepts these unmanaged identities directly. Angular already consumes the public catalog with an explicitly published response contract.

## Authorized correction

- Reporting owns this existing GCT-1 read/render correction. G0–G3 decisions remain frozen for this bounded fix; it supersedes the earlier compatibility fallback for unmanaged deployment files.
- Every viewer, including Super Admin, receives only active managed reports with an explicitly published version whose validation evidence matches the current contract.
- Unknown/unmanaged identities cannot render through the consumption endpoint. Existing managed version tokens, entity scope, company grants, and source-download permissions remain enforced.
- A newer draft does not replace or hide an older published version. Management continues to list drafts and archived reports; deployment discovery and registration continue to expose existing files. Files must be registered and explicitly published before consumption.
- No automatic registration/publication, schema migration, client-control change, or native Crystal change is included. The API response shape stays stable.

## Verification and acceptance

Run focused tests for mixed/empty catalogs, unpublished/unmanaged denial before data/file/render access, valid and stale published tokens, view binding, company grants, and native error mapping. Extend isolated SQL Server persistence verification for draft, publication, replacement draft, and archival projection while preserving management visibility. Run the full ERP restore, Release build, serial test suite, and documentation checks.

FOLLOW-024 and PROD-028 remain Open for the broader acceptance matrix. The prior user-confirmed first report display remains historical evidence only. DEF-027 View Builder and DEF-028 empty-template library remain Deferred. Deployment and interactive host verification remain manual release checks; do not claim them from automated tests.


Requester subsequently confirmed: «تمام ظهر المنشور فقط». This records the
selector outcome as requester-confirmed; the environment was not independently
observed. Full ERP restore/Release build passed (repository analyzer warnings,
zero errors); 1251 tests passed, zero failed, three existing opt-in browser skips
across12 projects, including214Reporting/70Architecture/189Integration. SQL draft,
older-published/newer-draft and archive projections executed in isolated databases.

The language follow-up needs no runtime change: Angular already sends JSON
`language: "ar" | "en"` from LocalizationRuntime with each render request. ERP
forwards multipart `language`; Crystal assigns the optional RPT `Language`
parameter when present. This is parameter delivery, not automatic translation of
report text/data. Source tracing and current test evidence are in the receipt;
no new native parameter/PDF export is independently claimed.
