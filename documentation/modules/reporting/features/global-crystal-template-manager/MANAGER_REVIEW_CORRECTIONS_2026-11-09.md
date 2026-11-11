# Global Report Manager corrections — 2026-11-09

## Scope and relationship review

Requester authorized applying the six findings from the existing manager review, including title formatting. This is a correction within global-crystal-template-management / GCT-1. Reporting retains aggregate, permission, publication and storage ownership; Platform supplies role scope through its public authorization contract. Angular retains the existing state/service and shared presentation adapters. No new business capability, database model, migration, dependency, Builder or template-library scope is introduced.

## Corrected contracts

1. Verify Database requires `{ rowVersion }`, like Publish. Invalid/stale tokens fail before opening the source. After native verification and inspection, the report lock is acquired and the current token is checked again. ApplyRowVersion guards the final write. A competing publication survives and the staged RPT is compensated. Archive, policy, upload/publish rights and contract validation remain authoritative. API and Angular must be released together for this required request field; older clients without it receive validation failure.
2. Lifecycle failures render with shared inline FeedbackState inside the open detail dialog, including publication, verification and download failures.
3. The list uses shared PageHeader collection/inline actions and collection-page shell, including the manager host and list host. The route requests a fill workspace. Title, total badge, refresh/export alignment and responsive sizes come from the shared header. Grid-body scrolling retains the shared footer within the bounded workspace.
4. Global access grants now return structured tenantId, tenantName and scopeKnown. Tenant report DTOs are unchanged. Readonly/archived rows retain their company scope; missing role metadata and older server responses display an unknown scope, never the platform-wide label. This is display metadata, not an authorization expansion.
5. Browser verifiers use current shared record navigation, the Actions menu registration entry and PageHeader PDF links. Source download/upload remain in viewer options. A dedicated manager regression verifies header/footer geometry and inline errors using production assets and intercepted API fixtures.
6. Historical raw log availability is recorded explicitly, independently of current executed proof. No recreated historical log or inferred historical pass is accepted.

## Behavior and boundary matrix

- Valid token: add and publish a new verified version; retain original source/history.
- Invalid/stale token: do no native work; preserve publication.
- Concurrent publication during verification: return concurrency conflict, preserve competing publication, remove staged file.
- Runtime/inspection/storage/archive failure: retain original publication and existing specific error.
- Readonly permissions: tenant/platform/legacy/missing-role scopes remain distinguishable.
- Responsive title/list: EN/AR, light/dark, desktop/phone/short landscape and navigation open/closed; shared header and Grid remain owners.

## Platform impact

Angular manager and Reporting API are Required for this correction. Existing Next and mobile runtime surfaces are unchanged: the global manager is Angular-owned; native manager remains Excluded and existing consumers retain their contracts. No new mobile editing workflow or mock business entity is required. Existing iframe and white PDF paper behavior are preserved.

## Verification and release limits

Current executed counts, commands, source hashes and portable browser receipts are registered in verification/manager-review-2026-11-09/. Fixtures prove client interaction and API orchestration, not native Crystal connectivity or a hosted RPT/PDF. FOLLOW-024 and PROD-028 retain native/hosted acceptance. Phase06 overall remains Not Verified until its independent release gates pass; no Phase07 closure is asserted.

The initial documentation check failed on an absent fingerprint Angular log. Full inventory identified additional historical raw logs in five registered feature manifests. Historical claims remain attributed to their original receipts; unavailable raw output cannot substantiate a new acceptance claim. See the central dated inventory and FOLLOW-025/FOLLOW-033 for the explicit evidence repair, current replacement proof and retained limitations.

## Research used

- [EF Core concurrency conflicts](https://learn.microsoft.com/en-us/ef/core/saving/concurrency): original concurrency tokens protect the final database update; the report is also checked after the slow external verification boundary.
- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md): current review guidance for accessible feedback, usable sizing and responsive overflow. Repository shared-component contracts remain authoritative for implementation.

## Reproducible full-gate execution on this host

The default Vitest run first observed two5000ms composition timeouts, then a
separate full attempt observed7worker-startup errors and an abnormal worker exit.
Both outputs remain in the dated proof. No assertions or timeouts were changed.
[Vitest parallelism guidance](https://vitest.dev/guide/parallelism) documents limiting
workers. Installed Vitest5.0.5 resolves `VITEST_MAX_WORKERS` into its maxWorkers
option. Current host verification uses `$env:VITEST_MAX_WORKERS='2'; npm run check`
with all198test files retained. This bounds test-runner resource use for this
execution; it does not prove the root cause or close FOLLOW-031. The list's
background feedback also uses the existing inline presentation to preserve space.

## Final measured result

- Full `npm run check` exited 0 with `VITEST_MAX_WORKERS=2`: 1039 tests in
  198 files passed, together with formatting, zero-warning lint, architecture,
  strict TypeScript/templates and the production build. Initial bundle is
  585.62 kB; four existing bundle/style budget warnings remain recorded.
- API clean Release build: zero errors, 482 existing analyzer warnings. Full
  configured local SQL suite: 1368 passed, three existing opt-in browser skips,
  zero failures; Reporting accounts for 267 passed. Twelve TRX reports were
  checked, with eleven focused regression cases passing.
- Browser proof totals 88 production-asset fixture scenarios across the manager,
  paging/filters/actions, registration, source sidebar and designer. The manager
  verifier is repeated after the final production build, including inline list
  feedback. This is browser interaction evidence, not hosted/native acceptance.
- Current documentation completeness is independently checked across 540 recipes.
  The 60 unavailable historical raw logs remain inventoried under FOLLOW-025.
  Their absence and the two unsuccessful default Angular attempts are retained.
- Release the Angular client and ErpSystem.Api together because Verify Database
  now requires RowVersion. No deployment was performed during this correction.

| Requirement | Evidence |
| --- | --- |
| Successful verification publishes a new version and preserves history | `Verify_PublishesANewVersionAndPreservesTheOriginal` |
| Invalid/stale tokens do no native work | `Verify_RejectsInvalidOrStaleTokenBeforeNativeWork` |
| Concurrent publication survives and the staged file is removed | `Verify_ConcurrentPublicationWinsAndStagedFileIsDeleted` |
| Tenant/platform/missing-role scopes remain distinct | `Grants_PreserveTenantScopeAndDistinguishMissingRolesFromPlatformRoles`; `preserves tenant and platform scope for archived readonly grants and marks legacy scope unknown` |
| Shared title, bounded footer and visible dialog errors | `verify-report-manager-review-browser.mjs`, 16 scenarios; `manager-browser.json` |
| Current collection controls and existing workflows | Maintained pagination, registration, sidebar and designer verifiers, 72 scenarios |
