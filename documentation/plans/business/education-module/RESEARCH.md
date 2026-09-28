# Education Module — Research

| Topic | Finding | Source | Status |
| --- | --- | --- | --- |
| Source business analysis | Capabilities, actors, invariants, defects, conversion order. | School `PROJECT_ANALYSIS.md` | Imported into EVIDENCE |
| Source user stories | ACCESS, ACADEMIC, PEOPLE, SCHED, ASSESS, ATTEND, COMM, REPORT story groups. | School `api/docs/USER_STORIES.md` | To convert into feature contracts per slice |
| Source business test flow | End-to-end business test flow of the converted API. | School `api/docs/BUSINESS_TEST_FLOW.md` | Reuse as acceptance scenarios |
| Data migration preflight | PostgreSQL blocker report, runbook, reconciliation script (School = tenant model). | School `api/docs/data-migration/` | Needs re-mapping to Tenant + Company if Q-005 = migrate |
| ERP optional-dependency pattern | Accounting ↔ Contacts through a local projection and Inbox/Outbox. | `accounting-core-gl` evidence | Model for HR/Contacts links |
