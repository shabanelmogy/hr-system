# Local SQL database prepared — 2026-11-03

Requester supplied the SQL Server endpoint and credentials and explicitly requested
a local database while testing ready-made RPTs. This is environment setup within
active GCT-1, not a new business feature or a resumption of DEF-028/DEF-027.

## Verified result

- Server: SHABANELMOGY\SQL2017, SQL Server2017 version14.0.1000.169.
- Database: ERPSYSTEM_Local, created because it did not already exist.
- Applied31 existing migrations using api/scripts/Apply-ErpModuleMigrations.ps1,
  with a process-only custom connection variable and all9 registered module owners.
- Verified138 tables including9 module migration-history tables. No existing
  database was replaced and no production data was copied or seeded.
- Verified ref.vw_Countries40columns, ref.vw_States40columns and
  ref.vw_Districts56columns. All3 are schema-bound and cover every root-table column.
- Countries, States and Districts currently contain0rows. Schema readiness is not
  a populated sample dataset or evidence of successful report rendering.
- Credentials are kept only in an ignored local task profile used for setup;
  no password or connection string is in canonical documentation/portable receipts.
  The existing single-appsettings/application/publication policy is preserved;
  the new database does not automatically switch the hosted API connection.
- No API/Angular server was started and no remote application was deployed.

## Connect the designer

Use the supplied SQL Server login against the server/database above. Add a Command
with the exact approved Countries transport fields, for example:

```sql
SELECT CountryId, CountryAr, CountryEn, StateId, StateAr, StateEn
FROM ref.vw_Countries;
```

The View has additional physical/navigation columns for preparation, but the current
managed RPT contract still uses these6 fields. Create the report field layout in Crystal Designer. Language is optional in the
RPT; the render request still selects ar/en. Save the RPT; design connections and saved data do not prevent upload. A completely empty RPT does not gain a table or layout simply
by selecting it for upload. The ERP API is the runtime data supplier; the Command's
design connection is ignored by the complete-ignore revision.

## Evidence and limits

Portable receipts: owning feature verification/local-sql-database/ includes schema,
View coverage, migration counts and the repository migration log; no credentials.
The existing current ERP/native verification is in verification/connection-ignore/.
Its first full run encountered an unrelated bounded message-history SQL write
TaskCanceledException; an unchanged full rerun passed1248tests/3existing opt-in
browser skips. No message-history timeout/test was weakened or unrelated code changed.

The current source has no connection metadata/password admission checks; it still
needs a designed table/fields and compatible managed parameters. Latest complete-ignore
source still needs requester publication. FOLLOW-024/PROD-028 retain actual PDF,
filtered/empty dataset and no-design-database-call acceptance. Phase06 Not Verified;
DEF-028 empty-template library and DEF-027 View Builder stay Deferred.
