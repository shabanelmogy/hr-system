# Duplicate-aware report replacement implementation plan

> Execute inline with writing-plans, test-driven-development and verification-before-completion. Existing GCT-1 feature and current uncommitted workspace remain the owners; no branch, commit, deployment or server restart.

**Goal:** When New report is saved with the same normalized RPT filename in the same entity, warn the user and allow confirmed, atomic upload/publication of a new version, retaining the old source/history.

**Approved decisions:** The requester explicitly chose (1) save and publish the new version only after successful inspection, switching the old publication in the same operation; (2) duplicate identity is the RPT filename within its entity. Summary Info titles are localized names, never duplicate identities. The request permits a suitable historical label instead of physical renaming.

**Architecture:** Reuse the existing global report aggregate, immutable source versions, role grants, View binding and single published-version pointer. Add a scoped filename lookup and a separate confirmed replacement command. Keep existing create/upload/publish endpoints compatible; ordinary new files and the deliberate Versions draft-upload journey retain their existing behavior. Angular owns confirmation in its current state service and shared ConfirmationDialog.

**Tech stack:** Existing .NET10 Reporting CQRS/EF SQL Server, Angular22.2.3 and PrimeNG22.1.4 shared controls. No schema, dependency, native Crystal or frontend ownership change.

## Frozen behavior and rules

- New-report Save resolves identity on the server using existing FileStemToKey rules. No duplicate creates the existing draft. A duplicate performs no write until the shared warning is confirmed.
- Warn with the existing report name/current version and explain that the new source will be inspected and published, retaining the old version and grants. Cancellation preserves the form and changes nothing.
- Replacement requires existing entity Edit/View, Upload and Publish permissions plus both per-report rights unless existing access-administrator rules apply. Create permission alone cannot replace. Archived identities cannot be replaced or bypassed by another name.
- Submit the confirmed target ID and expected SQL row version. Inspect/store the new source, recheck ownership/rights, allocate the next version and change publication in one database transaction under the existing report resource lock. Any validation, storage, stale-row, permission or transaction failure preserves old publication and removes an uncommitted private source.
- Keep report ID/key, description, View binding, grants and original version bytes/filenames. New Summary Info belongs to the new version and supplies the newly published selector names.
- Historical version names in the Versions grid include version number and localized creation date. This is presentation only, including unpublished drafts; no immutable source or report key is renamed.
- Changed actor/entity/file/editor draft invalidates a pending confirmation. A concurrent report change requires a fresh lookup and confirmation.
- Next/mobile consumption inherit the published pointer and stale-token checks; their management surfaces remain out of scope. DEF-027/028 remain Deferred. FOLLOW-024/PROD-028 retain actual hosted/native acceptance.

## Implementation steps

- [x] Preflight current books/manifest, shared confirmation, API policy/store, source inspection and publication transaction. Register this bounded GCT-1 extension, API/Web/Mobile impact and required checks before runtime edits.
- [x] Write and observe failing API tests for duplicate lookup, confirmed version/publication replacement, invalid/stale/forbidden/archive preservation and private-source cleanup.
- [x] Implement typed lookup/command/controller/store contracts using existing ownership and SQL concurrency. Verify focused tests and isolated SQL transaction behavior.
- [x] Write failing Angular tests for duplicate warning/cancel/confirm, correct multipart target/version token, identity/file invalidation and nonduplicate compatibility. Implement with current state/service and shared controls; add EN/AR text and historical labels.
- [x] Run full API restore/Release build/serial tests and full Angular format/lint/architecture/check. Update canonical books/manifest/recipes/notes; regenerate and check documentation/planning and diff whitespace.

## Existing-system relationship / bounded gate review

Reporting is the sole business owner; Platform supplies current permissions/roles and the native service supplies source inspection only. This extends the current GCT-1 workflow without a new report lifecycle/state, module, screen or permission vocabulary. The reviewed P-001 manager, form and shared confirmation remain the UI pattern. Existing G0–G3 boundaries are reused with the requester's explicit replacement decision; release-only native/host checks stay with the established G4 notes. Database schema is unchanged; actual migrations/schema and atomic publication are verified through isolated SQL integration tests.

## Review focus

Same filename in a different entity must not collide. Summary Info changes must not create another identity. No inspection/upload on cancel; no publication switch before successful validation/commit. Verify Upload-without-Publish and per-report ACL denial, stale tokens, failed commits, archived duplicates and frozen-file confirmation. Preserve an already published version when the new source fails. No new binary report fixture is declared native-valid by mocks.


## Execution result — 2026-11-04

Approved bounded replacement is implemented. Exact current tests, gate counts,
source/permission contract, four browser outcomes and environment resolution are
recorded in the feature section32 and verification/duplicate-replacement/verification.json.
Full API and Angular technical gates passed. Existing create and explicit draft
upload remain compatible. No schema/native changes or deployment. Publish ERP API
and Angular assets together, then perform the actual hosted replacement and native
AR/EN checks retained by FOLLOW-024/PROD-028. Overall Phase06 remains Not Verified.
