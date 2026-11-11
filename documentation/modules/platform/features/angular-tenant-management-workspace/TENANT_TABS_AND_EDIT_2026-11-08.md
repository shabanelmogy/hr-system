# Tenant management tabs and full-page editing — 2026-11-08

## Approved organization

The final requested organization keeps Tenant Management as a direct list page,
with no additional outer tabs. The separate administrator sidebar destination is
omitted. Administrators is managed in a tab within Add/Edit Tenant; Edit shares
Add's full-page composition. This is an existing-feature client restructure;
it does not add a business command, change permissions or modify database schema.
Tenant Management is a direct primary entry beneath Basic Data; the redundant
Tenant Administration grouping is removed. Existing role checks remain intact.

The existing owning components/services retain their data, commands and policies.
`/super-admin/tenants` remains the list. The existing global administrator route
`/super-admin/tenant-admins` stays compatible for direct links and account-wide
operations, without a separate sidebar destination. The temporary
`/super-admin/tenants/administrators` URL redirects to that existing route.
The list does not mount the global administrator workspace or load its data.

## Full-page Add and Edit

The thin TenantEditorPage is routed at `/super-admin/tenants/new` and
`/super-admin/tenants/:id/edit`, both using the existing writable-super-admin
guard and shared unsaved-navigation guard. Grid/Cards Edit navigates to the route
instead of opening a dialog. The obsolete dialog and create-only page are removed.

TenantEditorWorkspace owns one shared composition for both modes: card title,
back arrow, details form, profile/subscription/application/administrator tabs, summary,
feedback/retry and save behavior. TenantEditorState still owns fresh detail
loading, Signal Forms validation, API field errors, rowVersion, conflict/reload,
uncertain mutation state, pending writes and actor invalidation. Changing the
route identity recreates the editor workspace; it cannot reuse a preceding
tenant's loaded record or draft. After confirmed creation, the workspace replaces
the Add URL with `/super-admin/tenants/:id/edit?tab=administrators`, using the
server-returned identity and opening the existing scoped Administrators tab.
Reloading this URL retains that tab. A successful edit still returns to the list,
refreshes through the normal routed read, shows the existing notice, and supplies
the edited row identity for shared row feedback when it is on the loaded page.

The editor has one tab strip inside the Tenant details card: Tenant Profile,
subscription, applications and Tenant Administrators. Profile contains identity,
billing/contact and Notes in one grid without internal sections. Contact and
Notes no longer have separate tabs. All fields retain their same model/validation
and register with the identity section for validation focus. Notes spans the
entire Profile content row through the shared field-layout `field-span-full`
class. The login switch has an above-control label aligned with Billing email;
its old helper description is omitted.
Shared multiline TextField places its clear button and character count in a
stable-height tools row below the writing area, inside the outline. Logical
alignment follows RTL/LTR; the textarea keeps its full width. Single-line fields
retain their existing tool placement. Clear restores focus to the textarea.
No extra outer tab strip is retained in Add/Edit. Shared ContentTabs uses bounded
fill mode; the original fields remain mounted when the administrator tab opens.
The administrator workspace is mounted only after its tab is first opened.
Its existing editor dialog renders through shared DialogPanel appended to body,
so its HTML form is outside the Tenant form. The Tenant submit/footer is hidden
on the administrator tab; independent commands retain their own form owner.

Tenant overview stretches to the Tenant details card's full height at desktop
widths, with shared scrolling inside its summary content. The compact summary
popover retains natural sizing. Filled tab content has 12px shared internal
padding (8px in narrow panels); compact/none options are explicit shared inputs.
The redundant Tenant details card header/subtitle and page subtitle are omitted.
The page keeps one Add/Edit title and back arrow; the card begins at its tabs.
Shared collection headers align Add/Export heights with the view chooser through
one control-size variable (36px regular, compact/fluid sizes and 32px short
landscape; 44px on coarse pointers). Tenant Management uses the shared default.
The final requested Profile layout places identity, billing and contact fields
together in one shared field grid, without internal sections/headings. The
existing field-layout group mixin owns its two-column/compact single-column
arrangement. The separate contact-fields component and temporary section chrome
are removed. All seven Profile fields, including Notes, keep their shared
controls and existing validation rules.

For a saved tenant, the existing administrator workspace receives its tenant ID:
only matching memberships are displayed/counted/exported, the redundant tenant
directory is hidden, and Add Administrator starts with that known tenant selected
as its default membership. Account edits remain account-wide, including existing
multi-tenant membership editing; Delete retains the existing account-wide archive
meaning and confirmation. This change does not invent a per-membership delete.
All administrator commands retain their own validation, unsaved and pending state.

For an unsaved new tenant there is no server identity to bind administrators to.
Its administrator tab explains in EN/AR that the tenant must be saved first and
links back to its details. It does not create an administrator or fabricate a
tenant identity. After the first confirmed save, the working scoped administrator
tab opens automatically; Add Administrator starts with this Tenant selected.
Failed or uncertain creation retains the form and does not navigate.

The November 9 follow-up is recorded in
[create-to-administrators acceptance](TENANT_CREATE_ADMINISTRATORS_2026-11-09.md).

## Shared contracts and acceptance

The 844x390 regression exercises validation-summary links and tab navigation.
Shared filled forms with independent panel viewports preserve 180px of content
in short landscape, scroll only the bounded form and keep the footer sticky;
validation feedback cannot collapse or cover the tabs. No feature CSS workaround.

ContentTabs adds opt-in `fill` layout through PrimeNG Pass Through root styles;
the active panel owns a bounded content area. Default tabs keep their existing
DOM layout. Existing keepAlive and external-commit semantics are preserved.
PageHeader inline actions, full-width directory search and CardList compact
single-column acceptance are retained in the earlier
[administrator receipt](../angular-tenant-admins-workspace/TENANT_ADMIN_COMPACT_HEADER_2026-11-08.md).

Current [execution receipts](verification/tenant-layout-2026-11-08) record:

- Full Angular check passes formatting, typed lint, 4 configuration tests,
  33 architecture/dependency tests, strict types, 1006 tests in 196 files and
  production build. No size budget or test timeout was raised.
- Full API restore/build/test passes 1342 tests across 12 projects, with 3 existing
  optional browser/environment skips. The first isolated output location outside
  api caused source-root discovery failures; the corrected ignored location below
  api passes without changing tests or runtime API logic.
- Twenty Tenant workflows cover EN/AR, Light/Dark at 320x720,390x844,900x640,
  1440x1050 and844x390: create/edit, direct links, validation/error focus,
  full-width Notes and below-textarea clear/counter, overview height, scoped
  administrators, dialog form isolation, dirty cancellation and rowVersion.
- Twenty-eight negative Tenant cases cover authorization, catalog/detail errors,
  retries, incompatible entitlements, backend fields, duplicates, seats,
  conflicts, uncertain writes and pending state. Twenty compact administrator
  cases plus one complete account workflow preserve its existing behavior.
- Countries/States/Districts each pass 128 shared search/header layouts: Add and
  Export heights match view controls in EN/AR, Light/Dark, narrow/short/wide
  windows and open/closed desktop navigation. Each includes 64 Grid checks that
  keep Reset and Grid Options visible when filters collapse. All three start
  collapsed and use the shared Reset icon/compact button in Grid and Cards.
  States and Districts workflow smoke tests also exercise Reset with Grid
  criteria closed and independent Report visibility. Countries' existing
  dev-only route uses a real development build.

The first parallel Angular run observed the existing 5000ms Countries remount
timeout. The standalone full gate above passed with the same test timeout.
Bundle/style warnings and intermittent test reliability remain FOLLOW-019/031.
No hosted writes, real production database, native/mobile or Next workflow
acceptance is claimed. API and mobile profiles explicitly retain their contracts;
the localization generators consume the canonical EN/AR resource additions.

Primary references: [Angular routed outlets](https://angular.dev/guide/routing/show-routes-with-outlets),
[Angular guards](https://angular.dev/guide/routing/route-guards),
[PrimeNG Tabs](https://primeng.dev/tabs),
[Angular style scoping](https://angular.dev/guide/components/styling).
