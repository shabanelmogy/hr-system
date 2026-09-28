# Managed Crystal Reporting Reliability — Decision Log

| ID | Decision | Alternatives considered | Reason | Status |
| --- | --- | --- | --- | --- |
| D-001 | Keep `CrystalReportGeneratorApi` as a database-isolated internal adapter. | Move Crystal SDK into the modular monolith; let runtime query ERP SQL. | Preserves business ownership and reduces duplicated authorization/data logic. | Approved target |
| D-002 | Reporting owns one versioned machine-readable entity contract registry. | Duplicate hard-coded profiles in each process; document-only schema. | Both processes and tests need the same exact source of truth. | Approved target |
| D-003 | Keep `fiscalyears` as a tenant/company managed-report entity. | Remove it; make it global. | The provider and user journeys are company accounting data, not global reference data. | Approved target |
| D-004 | Validate templates for a specific entity before `Valid`/publish. | Keep generic inspection and fail during render. | Publication must mean render compatibility, not just a readable `.rpt`. | Approved target |
| D-005 | Revalidate all existing versions in development. | Preserve old `Valid` flags indefinitely. | Existing flags were created without exact contract validation. | Assumption pending pre-migration confirmation |
| D-006 | Replace free-text entity creation with a server-backed supported-profile selector. | Keep regex-only input. | Prevents unsupported business configurations and spelling drift. | Approved target |
| D-007 | Keep manager administration Web-only; keep consumption on Web and Mobile. | Add native Mobile administration. | Mobile administration is not required for the business outcome. | Approved target |
| D-008 | Deliver security/dependency hardening last, while retaining it as a release gate. | Start with secrets/dependency upgrades; omit security from this plan. | Matches the requested development priority without weakening the final release gate. | Approved sequencing |
| D-009 | Do not add report dependence on a selected/current fiscal year. | Gate reports by fiscal-year context. | `fiscalyears` is an entity report profile; report availability is not an accounting-period state transition. | Approved target |
