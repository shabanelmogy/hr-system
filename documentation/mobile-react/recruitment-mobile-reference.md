# Recruitment Mobile Reference

Status: reviewed implementation profile. Review date: 2026-09-08.

Recruitment lives under `src/modules/hr/recruitment`; API calls remain in `data/remote`, React Query mutations
remain in `queries`, and screens/components compose those contracts. Tenant/company identifiers and
job-offer organization placement are never supplied by the device.

Interview scheduling and job-offer creation use the shared `AppForm`, `AppFormSection`, field, and
date-time controls. The Save/Submit action remains enabled; salary, currency, start date, and
interview-time failures render beneath their fields and focus the first invalid field. Users can edit
both interview start/end times. The API resolves the lead interviewer from the authenticated employee
when it is omitted. Evaluation draft state is keyed by interview/template so ratings, recommendation,
and comments do not leak across candidates.

The mobile UI supports the creation, evaluation, viewing, list/status, and permission-gated actions
currently exposed by the internal recruitment API. Added visible copy is present in Arabic and English.
Verification for this review: the full Mobile gate passes TypeScript, architecture,
translation usage/parity, and all 49 suites / 154 tests. ESLint has no errors; the
11 remaining warnings are confined to pre-existing shared chart/tree files.
