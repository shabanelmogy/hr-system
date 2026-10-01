# Managed Crystal Report Manager Experience — Next.js Profile

## 1. Scope

The existing Web manager is implemented against the verified API. The canonical
route and Reporting feature ownership remain unchanged.

## 2. Pattern and reuse

Use adapted P-001: shared `PageHeader`, `MyDataGrid`, feedback, confirmation and
form-dialog system. Preserve the feature-specific detail tabs and import workflow.

## 3. Transport types

Supported-entity metadata and the four validation states are typed. The service
strictly parses schema version/fingerprint and revalidation responses from `unknown`.

## 4. Service ownership

Only `crystal-report-manager/services.ts` calls `apiService`. It owns metadata and
revalidation methods/routes while preserving list/create/import/version/lifecycle APIs.

## 5. Query and refresh behavior

Supported entities load once per mounted manager session through the feature data layer.
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

Verified on 2026-09-29: 19/19 focused service, lifecycle, validation and version-list
tests passed; the complete Web suite passed 190/190 files and 666/666 tests. The
complete `npm run check` gate passed architecture, governance, release-contract,
i18n, lint and strict TypeScript, and the production build generated 77/77 pages,
including `/administration/crystal-reports`. The shared create form leaves its
primary action enabled for ordinary validation failures and focuses accessible
named fields; EN/AR resource parity is enforced. Authenticated live EN/AR and
RTL/LTR manager execution is tracked in the integrated stage. Real `.rpt`/PDF
positive acceptance remains Phase 4 under `RISK-008`. Bundle measurement records
the manager route at 2.31 MiB, below its 2.55 MiB business-route budget. The global
measurement gate remains red because unrelated shared protected-shell routes exceed
their 2.25 MiB class budget; this inherited integrated-worktree finding is owned by
`RISK-009` and is not presented as a feature pass.
