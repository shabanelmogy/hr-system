# Client boundary and owner integration map

The source identity is the current immutable AuthSession object; the criterion
key excludes visible page/page-size and selected rows but includes effective
filters/sort/archive scope. Captured locale and column labels are part of export
identity. A null/denied context removes the header menu and cancels work.

| Owner | Complete source | Query/projection owner | All-pages rule |
| --- | --- | --- | --- |
| Countries | CountryService.page | CountryReadState.query/countryColumns | Preserve all structured filters/status/order; pages up to existing5000limit |
| States | StateService.page | StateReadState.query/state presentation | Preserve Country parent and current criteria/order |
| Districts | DistrictService.page | DistrictReadState.query/district presentation | Preserve State parent/current criteria/order |
| Tenants | TenantManagementService.page | TenantReadState.query/tenant presentation | Existing200page-size cap; all matching known total |
| Tenant administrators | TenantAdminService.all | AdminReadState complete array/local criteria if any | Reuse complete collection; no repeated GET per visible card page |
| System Audit | SystemAuditService.page | AuditReadState captured audit criteria | Follow actual nextCursor; cycle/duplicate detection; no detail diagnostics |
| System Error Logs | SystemErrorLogService.list | ErrorLogReadState.criteria/error presentation | Existing100page-size cap and5000export cap; no diagnostics |
| Global template manager | GlobalTemplateService.list | GlobalTemplateState.spec/columns | Preserve allowed entity/search/status/structured column filters; known total |
| Global report viewer | Existing report catalog/sidebar | GlobalReportState | Not a tabular collection page: retain existing PDF/RPT export; generic metadata export not meaningful |

Shared header uses the same optional source input in all collection views. It
does not read a Grid instance or render different contracts for Cards. Source
columns exclude action/selection/internal fields; no raw object serialization.
No current-page or selected-only fallback is allowed. Count/cursor drift fails
visibly. Existing domain export grants apply alongside formatter authority.
