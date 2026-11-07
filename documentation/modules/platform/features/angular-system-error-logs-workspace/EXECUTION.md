# SDD ledger — plan: documentation/modules/platform/features/angular-system-error-logs-workspace/IMPLEMENTATION_PLAN.md

Spec is the version2 S4-A4 contract in the canonical migration plan. Phase00 source
review/check508/planning passed2026-11-06; no successor runtime acceptance yet.

Ruling: continue the existing approved branch/checkout — the goal is an ongoing
multi-owner change with preserved edits, so creating/moving a worktree is not
useful here. No commit/push/merge/deployment is authorized by this execution skill.
Durable central evidence replaces the skill's optional Git checkpoint workflow.
Ruling: root implements Task2 while one bounded implementation worker owns Task1;
no second implementation worker. Root alone changes public APIs/docs/config and
integrates results. Existing reviewer is reused per project policy.

| Scan pair/task | Producer/consumer or self-consistency check | Finding/ruling |
| --- | --- | --- |
| Task1 self | Frozen DTO/service signatures vs actual source and scoped tests | Consistent; system-only source, readonly interfaces, no UI or live writes |
| Task2 self | Allowlisted presentation string vs guards/remount behavior | Consistent; fix FOLLOW-027 now, no business persistence |
| Task3 self | Five separate grants and revision flows vs scoped state | Keep independent denials; no automatic replay or cursor logic |
| Task4 self | Required source UI vs shared composition | Explicit no-checkbox/no-column-filter and toggle-controlled toolbar frozen |
| Task5 self | Verified claim vs full/runtime/source evidence | No DTO-only acceptance; all Required capabilities and gates before closure |
| Task1→Task3/4 | Typed contracts and service Observables consumed by owners | Public names/signatures frozen in Task1; root adapts state/UI |
| Task2→Task4 | Shared view helper and owner preference integration | Root owns shared public entry; no worker overlap |
| Task1/Task2 | File ownership and public API integration | Disjoint files; root alone edits barrels, manifests and formatting globally |
| Task1–4→Task5 | Real source/tests/receipts to acceptance books | Register actual files only; preserve historical predecessor evidence |

- Task 1: complete. Same-worker fix round and independent re-review by /root/tenant_final_review: no P1/P2; scoped13tests/2files and owned lint pass. ASP.NET filename/filename* compatibility, canonical GUID identity and strict calendar UTC validation verified. Report .superpowers/sdd/IMPLEMENTATION_PLAN/task-1-report.md; BASE d8b429ad342bcb2ffe696bd4b38a393549d47052 (uncommitted scoped additions).
- Task2: shared preference red5/6 then green6/6; consumer red2 then green14/14 across2files. Tenant/Countries/States/Districts integrated. Browser16EN/AR390/1440 cases pass reload/synchronization/fallback, wide cases additionally SPA leave/back. Independent Task2 source review clean (no P1/P2); FOLLOW-027 not closed before Error Logs consumer/full gate. Architecture rule now declares only shared/data/view-preference.ts as localStorage owner; sessionStorage remains prohibited. No broad acceptance yet.
- Task3: read/detail/export/criteria/policy implementation active with /root/error_log_transport; root owns retention settings/form and public/UI integration. Tasks4–5 pending; no acceptance claim.

- Task3 retention foundation: shared Signal Form/range tests2, CSRF/not-sent/rejected/uncertain service tests8, independent settings-read/editor tests11 pass in focused runs. Read-only retention review clean. UI/Phase06 not accepted.
- Task3 read/detail/export: integration review found page-size-reset, queued-search-reset, detail403-reopen and export scope issues; same-worker fix round active. Keep these as client defects to repair now, never as release-only exemptions.
- Foundation full gate first run: format passes; typed lint rejected one unsafe test-host nativeElement access in the new Countries remount test. Root gave that element an explicit HTMLElement contract; rerun still required. Earlier storage-owner failure is repaired and architecture behavior has a focused test.

- Task 3: complete for scoped state/form/transport foundation. Same-worker fixes and independent re-review approved2026-11-06, no P1/P2 remaining. Worker scoped10files/38tests and owned lint; root retention11/2files and command/form10/2files are overlapping focused runs. Full application gate running; no UI acceptance. Task4 starts after this stable foundation checkpoint.

- Historical foundation full gate2026-11-06: npm run check exit0,890tests/169files,31architecture,4configuration,allformat/lint/catalog/tokens/fonts/types/build; initial578.82kB RISK-020. Later Task4 UI changes invalidate use of this checkpoint as current complete acceptance.
- Task4 root UI now includes retention summary/form/dialog/page, guarded route/sidebar, shared call-time CopyButton and escaped TextPanel, generic MetricCard description/footer. SharedCopy3/TextPanel1 and settingspage1 pass; retentionbrowser8EN/AR/lightdark390/1440 passes fully intercepted validationfocus/409review/explicitresave/discardLoadCurrent/noouteroverflow. No hosted writes. Two canonical bilingual feedback keys generated through the owning catalog pipeline; PROD-019 remains external publication.
- Task4 worker list/detail source exists; initial43test run had3scaffoldtestfixturefailures. Same worker is replacing them with meaningful fixtures and correcting source filter-toolbar/card fidelity. No screen acceptance before all findings/full/browser/source/reference/live-read gates.

- Task4 root takeover repaired incomplete worker UI and replaced3create-only specs plus1constant-only criteria test with actual state/service/interaction fixtures. Red2 then green5/4files; criteria and CORS units8/2filesgreen. Full Error Log browser8EN/AR/lightdark390/1440 now passes list/search/detailescapedcopy/45vhdiagnostics/XLSX/currentCardsrestore/noouteroverflow. Settingsbrowser8already passes. Independent current source review clean.
- Root investigated actual export CORS: API host exposes only correlationheader; retainedNext uses safe error-logs.xlsx fallback when filename absent. Parser now uses that same fallback only for null Content-Disposition and retains strict validation when present. Unit red1 then green; browser download passes with current cross-origin header behavior. API unchanged.
- First currentUI full gate passedformat/lint/config/tokens/fonts/catalog but architecture correctly rejected authfixture import/localStorage inside a helper .spec-setup.ts. Root moved test-only fixture/storage access into owning .spec.ts; enforcement is unchanged. Full gate rerun active.
- Current preview4220 restarted with verified portowner after stale failedwatch; existing4210 preserved. Newpreview execsession85107. Root fixed missing explicitvitest import in testhelper, then freshpreview compiled. No extra service/port created.

- Final source/browser corrections complete: scoped success feedback, refreshed summary, shared date-only full range, CardList flex fill and shared entity header. Current full gate907tests/177files/31architecture/4config/build578.82kB;8+8+36Angular/8Next,24nav,5regressions,hostedGET200/logout204. Independent source reviews clean. Phase06 Verified then Arabic education registered; S4-A4 client Closed. New general PageHeader all-filtered Excel/CSV is the authorized successor; parent goal Active.
