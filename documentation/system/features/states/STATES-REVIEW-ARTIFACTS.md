# States Review Artifacts

## Metadata

| Field | Value |
| --- | --- |
| Feature | States |
| API route | `/api/v1/states` |
| Web route | `/basic-data/states` |
| Mobile route | `/basic-data/geographical-information/states` |
| Required manifest | `documentation/system/features/states/required-files.json` |
| Canonical review | `documentation/project/STATES_FEATURE_FULL_REVIEW.md` |

## Phase evidence

| Phase | Result | Evidence |
| --- | --- | --- |
| 00 Discovery | Complete | Legacy API/browser audit and missing Expo feature recorded in the master review. |
| 01 Domain/API | Complete | CQRS controller, contracts, stores, lifecycle job, localization, and focused tests. |
| 02 Web | Complete | One server-list controller, shared toolbar/Grid Options, dialogs, form, Grid/Card/Chart modes, and Crystal Report viewer integration. |
| 03 Mobile | Complete | Guarded route, runtime schemas, controlled list, search controls, form, modes, lifecycle actions. |
| 04 Lifecycle | Complete | Country-active and District-active rules are enforced before commit; bulk is atomic. |
| 05 Runtime | Complete | `states` realtime invalidation and direct notification route mapping are registered. |
| 06 Reconciliation | Pending final verification commands and manual visual/device matrix. |

## State-specific decisions

| Concern | Decision |
| --- | --- |
| Parent relation | Country is required and must be active for create/update/restore. |
| Child relation | Active Districts block archive and bulk archive. |
| Search | State names, code, and Country name only; no Countries alpha/phone/currency fields. |
| Bulk creation/import | Not implemented; State requires a valid parent Country and no State bulk-create API contract exists. |
| Browser report | Crystal viewer catalog and generation contract are ready. The checked-in States report slot is empty, so browser Report mode shows a localized unavailable state until the owner adds a valid State `.rpt`. |
| Mobile report | Current-page summary only until an Expo Crystal PDF viewer/download/share workflow is implemented. |
| Charts | Required current-page view using the shared criteria and pagination; page scope is explicit. Global analytics remains excluded without an aggregate endpoint. |

## Open findings

| ID | Priority | Finding | Required follow-up |
| --- | --- | --- |
| S-F01 | P2 | The legacy `IStateService`/State service/old job remain compiled but are not used by the CQRS controller. | Remove only in a dedicated compatibility audit once all consumers are migrated. |
| S-F03 | Owner action | The State Crystal report template is intentionally not tracked in source. | Add a valid `.rpt` whose filename starts with `States` to the deployment-owned `Reports/States` folder on the Crystal host; the catalog and report contract will pick it up. |
| S-F04 | Release gate | Automated checks cannot replace browser/device visual testing. | Execute the master review matrix before release. |

## Resolved findings

| ID | Resolution |
| --- | --- |
| S-F02 | The State Chart is registered in the multi-view page, shares server criteria and pagination, states its current-page scope, and obsolete orphan-only chart helpers were removed. |

## Completion checklist

- [ ] API full tests/build complete.
- [ ] Web architecture/type/lint/tests/build complete.
- [ ] Mobile check complete.
- [ ] Documentation and link validation complete.
- [ ] `git diff --check` complete.
- [ ] Browser/device matrix recorded.
