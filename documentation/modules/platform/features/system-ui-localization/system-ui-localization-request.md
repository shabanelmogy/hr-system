# Authorized implementation request

Plan super-admin-administration; exact authorized slice S2 Authorized global UI texts; Feature ID system-ui-localization; owning module Platform. Change extends existing UI localization capability with a separate global scope. S1 is Closed.

Implement the approved v2.0 Screen/Workflow Contract in documentation/plans/business/super-admin-administration/decomposition/system-ui-localization.md and the four current applied books. Only en/ar registered keys for permitted SuperAdmin screens may be listed/edited/reset/applied at runtime. Company localization/defaults stay independent; no company IDs in global responses. Use exact global grants and target-screen authority on the server.

Shared component-first: adapt existing company editor with shared MyDataGrid toolbarFilters/MyForm and native AppListScreen/Table/Cards/AppForm. No local shells, native validation or raw JSON input. Typed adapters and clean ownership; serialized revisioned singleton, atomic audit, placeholder validation and real migration. Runtime baseline/layer isolation, permission-sensitive cache and auth-generation cleanup.

Required: view/edit/reset, search/source/language/status filters, server paging, conflict/dirty/error/empty/forbidden feedback, bilingual text and runtime propagation on both clients. Excluded: new languages, global default-language editing, key creation, import/export/tree/chart, offline writes and mock identity generation. Cache read only while online-authorized; do not persist or replay writes offline. No new local database or encrypted queue is needed. Physical native acceptance remains PROD-026.

Execute API -> Web -> Mobile -> integrated live verification -> documentation/education closure. Record focused/full gates and live schema, distinguish inherited FOLLOW-006 and RISK-009. No unresolved product or technical choice blocks this approved development scope.
