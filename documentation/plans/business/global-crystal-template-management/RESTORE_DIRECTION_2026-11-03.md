# Restore Crystal report direction — implementation plan

> Execute inline using the existing GCT-1 corrective workflow, TDD and verification-before-completion. This continues the requester's current working files; preserve existing uncommitted changes and publish profiles. No branch, commit, merge or deployment is part of this correction.

**Goal:** Restore the historical API-owned direction behavior requested after the source/history review, while preserving Summary Info bilingual names.

**Architecture:** Extend the current independent Crystal renderer, not the retired controllers/helpers. Apply one shared direction stage to the temporary ReportDocument after binding API rows and before PDF export. Keep a small SDK-independent geometry policy executable in the existing contract harness; the SAP adapter owns native object traversal and mutation.

**Tech stack:** Existing .NET Framework4.8 Crystal13.0.4000 SDK and contract harness. No dependency or application/client upgrade.

## Frozen restoration design

- Historical evidence: `37b91c6c^` contains `CrystalReportDirection.AdjustReportDirection`, called by `CrystalReportRenderer.RenderLoadedReport`. Commit37b91c6c deleted it.
- `ar` preserves design coordinates. `en` mirrors fields, texts, pictures and charts using printable page width in SDK twips. Both languages retain the old centered field/text alignment.
- Preserve historical line handling: mirror horizontal lines, suppress vertical lines for English, preserve diagonal lines. Mirror other drawing bounds from their original endpoints. This is compatibility restoration, not a redesign of line behavior.
- Capture original bounds before changing native coordinates. Do not save the RPT, mutate stored sources, reconnect to a database, inject formulas or make Language mandatory in the RPT. Current connection/saved-data admission policy is untouched.
- SummaryInfo.ReportTitle remains the Arabic selector name and ReportSubject the English name. Current inspection persists both and Angular already selects the appropriate value with displayName fallback. No Angular runtime change is needed; run existing report tests for evidence.
- No route/DTO, permission, publication, storage, schema or database migration change. Reporting owns the integration; Crystal owns layout mutation. DEF-027/028 remain Deferred; FOLLOW-024/PROD-028 retain native/hosted visual acceptance.

## Approaches and decision

The user selected restoring the previous API behavior. Designer-only per-field formulas would not restore the historical automatic element mirroring. Reintroducing retired controllers/formula-saving helpers would broaden the change and reintroduce obsolete runtime paths. Reuse the current renderer with a focused shared direction adapter.

## Implementation and verification ledger

- [x] Add a failing runtime contract regression proving the direction stage is wired before export, plus fixture geometry checks for Arabic stability, English mirrors, symmetry and preserved widths.
- [x] Add the shared native direction adapter and small geometry policy; wire both project files and renderer. Build the real SAP-dependent project and run the complete contract/HTTP harness.
- [x] Run the existing Angular report tests to verify Summary Info localization/language delivery without client source changes.
- [x] Reconcile canonical feature books/manifest/recipes and central notes; regenerate and check documentation, planning and diff whitespace.

## Review focus and limits

Check printable width rather than paper width; use the same twip units as SDK coordinates. Preserve the original Arabic basis and center alignment. Do not double-mirror an instance; the renderer loads a fresh temporary report per request. Native shape setters and cross-section lines still require an actual English/Arabic PDF comparison after the requester publishes CrystalReportGeneratorApi. The contract harness does not prove native rendering or source-cache behavior. No server is started/stopped and no deployment is performed.

Research: [SAP object positions use twips](https://userapps.support.sap.com/sap/support/knowledge/en/1199051); [SAP report-object formatting](https://help.sap.com/docs/SAP_CRYSTAL_REPORTS%2C_DEVELOPER_VERSION_FOR_MICROSOFT_VISUAL_STUDIO/0d6684e153174710b8b2eb114bb7f843/45bfdbbb6e041014910aba7db0e91070.html?locale=en-US). Source/history remains the authority for the requested legacy behavior.

## Execution result


Verification: the regression first failed with the missing direction-stage
message, then the real SDK Release build and complete contract/HTTP harness
passed.12geometry/language cases plus pre-export call-order checks pass. The
first AnyCPU harness invocation could not load the existing x64 runtime; the
recorded red/green cycle uses the existing x64 harness configuration. Full Angular
check passes, including zero-warning lint, architecture/strict types,512unit tests
in91files, format and production build (495.63kB initial). Three new selector tests
verify Summary Info names and bilingual fallback. No Angular production source
change. No ERP/DTO/schema change or fresh ERP full-suite claim.

The actual native AR/EN PDF comparison remains FOLLOW-024/PROD-028. Source/history
review confirms the requested policy and fresh-instance call order; automated
geometry does not execute native shape setters. Current portable receipt:
verification/restore-direction/verification.json. No deployment or server restart.

Ruling: continue in the requester's current workspace because this correction extends the existing uncommitted renderer, project files and feature documents; no checkout replacement, commit or independent worktree was introduced. Native geometry remains a bounded managed policy because native ReportDocument execution is an existing environment blocker; the real SAP adapter is compiled, with native visual proof retained in the established release notes.
