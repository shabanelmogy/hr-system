# Manager actions and saved report metadata

Bounded corrective presentation change under approved GCT-1, authorized 2026-11-04.
Screen reporting.global-crystal-template-manager.manager retains active collection,
dialog form and detail tabs patterns. No business lifecycle or API/schema change.

## Source review and approved scope

Next CrystalReportCreateDialog accepts entity, description (500), and RPT file.
Name and subject come from RPT Summary Information. CrystalReportDetailDialog shows
entity, key, description, versions and role rights Run/Download/Upload/Publish.
Angular already persists those supported fields; designer drafts also accept source,
SQL View, display name and report key. Do not invent editable author/keywords fields
or overwrite bilingual Summary Information with the description.

Move upload/register/designer/schema actions into existing MyDataGrid toolbarContent;
keep entity/status in toolbarFilters. Upload is primary, remaining actions secondary.
Use existing shared SVG icons for actions and form submission. Show saved description,
entity/key, status, update time and published/latest-version file and Summary data in
Overview through RecordSummary and SurfaceCard. Reuse SurfaceCard's footer template
for downloads. A generic opt-in details layout owns responsive spacing, not feature CSS.
Retain permissions, pending/dirty guards, version publication and source download.

## Verification

Requester follow-up authorizes Button Group composition. Add a shared adapter over
installed PrimeNG ButtonGroup (no existing shared group exists), reuse ActionButton
children, group create/upload/register and detail downloads. Preserve label/keyboard/
pending and permissions. Installed PrimeNG selectors target direct buttons or p-button;
add only the shared wrapper-edge adaptation with logical RTL borders and vertical
stacking at compact width. Official Button documentation's Button Group section and
installed22.1.4 source are the reference; PrimeNG MCP unavailable.

Run format, lint, architecture and full Angular check. Verify main toolbar actions,
filter-only controls, metadata display and upload description against synthetic API
fixtures on EN/AR desktop/compact viewports without starting an application server.
Finalize canonical books/manifests/recipes and documentation/planning gates.
Previous report search/sidebar changes remain part of this handoff. Production
embedded geography preview is gated by isDevMode; validate that journey using a
separate development build rather than changing production navigation.

Next runtime unchanged; mobile manager Excluded. No deployment or live report writes.
Overall Phase06 remains Not Verified; FOLLOW-024/PROD-028 Open and DEF-027/028 Deferred.
