# Global administration access — customer guide

From Administration, a Super Admin with the corresponding grant can open Audit Trail, System Health, Background Jobs, API Endpoints, Error Logs and Settings. Each tool has independent authority. API documentation availability follows the host environment.

Audit Trail uses the shared Grid search, filters, page controls and detail viewer. Its cursor-based API does not supply an exact total; the footer says Unknown and still permits forward/back navigation. Company users keep their separate scoped audit viewer.

Missing permissions hide the entry and deny direct access. Global authority does not grant company users/roles/language customization. Sign out/in to obtain newly registered global grants. No data creation/editing or mock audit generation is part of this read-only slice.

Development acceptance Verified: API 1078 tests and 12 live checks, Web 35 focused tests plus browser cursor/navigation, native 30 tests and Android export. Physical device acceptance remains PROD-026; inherited mobile lint FOLLOW-006 and Web budget RISK-009 remain tracked release constraints.
