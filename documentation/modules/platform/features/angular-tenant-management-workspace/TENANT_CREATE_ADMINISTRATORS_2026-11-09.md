# Open Administrators after Tenant creation — 2026-11-09

## Requested behavior and implementation

After a confirmed successful create, Angular opens the saved Tenant at
`/super-admin/tenants/:id/edit?tab=administrators`. The identity comes from the
successful API response. `replaceUrl` replaces the completed Add entry so browser
history does not reopen the submitted creation form. Refresh retains the selected
tab. Other query values retain the default Profile tab.

The existing TenantForm and scoped TenantAdminsPage remain the single owners of
the form and administrator workflow. Add Administrator preselects the saved
Tenant. The parent Tenant submit/footer remains hidden on Administrators, and
the administrator dialog retains its independent form. Successful updates still
return to the list with existing edited-row feedback. Failed, pending or
uncertain creation does not trigger the success route.

This is an Angular-only client change. API contracts, permissions, database
schema, Next.js and native/mobile workflows retain their existing behavior.
Independent Super Admin system sessions remain separately tracked by FOLLOW-032.

## Executed verification

- Focused Tenant tests: 40 tests across 8 files pass, including distinct create
  and update navigation expectations.
- Production build passes; existing bundle/style budget warnings remain.
- Existing Tenant browser harness passes 20 workflows: EN/AR, Light/Dark, widths
  320/390/900/1440 and short landscape 844. It checks the create route, selected
  tab, scoped administrator list, absence of intervening list reads, preselected
  Add Administrator dialog, reload persistence and retained edit/validation/dirty
  behavior. The harness uses synthetic API responses and creates no hosted data.
- Portable browser receipt: `verification/create-administrators-2026-11-09/results.json`.
- Full `npm run check` passes: formatting, typed lint, configuration, tokens,
  fonts, localization catalog, architecture/dependency checks, strict types,
  1015 tests across 196 files and production build. Initial bundle 585.59kB and
  existing PageHeader/CollectionFrame/search style warnings remain FOLLOW-019;
  budgets and timeouts are unchanged.
- Planning passes with the existing education-module/erp-platform-template
  contract warnings. Scoped Tenant documentation generation/check passes all
  eight registered recipes using the canonical generator and an isolated
  manifest. The generator logic, templates and canonical registry are unchanged.
- Logs are in `verification/create-administrators-2026-11-09/`; historical
  November 6/8 verification is not current evidence.

The complete documentation generator currently stops on a pre-existing missing
Reporting verification artifact:
`documentation/modules/reporting/features/managed-crystal-contract-registry/verification/entity-fingerprint/logs/fingerprint-angular-check.log`.
This does not establish a Tenant runtime failure or a full documentation pass.
The recovery gate is tracked centrally as FOLLOW-033.
