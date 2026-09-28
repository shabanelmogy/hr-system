# Managed Crystal Report Manager Experience — Next.js Profile

## 1. Scope

Refactor the existing Web manager after API verification. The canonical route and
Reporting feature ownership remain unchanged.

## 2. Pattern and reuse

Use adapted P-001: shared `PageHeader`, `MyDataGrid`, feedback, confirmation and
form-dialog system. Preserve the feature-specific detail tabs and import workflow.

## 3. Transport types

Define supported-entity metadata and the four validation states. Parse schema
version/fingerprint and revalidation response strictly from `unknown`.

## 4. Service ownership

Only `crystal-report-manager/services.ts` calls `apiService`. Add metadata and
revalidation methods/routes; keep current list/create/import/version/lifecycle APIs.

## 5. Query and refresh behavior

Load supported entities once per manager session through the feature data layer.
Refresh detail and list after mutations. Retry explicit failures; 409 retains the
existing reload-and-warning behavior.

## 6. List workspace

Keep server search/status/entity filter and pagination. Entity filter is a select,
not free text. Add concise validation/lifecycle summary only where actionable.

## 7. Create workflow

Use `react-hook-form`, Zod, `MyForm`, shared fields/layout and one `.rpt` file
control. Save remains enabled; submission displays field errors and focuses the
first invalid field. Entity options come from the API.

## 8. Detail and revalidation

Show localized state, safe reason, contract schema/fingerprint and source identity.
Offer Revalidate only under Upload permission/ACL-capable workflow and non-archived
state. Upload corrected version remains the alternate recovery.

## 9. Import and lifecycle

Preserve deployment catalog identity/hash behavior, publication, grants, download
and archive. Improve eligibility/validation reason presentation without changing
wire semantics.

## 10. Permissions and read-only

Controls and direct callbacks use exact current permissions. App read-only blocks
create/import/upload/revalidate/publish/grants/archive; server remains authoritative.

## 11. Offline and mock data

Online authoritative only. No outbox or cached success. Typed fixtures are allowed
in tests but no runtime mock entity/validation source is authoritative.

## 12. i18n, RTL and accessibility

All text exists in EN/AR Reporting resources. Status uses text plus color. Shared
form errors, focus, dialog keyboard behavior and control labels are mandatory.

## 13. Responsive behavior

Toolbar and version actions stack on small widths, dialog content scrolls
internally and grid scroll remains inside its data panel. Avoid manual directional
CSS; inherit RTL from the theme.

## 14. Verification and status

Pending API verification. Then run focused service/component tests, type-check and
architecture check, plus manual EN/AR and RTL/LTR manager journeys. Real `.rpt`/PDF
positive acceptance remains Phase 4 under `RISK-008`.
