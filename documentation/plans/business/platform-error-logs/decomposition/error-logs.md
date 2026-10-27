# Error Logs — Screen / Workflow Contract

Execution order marker: API → Web → Mobile → integrated live verification → documentation/closure

## 0. Contract metadata
| Field | Value |
| --- | --- |
| Contract version | `2.0` |
| Plan ID | `platform-error-logs` |
| Authorized slice | `Error Logs V1` |
| Child Feature ID | `error-logs` |
| Child feature name | Error logs |
| Owner | Platform |
| Depends on | Trusted actor/company context; Platform Hangfire |
| Execution status | Closed |
| Status evidence | `PLAN.md` active roadmap marker; Applied books, live migration, API/Web/Mobile automated evidence and explicit inherited/manual release classification |

## 1. Child boundary and outcome
This child owns immutable error records, metadata-only capture ingress, scoped list/detail/export, and global retention settings. It is independently accepted when API then Web then Mobile present only the correct trusted projection and retention works with revision/audit. Third-party APM, notifications, record CRUD and durable pre-host crash capture are outside it.

## 2. UI Pattern Gate (mandatory before implementation)
| Screen ID | Platform | Route / entry | User job | Data / interaction shape | Primary Pattern ID | Sub-pattern / form decision | Exact reviewed reference source path | Platform status | Grid / Table / Cards / Tree / Detail / Report / Import / Export / Chart (R/D/E) | Loading / empty / error / forbidden / dirty / conflict states | Offline policy | Mock-data policy | Permission / scope | Responsive / RTL / accessibility | Deviation and reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `platform.error-logs.viewer` | Web | `/advanced-tools/error-logs` company; `/super-admin/error-logs` system | Filter/view/export errors | Server-paged collection and detail dialog | P-001 | Detail dialog; no CRUD form | `web-next/src/platform/audit-trail/pages/AuditTrailPage.tsx`; `web-next/src/platform/audit-trail/components/AuditTrailDetailsDialog.tsx` | Adapted | Grid/Cards Required; Tree/Report/Import/Chart Excluded; Detail/Export Required | shared loading/empty/error/retry/forbidden; no dirty; exported/failed feedback | Online authoritative | N/A — no fabricated diagnostic data | company `ErrorLogs:*`; system `SystemErrorLogs:*` plus SuperAdmin role; separate guards | responsive grid/card adaptation, EN/AR RTL, keyboard detail/action labels | Error-specific filters/projection; no audit mutation |
| `platform.error-logs.viewer` | Mobile | `/advanced-tools/error-logs` company; `/system-error-logs` system | Filter/view/export errors | Server-paged table/cards and detail modal | P-001 | stacked detail modal | `mobile-react/src/platform/tools/audit-trail/presentation/screens/AuditTrailScreen.tsx`; `mobile-react/src/platform/tools/audit-trail/presentation/components/AuditTrailDetailsModal.tsx` | Adapted | Table/Cards/Detail/Export Required; Grid/Tree/Report/Import/Chart Excluded | shared loading/empty/error/retry/forbidden; no dirty | Online authoritative | N/A | company `ErrorLogs:*`; system `SystemErrorLogs:*` plus SuperAdmin role; separate guards | phone/tablet cards, safe-area, RTL and 44pt actions | No offline diagnostics cache |
| `platform.error-logs.settings` | Web | `/super-admin/error-log-settings` | Set retention | Singleton settings aggregate | P-005 | typed MyForm dialog/page | `web-next/src/modules/accounting/ledger-setup/pages/LedgerSetupResourcePage.tsx` | Adapted | Detail/Edit Required; Grid/Cards/Tree/Report/Import/Export/Chart Excluded | shared loading/error/forbidden/dirty/conflict reload | Online authoritative | local valid 1..3650 draft only | `ErrorLogSettings:*`; SuperAdmin global; independent of viewer permission | EN/AR RTL, focus/error links | Global platform singleton |
| `platform.error-logs.settings` | Mobile | `/error-log-settings` | Set retention | Singleton settings aggregate | P-005 | AppForm dialog | `mobile-react/src/modules/accounting/ledger-setup/presentation/screens/LedgerSetupResourceScreen.tsx` | Adapted | Detail/Edit Required; Table/Cards/Tree/Report/Import/Export/Chart Excluded | shared loading/error/forbidden/dirty/conflict reload | Online authoritative | local valid draft only | `ErrorLogSettings:*`; SuperAdmin global; independent of viewer permission | keyboard/safe-area/RTL/44pt | Global platform singleton |

## 3. Closest existing reference
| Reference | Exact path/screen | What is reused | What intentionally differs |
| --- | --- | --- | --- |
| Audit Trail | listed P-001 sources | list state, filters, server paging, details, feedback | Immutable error facts and dual projection; no change history semantics |
| Ledger settings | listed P-005 sources | singleton load/form/revision/dirty workflow | Retention days only; SuperAdmin global scope |

## 4. Reuse and composition contract
| Need | Existing reusable component/source | Decision | Exact use or extension |
| --- | --- | --- | --- |
| Web list/detail/form | shared grid, feedback, `MyForm` | Reuse | Compose typed service/hooks; no API calls in component |
| Mobile list/detail/form | `AppListScreen`, `AppDataTable`, `AppDataCard`, `AppForm` | Reuse | Compose typed repository/query/form |
| Export/confirmation/errors | existing shared feedback/download flow | Reuse | Display projection-safe export result/errors |

## 5. Screen and workspace contract
| Surface | Required / Deferred / Excluded | Layout/workspace | Primary user actions |
| --- | --- | --- | --- |
| List/Table/Cards | Required | filters + server-paged rows | inspect allowed projection |
| Detail | Required | dialog/modal | inspect allowed fields/method frames only for SuperAdmin |
| Export | Required | filtered current query | download <=5000 allowed rows |
| Retention setting | Required | P-005 singleton | view/edit retention with revision |
| Create/edit/delete records, import/realtime | Excluded | N/A | N/A |

## 6. Typed transport and server criteria
| Concern | Exact contract |
| --- | --- |
| Responses | List `{items,totalCount,page,pageSize}`; row `{id,occurredOnUtc,source,severity,userName,service,action,statusCode,durationMs,correlationId,summary,client,browser,ipAddress}`; detail `{entry,diagnostics}`; settings `{retentionDays,revision,queueDepth,droppedCount,failedWrites}`. |
| Routes | Tenant: `GET /api/v1/error-logs`, `/{id}`, `/export`; SuperAdmin: `GET /api/v1/system-error-logs`, `/{id}`, `/export`, `/settings`, `PUT /settings`; metadata-only `POST /api/v1/error-logs/client`. |
| Criteria/paging | `fromUtc,toUtc,userName,source,statusCode,search,page,pageSize`; deterministic server bounds, 1-based page; export <=5000. |
| Scope/security | No client TenantId/CompanyId. Trusted actor decides SuperAdmin system projection or active company sanitized projection. `diagnostics` only SuperAdmin and contains method frames, never raw exception values. |
| Persistence | Platform schema/migration, immutable entry; global settings optimistic revision + atomic audit; bounded cleanup. |

### Permission Action Matrix
| Actor | Resource | User action | API endpoint / message | Exact permission | Scope | Read-only behavior | Web control + direct guard | Mobile control + direct guard | EN label | AR label | Denial test |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| company actor | ErrorLogs | list/detail/export | `/error-logs` routes | `ErrorLogs:View`, `ErrorLogs:ViewDetails`, `ErrorLogs:Export` | trusted current company | forbidden | direct guards | direct guards | View error logs | عرض سجلات الأخطاء | foreign/no permission |
| SuperAdmin | SystemErrorLogs | list/detail/export | `/system-error-logs` routes | `SystemErrorLogs:View`, `SystemErrorLogs:ViewDetails`, `SystemErrorLogs:Export` | global | forbidden | direct guards | direct guards | View system error logs | عرض سجلات أخطاء النظام | non-SuperAdmin |
| SuperAdmin | ErrorLogSettings | view/edit retention | `/system-error-logs/settings` | `ErrorLogSettings:View`, `ErrorLogSettings:Edit` | global | form read-only | direct guards | direct guards | Edit error log settings | تعديل إعدادات السجل | revision/permission |

## 7. Create, edit, view, and lifecycle contract
| Journey/action | Entry state | User interaction | Server action/state change | Result/read-only behavior |
| --- | --- | --- | --- | --- |
| View/detail/export | permitted trusted actor | filter/open/export | scoped read only | projection-safe data |
| Set retention | SuperAdmin + current revision | 1..3650 form save | update global singleton/revision/audit | conflict reload preserves draft |
| Cleanup | scheduler | no user action | chunk delete expired records | no manual record delete |

## 8. UX states, permissions, offline, and mock data
| Concern | Contract |
| --- | --- |
| Loading/empty/error/retry | shared states; empty means no allowed matching records; retry never resends raw data |
| Permission/forbidden/read-only | exact independent guards; server authoritative |
| Unsaved/conflict | settings shared dirty confirmation; 409 reload/review preserves draft |
| Offline | online-only; no durable diagnostic cache or replay |
| Mock data | local safe display/draft only; no fabricated identity, technical diagnostics or scope |

## 9. Concurrency, transactions, and consistency
Settings serializes global aggregate, compares expected revision and audits in one transaction; no-op does not advance revision. Entries are append-only. Cleanup uses bounded transactional chunks. Capture queue failure/drop cannot affect the original request/job/client outcome.

## 10. i18n, RTL, accessibility, and responsive behavior
New visible text is paired EN/AR. Use logical layout and shared focus/error/feedback behavior. Web has responsive grid/card adaptation; Mobile table/cards and accessible touch targets. Company projection never relies on client filtering. Native acceptance remains `PROD-026`.

## 11. Vertical execution ledger (strict one-active-step gate)
| Order | Stage | Status | Entry gate | Required evidence / exit gate | Evidence path |
| ---: | --- | --- | --- | --- | --- |
| 1 | API | Verified | plan/contract/Phase 00 approved | 1072 API tests passed across full run and focused architecture rerun; live migration + 27 authenticated HTTP checks | Phase 01 API evidence |
| 2 | Web | Verified | API stage Verified | P-001/P-005 implemented; browser 3/3, reporter 9/9, service 3/3, full npm check passed | Phase 02 Web evidence |
| 3 | Mobile | Verified | Web stage Verified | 46 focused feature/route tests plus shared date test; typecheck, feature lint, architecture/contracts/i18n and Android export; physical PROD-026 deferred | Phase 03 Mobile evidence |
| 4 | Integrated live verification | Verified | API/Web/Mobile Verified | repeat 27 authenticated HTTP checks; browser 3/3; physical PROD-026 separately deferred | Phase 06 evidence |
| 5 | Documentation and closure | Verified | integrated verification Verified | books/manifest/recipe/education | Phase 07 evidence |

**Next-step rule:** Web, Mobile and later stages remain queued until the immediately previous stage is Verified.

## 12. Verification contract
| Layer | Required evidence/test | Critical scenario | Result |
| --- | --- | --- | --- |
| Domain/Application | validation/projection/revision tests | raw suppression, settings conflict/no-op | Verified — owning evidence ledger |
| API/transport | controller/security/capture tests | company/system isolation, no duplicate client HTTP capture | Verified — owning evidence ledger |
| Persistence/migration | Platform migration/live schema | immutable records, cleanup bound/audit | Verified — owning evidence ledger |
| Web | query/form/component/i18n tests | filters/detail/export/settings dirty conflict | Verified — owning evidence ledger |
| Mobile | remote/repository/screen/i18n tests | metadata-only capture and online settings | Verified — owning evidence ledger |
| E2E/manual/live | authenticated users | scope projection and retention | Authenticated HTTP 27/27 and browser 3/3; native PROD-026 deferred |

## 13. Child exit gate
- [x] P-001/P-005 references and shared reuse remain faithful.
- [x] Raw exception/payload secrets cannot persist or project.
- [x] API/jobs/Web/Mobile capture is bounded/deduplicated and original outcome is unchanged.
- [x] Eight permissions and actor scopes are independently denied/tested.
- [x] Retention revision/audit/cleanup and migration are verified.
- [x] API → Web → Mobile → live verification evidence is recorded in order.
- [x] Customer education/closure occurs only after verification; PROD-026 remains explicit.



## 14. Corrective amendment — 2026-10-18

Requester reports `Error logs could not be loaded` and authorizes an extensible Settings menu. Classification: corrective contract-consumer fix plus existing navigation reorganization; no new endpoint, permission, business lifecycle or physical route. Runtime evidence: live system list HTTP200 with 17 rows; eight existing Web/Mobile capture IDs fail RFC UUID validation because the server derives stable GUIDs from SHA256 scope/event material. Use the .NET GUID contract in both client response boundaries (Web `z.guid()`, Mobile equivalent strict hexadecimal GUID shape), preserving stable IDs and deduplication, while malformed IDs still fail closed. Client-generated event IDs remain UUIDs.

Web reuses the existing shared nested sidebar item (reviewed global geography group) to place Error Log Settings under Settings. Mobile reuses the existing Settings screen and shared Card/Button composition as a permission-filtered P-007 navigation section; it adds no new screen, route or API ownership. Remove the separate visible Mobile drawer leaf while retaining its guarded route. Existing P-005 retention and P-001 viewers are unchanged. Settings visibility requires the existing SuperAdmin role and ErrorLogSettings:View; no SystemErrorLogs:View dependency, no empty group and no future placeholders. EN/AR, RTL, keyboard/touch and existing dirty guards remain Required. No data/schema mutation is necessary; live schema was already applied and live reads verify it.

Verification: response-schema regressions for deterministic non-RFC GUIDs and malformed IDs on both clients; live response parse; browser company/system list and detail; navigation permission/empty-group tests and existing Mobile settings-link tests; typecheck, architecture/i18n and canonical regeneration. Prior closure evidence remains historical; this amendment's checks are recorded separately in the owning evidence ledger.


## 15. Corrective shared-criteria scope — 2026-10-18

The requester authorized correcting shared UI fidelity and clarifying documentation. This preserves existing P-001 screens, API filters, fixed sort, permissions and data. Audit Trail remains a diagnostic semantics reference only; review CountriesMultiView/CardViewHeader and the current shared catalog for list-shell behavior. Web reuses PageHeader multi-view, CardViewHeader/SearchBar/ResetButton, MyDateTimeField and compact shared text/select fields. Extend existing shared contracts with backward-compatible showSort/filterControls/selector-size options; do not create another local toolbar. Source-to-component evidence is in the Web book. Mobile already uses its native shared contracts and remains unchanged. Verify expanded EN/AR compact/wide controls, UTC mapping, view persistence, empty-result recovery and export; no new schema or migration.

Final Grid correction under the user's explicit mandatory-reuse direction: preserve MyDataGrid's standard search/reset/options/footer/record navigation; extend its generic toolbarFilters/emptyContent contracts. Cards uses the existing shared card criteria header. Enforce the raw-grid boundary in check:architecture, remove ClientDataGrid from public exports, and migrate its one legacy localization-messages consumer with row-edit behavior preserved. No API/schema change.


## 16. Administration versus Settings navigation — 2026-10-18

Authorization: requester approved the separate Administration main-navigation section for operational screens and Settings for configuration after correcting the earlier inside-Settings option. Classification: existing navigation reorganization only; preserve all physical routes, business workflows, per-route permissions, scope, database schema and APIs. No new page or blanket permission is introduced by this slice.

Web reuses shared createNavSection/createNavItem and recursive permission filtering. Tenant Administration combines existing users/roles/invitations with Error Logs, Audit Trail, health/API endpoints/Hangfire; Settings groups company translations, offline policy, company geography and existing localization messages. SuperAdmin Administration exposes the existing system Error Logs route; Settings exposes the existing retention route, independently authorized. SuperAdmin tenant management/global geography remain in their existing owner section.

Mobile reuses existing shared AppCard/AppText/AppButton composition through a Platform-owned reusable navigation-links composition (route/title/icon; canAccessRoute is authoritative). Administration links are rendered as an independent main drawer group using current security/operations routes. Hide duplicate main drawer administration/advanced-tools/system-error leaves but preserve guarded direct links and nested route layouts. Settings links reuse the same navigation composition for retention/company configuration; native preferences stay in the existing Settings screen. Do not grant SuperAdmin access to company-only tools. Preserve empty-group hiding and immediate drawer close on navigation.

Screen/workflow contract remains existing P-007 navigation composition plus P-001 viewers/P-005 settings; no creation/edit/mock/data change. Required Web/Mobile: EN/AR labels, permission-only visibility, separate operational/configuration groups, no duplicate viewer entries, original deep links, small-screen navigation. Reuse references: web-next/src/platform/navigation/platformNavigation.tsx and sidebar configs; mobile-react/src/platform/navigation/SystemSettingsLinks.tsx and shell drawer. Verification: navigation policy tests, existing read/settings browser journeys plus Administration links, Mobile links/route tests, type/architecture/contracts/i18n, canonical documentation regeneration; physical native acceptance remains PROD-026.


## Rich diagnostics authorized amendment - 2026-10-19

Requester explicitly extends the current error-log correction to maximize useful diagnostics. Bounded existing Error Logs V1 extension: safe technical exception/HTTP/job context in existing system-only diagnostics string array, widened bounded storage, same company/global authorization and retention. Exact preflight/rule/edge/impact/verification matrices are recorded under Rich bounded diagnostics amendment in the canonical applied books. G0-G4 pass for this bounded same-owner amendment; no new feature/module/public route or unsafe raw payload capture. Native existing selectable detail remains compatible; no new clipboard dependency. Run the standard migration/apply checks and verify live storage on the requester-authorized experimental database. SQL storage is already nvarchar(max), so increasing the application limit needs no new empty migration.


Rich diagnostics amendment acceptance: Verified for the authorized development/automated scope on 2026-10-19. Current applied evidence records 1077 passing API tests, 28 live HTTP checks, Web/native compatibility/browser acceptance and live-schema verification. SQL storage already supports the widened application bound, so the migration script creates no empty migration. New Web copying and existing native selectable detail preserve company/system authority. Original physical-device and repository release-budget notes remain open.
