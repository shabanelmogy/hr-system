# Accounting Manual Acceptance Scenario Template

## 1. Purpose and authority

Use this template after every executable Accounting feature step in the ordered
roadmap. It is the mandatory user-operated gate between completed API/Web/Mobile
evidence and the next feature. Automated tests, source review, or an agent-run
smoke test do not replace this gate.

The implementation agent prepares the environment and sends a completed copy of
this scenario. The user runs or directly supervises the manual journey and then
records one explicit decision: `Accepted`, `Rejected`, or `Retest required`.
Silence, an unavailable environment, partial execution, or a passing automated
suite is never interpreted as acceptance.

## 2. Scenario identity

| Field | Required value |
| --- | --- |
| Plan / slice | Canonical plan ID and exact slice |
| Step / feature | Ordered step number, Feature ID, Arabic name, and English name |
| Scenario version | Date plus a revision number |
| Source version | Commit/branch or an exact dirty-worktree description |
| Environment | API, Web, database, tenant/company, and Mobile build identifiers |
| Tester | User or named supervised tester |
| Execution time | Start and finish timestamps with timezone |
| Result | `Pending`, `Accepted`, `Rejected`, `Retest required`, or `Blocked` |

Do not record passwords, access tokens, connection strings, personal data, or
other secrets in the scenario or its evidence.

## 3. Scope and completion boundary

State exactly what is being accepted, which dependent capability is intentionally
outside the step, and the next step that will remain queued until acceptance.
List every Required, Deferred, and Excluded platform surface from the feature's
Screen/Workflow Contract. A Deferred or Excluded surface must not have a false or
non-functional runtime control.

## 4. Environment readiness owned by the implementation agent

Before asking the user to test, the implementation agent must record:

- the API, Web, and Mobile versions use the same contract and database;
- the required EF migration is applied and no pending model change exists;
- API health, authentication, tenant membership, current-company context, and
  module/subscription entitlement work;
- the Web application is reachable on a supported desktop browser;
- the Mobile application is installed or running on an actual supported device;
- server time/timezone, locale, and test company are known;
- focused automated checks and documentation gates have passed, or every inherited
  failure is separated from the feature result;
- the test can be performed in a disposable database/company, or retained test
  records have an approved naming and cleanup policy.

If any mandatory prerequisite is unavailable, mark the scenario `Blocked`; do not
ask the user to treat skipped coverage as passed.

## 5. Required test identities and authorization matrix

Prepare accounts without exposing their credentials in the document:

| Identity | Required access | What it proves |
| --- | --- | --- |
| Full-access tester | Exact View/Create/Edit/Delete/lifecycle permissions for the step | Complete positive journey |
| View-only tester | View permission only | Mutations are absent/blocked in both clients and rejected by the API |
| Denied tester | No feature View permission | Navigation, direct route, and API fail closed |
| Read-only subscription tester | Permissions may exist but tenant/subscription is read-only | Every mutation is suppressed or blocked |
| Second-company tester/context | Same tenant, another company when the feature is company-scoped | No cross-company data leakage |

Add any feature-specific approval, segregation-of-duties, report, or platform role.
For each identity, record the expected navigation visibility, page behavior, and
direct API result.

## 6. Deterministic test data

Define all input values before the run. Include a unique suffix, both `NameAr` and
`NameEn` whenever the entity is named, dates/timezone, codes, parent/child links,
amounts/currencies, and the expected calculated or generated values. Keep separate
fixtures for journeys whose lifecycle prevents cleanup.

The data table must state:

| Fixture | Field values | Intended journey | Final state / cleanup |
| --- | --- | --- | --- |
| Positive fixture | Exact valid bilingual values | Create/edit/view/list/lifecycle | Exact retained or cleaned state |
| Validation fixture | Exact invalid values | Field and server validation | Must not persist |
| Conflict fixture | Valid values loaded in two sessions | Stale RowVersion or equivalent conflict | Reload authoritative state |
| Isolation fixture | Valid values in Company A | Verify invisibility in Company B | Exact retained or cleaned state |

Mock-data actions are tested separately: they may populate realistic local fields,
but must never submit automatically or invent identity, scope, RowVersion, approval,
or server success.

## 7. Automated evidence summary

Record the command, result, date, and evidence link for the narrow feature tests,
API build/tests, Web type/architecture/tests, Mobile checks, migration state,
documentation generation/check, and `git diff --check`. This section establishes
readiness only; it is not the user's acceptance result.

## 8. Manual journey format

Every manual case uses this table:

| Case | Platform / identity | Preconditions | Exact action and input | Expected visible result | Expected server/data result | Evidence | Actual result |
| --- | --- | --- | --- | --- | --- | --- | --- |

Write atomic numbered actions. Name the route/screen, control, entered value,
confirmation, expected status/message, persisted data, and evidence to capture.
Avoid instructions such as "test CRUD" or "make sure it works".

## 9. Mandatory Web coverage

Run the applicable cases in both English/LTR and Arabic/RTL, at a desktop viewport
and a narrow/compact viewport:

1. route discoverability and direct-route permission behavior;
2. initial loading, background refresh, default empty, filtered empty, retryable
   error, and forbidden/read-only states;
3. approved PageHeader, toolbar, search/filter/sort, Grid and/or Cards, server
   paging, result count, and reset behavior;
4. create, edit, view/detail, archive/restore or the documented lifecycle
   alternative, including dependent/structured data;
5. shared form validation with Save/Create kept available, a message beneath every
   invalid field, and focus moved to the first invalid field;
6. unsaved-change protection and shared confirmation dialogs, with no browser
   native validation, `alert`, or `confirm` UI;
7. stale-write/concurrency reload, authoritative server errors, and no false
   success notification;
8. responsive scroll ownership, keyboard navigation, focus, accessible control
   names, and no clipped LTR/RTL content;
9. all Required optional views work; Deferred/Excluded views have no placeholder;
10. realtime or cross-session refetch where required by the feature contract.

## 10. Mandatory Mobile coverage

Run on an actual device, not only a unit test or static source review. Record device,
OS, build, connection, and screen size. Test English/LTR and Arabic/RTL and both
light/dark themes where supported:

1. guarded route/navigation, loading/empty/error/retry/read-only states;
2. approved AppListScreen/Table/Cards/detail/form composition and server paging;
3. create/edit/view and every required lifecycle action;
4. software keyboard, first-error focus, touch targets, safe areas, scrolling, and
   long Arabic/English text;
5. device-back and gesture dismissal with dirty-form protection;
6. portrait and landscape, plus phone/tablet when the feature contract requires it;
7. online-only mutation behavior, disconnected attempt, reconnect/refetch, and no
   offline success synthesis or unauthorized queued financial mutation;
8. stale-write/concurrency recovery and authoritative data reload;
9. permission, read-only, company-scope, and report/entitlement behavior;
10. realtime or cross-device refresh where required.

## 11. API, security, and data-integrity checks

Include manual or inspected network/database evidence for:

- versioned route, HTTP status, stable ProblemDetails/error code, and localized
  user-facing message;
- authenticated tenant/company scope derived by the server; the client must not be
  able to submit or select another scope identifier;
- missing View permission, missing mutation permission, and read-only subscription;
- duplicate/overlap/dependency/business-rule failures with no partial write;
- stale concurrency token with a deterministic conflict and safe reload;
- company/tenant isolation for list, detail, lookup, report, and realtime events;
- audit/outbox/realtime effects only after commit where applicable;
- no secrets or excessive sensitive payloads in UI errors, logs, or evidence.

## 12. Bilingual data and UI acceptance

For every named business object:

- create distinct meaningful Arabic and English names;
- verify neither value is copied over or lost during create, edit, reload, lifecycle,
  search, list, Cards, detail, report, and Mobile journeys;
- search explicitly by the Arabic name and separately by the English name;
- verify the current locale displays the intended primary name and a documented
  fallback without overwriting persisted data;
- verify all visible UI text, validation, confirmations, status chips, empty/error
  messages, and action labels are translated;
- verify RTL changes direction and layout behavior, not only the language string.

## 13. Five-point UI and pattern audit

Record `Pass`, `Fail`, `Blocked`, or `N/A with contract reason` for Web and Mobile:

1. **Creation Journey:** all fields and structured child data have dedicated UI;
2. **Editing Journey:** persisted collections/relationships load and edit without
   data loss;
3. **Viewing Journey:** structured information uses the approved detail, table,
   badges, chips, sections, or accordions;
4. **Listing & Filtering:** new states/flags appear in approved Grid/Table/Cards
   and server criteria;
5. **Mock Data Generator:** realistic bilingual structured values are generated
   locally without automatic persistence.

Also compare the rendered screen at matching viewports with the exact reviewed
reference named in the Screen/Workflow Contract. Record every intentional
difference; an unexplained difference is a regression.

## 14. Cleanup and retained evidence

State the cleanup action for each fixture. Never destructively remove financial
history merely to make a test environment look clean. If the domain permits only
archive/void/reversal, use that lifecycle and retain the audit trail. If a fixture
cannot be safely cleaned, run it in a disposable company/database or label it with
the approved test prefix and document the retained final state.

Capture only the minimum evidence needed:

- screenshot/screen recording identifiers, platform, locale, and case number;
- request/correlation ID and sanitized ProblemDetails where useful;
- before/after row status, audit/outbox evidence, and report identifier when needed;
- defect ID, exact reproduction steps, severity, and expected behavior for failures.

Redact tokens, credentials, connection strings, and unrelated personal/business data.

## 15. Result and explicit user decision

Summarize every case:

| Case range | Passed | Failed | Blocked | Not run | Evidence reference |
| --- | ---: | ---: | ---: | ---: | --- |

Then record one decision exactly:

```text
Decision: Accepted | Rejected | Retest required | Blocked
User confirmation: <verbatim user message>
Accepted step: <step number and bilingual feature name>
Authorized next step: <step number and bilingual feature name, or NONE>
Decision date/time: <timestamp and timezone>
Known accepted limitations: <central note IDs only, or NONE>
```

Suggested acceptance message:

```text
أوافق على إغلاق خطوة <رقم الخطوة — الاسم العربي / English name>
والانتقال إلى <رقم الخطوة التالية — الاسم العربي / English name>.
```

The implementation agent must not fill in or paraphrase the user confirmation.
Only the user's explicit message authorizes Phase 06 `Verified`, documentation
closure, and activation of the named next step.

## 16. Failure and retest rule

On any failure:

1. keep the current feature `Active` and the next feature `Queued` or `Blocked`;
2. record the failed case and evidence without changing it to pass;
3. diagnose and correct only the authorized current feature;
4. rerun the relevant automated evidence;
5. send a versioned retest scenario containing the failed case, impacted regression
   cases, changed build/source version, cleanup, and expected outcome;
6. wait for a new explicit user decision.

