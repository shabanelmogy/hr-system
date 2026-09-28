# Education Module — Decisions

Cross-plan integration choices are tracked as DEC-016 in
`documentation/plans/notes/DECISION_BACKLOG.md`.

| ID | Decision | Status | Selected direction | Reason | Affected surfaces |
| --- | --- | --- | --- | --- | --- |
| D-001 | Module, not product | Approved (owner, 2026-09-28) | Education is an ERP module (`api/Modules/Education`, web and mobile `modules/education`) on the ERP platform. | `erp-platform-template` D-001. | All |
| D-002 | School boundary | Proposed | Tenant = customer (school group); Company = school/campus. A one-school customer is one tenant + one company and logs in directly. | Fits ERP Tenant + Company isolation without a parallel tenant key (E-011, C-001). | API, Web, Mobile |
| D-003 | Port rules, not architecture | Approved | School business rules, invariants, and tests are ported; the School host, CQRS setup, identity, and tenancy are replaced by ERP equivalents. | ERP already provides them (E-005, E-006). | API |
| D-004 | Legacy defects are negative tests | Approved | Every defect in E-004 becomes an acceptance test that must fail on the defect. | School analysis §12. | API, Web, Mobile |
| D-005 | Record scope | Approved | Teacher, student, and guardian visibility uses the platform record-scope capability (`erp-platform-template` S7); no module-local scope framework. | One authorization model (E-008). | API |
| D-006 | No invented finance | Approved | No finance data or charts until fees are planned with Accounting. | E-013. | Web, Mobile |
