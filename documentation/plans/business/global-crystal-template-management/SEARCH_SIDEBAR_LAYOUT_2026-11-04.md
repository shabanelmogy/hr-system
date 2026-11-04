# Report search sidebar arrangement and button icons

Bounded corrective change under global-crystal-template-management/GCT-1, requested
2026-11-04. Preserve report query, entity authority, managed selection, draft state,
native iframe and document lifetime. No API/schema/localization contract changes.

## Current source and requested presentation

GlobalReportView currently places report selection after name filters, embeds an
additional card/header in standalone Search, and mixes source download with search
actions. Shared FormContainer sidebar footer reverses visual order with CSS while
keyboard DOM order remains Reset before Search. Reuse FormContainer, ReferenceField,
TextField, OptionSelect, ActionButton/AppIcon and PdfViewer actions. No new component.

- Same sidebar form in embedded and standalone view: optional entity, report
  selection, Arabic name, English name, Search then Reset. Keep common16px field
  spacing and full-width primary/secondary actions. Remove the redundant form header.
- Shared sidebar footer renders the existing submit template before secondary
  actions in DOM order; dialog/card/plain keep their existing action order.
- Move authorized source download to Options; preserve its permission/pending state
  and availability when preview generation fails. Shared document-actions region
  supplies generic consistent vertical spacing.
- Use existing icon projection for search/reset/refresh/language/source download;
  add reusable download/open-in-new/language SVG entries to AppIcon. Shared PdfViewer
  retains actual safe anchors with icons and visible text, no fake link buttons.
- Preserve summary/inline errors, focus, disabled/pending behavior, live RTL/theme,
  mounted form/iframe across tabs and original PDF bytes/new-tab behavior.

Screen pattern remains existing Countries P-001 embedded Report composition; C-01
shared sidebar form, C-02 existing report workspace. Angular Implemented; retained
Next runtime unchanged; mobile manager Excluded. Shared presentation ownership in
FormContainer/ReportWorkspace/PdfViewer, feature owns order and authorized actions.

## Verification and documentation

PrimeNG MCP unavailable in the session; use installed22.1.4 sources and official
Button documentation for icon/anchor behavior, Angular content-projection/template
documentation for single submit template. Angular22.2.3, no dependency changes.
Run format, full Angular check (including lint/architecture/types/tests/build),
existing production-fixture browser harness with arrangement/icon/bounds assertions
EN/AR, wide/compact, Chrome/Edge, embedded/standalone. No server startup or live writes.
Register section37 and actual verification files, regenerate/check packets and run
planning check. Full reporting acceptance stays FOLLOW-024/PROD-028 Open and
DEF-027/028 Deferred; unrelated API full-suite result remains section36.
