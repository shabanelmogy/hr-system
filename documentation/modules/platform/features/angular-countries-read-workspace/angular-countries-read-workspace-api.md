> Current bounded status: S3-A2 Verified/Closed; S3-A3 Create/Edit is next Active.
> Earlier Active/NotVerified correction notes below are historical. Full Countries
> parity and hosted publication remain outside this bounded closure.

# Countries read workspace — api applied book

Current correction: **Active / Phase06 Not Verified**, 2026-10-30. Earlier standalone acceptance is historical. See verification/CURRENT_GRID_REVIEW.md.

## 1. Ownership

ReferenceData owns Country and the additive read-query API. Platform owns migration evidence; Shared owns generic UI. Existing Next/native ownership, persistence and business lifecycle remain retained.

## 2. Existing-System Relationship Review

S3-A1 AUDIT_REPORT/SOURCE_SNAPSHOT and current Countries page/controller/query/store/validation/DTO/shared sources were reviewed. GLOBAL_COUNTRY_READ_CONTRACT freezes this target; current source is not inferred from old profile claims.

## 3. Bounded client scope

Grid/Cards/detail read Required at authenticated /dev/countries; production business route Excluded until S3-A8. Other Required pilot actions/views stay queued in S3-A3..A8. New native UI, AR, standalone unconfigured export and writes Excluded from this child.

## 4. Shared reuse

Use the public MyDataGrid/CardList and existing collection frame/footer/navigation, PageHeader, OptionSelect, ActionButton, StatusBadge, DialogPanel and shared fields/feedback/scroll. Grid options composes native Dialog/Tabs/SelectButton in the shared frame; responsive insets, clear actions, filters and column controls are generic. Follow D19 and ANGULAR_PRIMENG_WORKFLOW. Features own business data/permissions/callbacks only.

## 5. Exact data and transport

Existing GET page/detail remains compatible. Additive POST /api/v1/countries/query sends the validated existing query plus optional typed filters; cookie credentials and CSRF are required by the Angular transport. Body bound 32KiB; timeout 10s; no automatic replay. An equivalent single text criterion uses GET only when no independent toolbar search would be lost. Defaults remain page0/10/createdOn desc/active with one-based HTTP mapping and strict response parsing. Max11 filter groups,4 conditions per group,text200,int32 counts/IDs,real YYYY-MM-DD dates and booleans. Field/mode/type allowlists reject the entire unsupported query.

## 6. Permission Action Matrix

Both super_admin and Countries:View are required for page/detail/UI callbacks; API final authority. No wildcard/role-only/tenant-entitlement bypass. No write callback/grant. Native retained. Server403 latches until identity changes.

## 7. Business Rules Matrix

The six source strings/codes and nullable metadata/timestamps/isDeleted/active-state counts retain server ownership. AND combines fields; each field explicitly combines its conditions with AND or OR. Conditions execute in EF before count/order/paging, including active-child counts, UTC calendar-day matching and documented nullable negative behavior. Zero and false remain typed values. No raw SQL or downloaded-page emulation. Detail remains a separate authorized ID read.

## 8. Edge Cases and Validation Matrix

Reject unknown/duplicate fields, modes or JSON members, wrong types, blank/overlong text, too many groups/rules, invalid dates and out-of-range numbers. Verify AND/OR, zero/false, null dates/strings, active-child counts, ordering/count/paging and SQL translation. Preserve existing malformed response, duplicate row, metadata,401/403/404,timeout,cancellation,scope/locale/detail/close/retry coverage. No entity/schema/transaction/editor mutation occurs in this read contract.

## 9. Lifetime and consistency

Existing scoped read, immutable identity+criteria, synchronous old-row/detail mask, cancellation and no late side effects. Locale redraw no duplicate read; Grid/Cards share owner. Debounced valid text,invalid text feedback,no invalid request. Pending refresh coalesces;403 cannot retry-bypass.

## 10. Localization and security

Existing SQL-backed core/reference-countries namespaces, runtime revisions, overrides and permissions remain authoritative. Seven bilingual generic Grid options keys were added at the canonical web resources and exported through the existing catalog pipeline: 21 total sources /7259 keys,20 web namespaces, fingerprint294ffc9b2b5c8635f20887541db1a66437fd43d16f612eb43016e06dba3f388e. Plain text, safe IDs, strict owned queries, Cookie/CSRF and no JS credential persistence/BFF remain. Source regeneration does not publish hosted resources; PROD-019 owns deployment verification.

## 11. Verification

Current bounded Phase06: **Verified**, 2026-10-30. Read Grid/Cards/detail and
requester corrections D19–D25 passed full Angular362/build, actual shell-route8,
company/cross-tab14 and the registered API/reference evidence. Phase07 guide is
updated after this verification. See verification/CURRENT_READ_CLOSURE.md and
CURRENT_CORRECTION_RESULTS.json. This does not accept write actions, remaining
Views, hosted publication or full Countries parity; those remain Required in their
exact children and PROD-019. No entity/schema change; native UI unchanged.

## 12. Impact Matrix

Reuse module ownership, existing query/handler/read-store/persistence/permissions and GET/Next/native contracts. Extend typed query validation, EF filter application, cookie/CSRF read transport and shared native Grid/frame/theme controls. Add only the bounded query endpoint, filter schema/expression helper, real source tests and verification script. No entity/schema migration, new application package, business write or Next/native UI rewrite. PROD-019 and FOLLOW-016 retain deployed proof and full Grid acceptance.

## 13. UI Pattern and fidelity

P-001/C-01/C-02 uses actual CountriesPage/MultiView/controller/MyDataGrid/EntityCard/form reference. Typed generic header/footer allowed only through existing shared shells. Same-viewport EN/AR compact/wide comparison required; no placeholder later actions and no full-pilot claim.

## 14. Readiness

Single exact child; preflight preparation does not itself authorize coding. After397current-only checks, record bounded runtime entry with G0-G3 fixed and remaining G4 release-only PROD-002/017/019/RISK-018. Other non-release specialist proofs belong to queued children, not this read contract.

## 15. Handoff

S3-A2 bounded read is Verified/Closed. The sole next active child is S3-A3
Create/Edit, using its registered current-source preflight. Full Countries/pilot
acceptance remains S3-A8; lifecycle/Chart/Report/Import remain Required. Historical
reopened-correction records below are superseded by CURRENT_READ_CLOSURE.md.

## 16. Current navigation correction

The frozen correction includes the authenticated MainShell Dashboard Data → geography sidebar → Countries journey and the bounded additive advanced-query contract. Full production business-route, sibling writes and new native UI remain outside this child; no entity/schema change. Current proof does not imply full source parity or hosted deployment.

## 17. Current shared Grid correction — 2026-10-30

S3-A2 is the sole Active child; Phase06 remains Not Verified for complete current
acceptance. Earlier standalone acceptance is historical provenance. The actual
Dashboard Data → geography sidebar → Countries journey now consumes the collection
header, shared responsive card inset, native filters on all 11 data columns and
the shared Grid options modal. Native Dialog/Tabs/SelectButton are reused; density,
column search/visibility/order/logical pinning/reset are presentation only.
Text, numeric and date clear actions retain the shared CVA contract and use native
PrimeNG icon-only actions with the built-in Times icon. Follow D19 and
`documentation/guides/web/architecture/ANGULAR_PRIMENG_WORKFLOW.md`.

The additive `POST /api/v1/countries/query` executes the existing CQRS/read store
with strict bounded typed AND/OR criteria before count/order/paging. Existing GET,
Next and native behavior stays compatible. Angular uses legacy GET only when the
entire criterion is semantically equivalent; combined filters retain independent
toolbar search and use cookie/CSRF POST. No client-side filtering of a remote page.
The owning frozen `ADVANCED_FILTER_CONTRACT.md` and actual required-file manifest
define the application/infrastructure/controller/shared/feature boundaries.

No entity or persistence model changed, so EF schema migration and new Web/native
data-entry/mock journeys are N/A. New native advanced-filter UI is Excluded from
this Angular migration; existing Next/native interfaces are retained. Full live
API/schema/UI/device acceptance is not inferred from contract or fixture tests.

Current proof, validation-tool limits and intentional user-requested differences
are in `verification/CURRENT_GRID_REVIEW.md`. PROD-019 owns deployed API/catalog
verification. Remaining Countries create/edit/lifecycle/Chart/Report/Import child
contracts are Required and Queued. AR remains Excluded by DEC-028. Do not claim
full Grid capability, complete Countries parity or production acceptance yet.

D23: Countries Grid/Cards enable shared record navigation inside the single native
PrimeNG Paginator via templateLeft. Record buttons work on page1of1 without HTTP;
remote boundary crossing requests and focuses the target record. The current eight-case actual-route run verifies native page
and row-size changes, alignment and the read dialog without initial focus. MCP
validated the actual shared footer: valid=true, no issues. Full Angular check:
61 files/362 tests and production build passed. Machine evidence is registered
in verification/CURRENT_CORRECTION_RESULTS.json and CURRENT_BROWSER_RESULTS.json.
This bounded correction does not close complete Countries/source/host acceptance.

D23 current correction: see verification/ROW_NAVIGATION_REVIEW.md. Native MCP
accepted the actual shared footer usage; all eight actual-route EN/AR light/dark
390/1440 browser cases passed, including one-page record movement and Grid/Cards.
This presentation correction adds no API/schema/native UI or translation key.

D24 supersedes the D23 footer presentation: one native arrow set and one
record/total indicator; no page report/links/second arrow group. The shared size
selector uses templateRight and the controller preserves server paging. See
verification/SINGLE_NAVIGATION_REVIEW.md for source and current eight-case proof.

D25 current acceptance: the native record navigator is centered; the size/pages
metadata belongs at the logical edge. Compact controls use native small size and
generic centered-value Pass Through; text center offsets measured0px on both
axes in all eight current browser cases. Unchanged focus revalidation preserves
Session identity, loaded rows and draft consent. The same driver observes zero
loading transitions/refetches on focus and first blank/row clicks. Full Angular
61files/362tests and build passed. Hosted focus acceptance remains PROD-019; see
verification/SINGLE_NAVIGATION_REVIEW.md and the company-context correction book.
