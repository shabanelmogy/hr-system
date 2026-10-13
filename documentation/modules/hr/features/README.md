# HR feature catalog

This index lists HR features. Each feature's books live in its folder below;
a link is an evidence location, not a claim that every platform surface is
implemented. Add or change an entry only with a reviewed cross-project
contract and exact required-file evidence.

Geography and address features (Countries, States, Districts, Address types,
Addresses) belong to General Data — see [reference-data](../../reference-data/features/README.md).
Company geographic scope belongs to [Platform](../../platform/features/README.md)
and Fiscal years to [Accounting](../../accounting/features/README.md).

| Feature | Cross-project review | API | Web | Mobile |
| --- | --- | --- | --- | --- |
| Attendance devices | [review](attendance-devices/attendance-devices-review.md) | [API](attendance-devices/attendance-devices-api.md) | [web](attendance-devices/attendance-devices-web.md) | [mobile](attendance-devices/attendance-devices-mobile.md) |
| Organizational structure | [review](organizational-structure/organizational-structure-review.md) | [API](organizational-structure/organizational-structure-api.md) | [web](organizational-structure/organizational-structure-web.md) | [mobile](organizational-structure/organizational-structure-mobile.md) |
| Workforce planning | [review](workforce-planning/workforce-planning-review.md) | [API](workforce-planning/workforce-planning-api.md) | [web](workforce-planning/workforce-planning-web.md) | [mobile](workforce-planning/workforce-planning-mobile.md) · [Phase 02 budgets/envelopes](workforce-planning/PHASE-02-BUDGETS-ENVELOPES-IMPLEMENTATION.md) |
| Recruitment | [review](recruitment/recruitment-review.md) | [domain design](recruitment/recruitment-domain-design.md) — API implemented (9 controllers under `api/v1/recruitment/*`); profile pending | [web](recruitment/recruitment-web.md) | [mobile](recruitment/recruitment-mobile.md) |

Recruitment's API is implemented (requisitions, openings, postings, candidates,
applications, interviews, offers, dashboard, settings); its API profile book is
still to be written, so the API column points to the domain design. Recruitment
is not yet registered in the recipe manifest. Every other row still requires checking its required-file manifest
before claiming a complete platform implementation.

Use `documentation/system/` for phase recipes and generated packets. Keep
module-specific decisions here or in a linked canonical feature book; never
duplicate shared rules by hand.

## Feature folders

Every file of a feature lives in its folder. Generated phase packets are
never edited by hand.

| Feature | Files |
| --- | --- |
| `attendance-devices` | [Review](attendance-devices/attendance-devices-review.md) · [API](attendance-devices/attendance-devices-api.md) · [Web](attendance-devices/attendance-devices-web.md) · [Mobile](attendance-devices/attendance-devices-mobile.md) · [Request](attendance-devices/attendance-devices-request.md) · [Evidence](attendance-devices/attendance-devices-evidence.md) · [ATTENDANCE_SITE_AGENT_RUNBOOK](attendance-devices/ATTENDANCE_SITE_AGENT_RUNBOOK.md) · [SOURCE-REQUEST_AR](attendance-devices/SOURCE-REQUEST_AR.md) · packets: [00](attendance-devices/generated/PHASE-00-discovery-evidence.md) [01](attendance-devices/generated/PHASE-01-domain-api.md) [02](attendance-devices/generated/PHASE-02-web-client.md) [03](attendance-devices/generated/PHASE-03-mobile-client.md) [04](attendance-devices/generated/PHASE-04-domain-actions.md) [05](attendance-devices/generated/PHASE-05-integration-runtime.md) [06](attendance-devices/generated/PHASE-06-final-reconciliation.md) |
| `organizational-structure` | [Review](organizational-structure/organizational-structure-review.md) · [API](organizational-structure/organizational-structure-api.md) · [Web](organizational-structure/organizational-structure-web.md) · [Mobile](organizational-structure/organizational-structure-mobile.md) · [Request](organizational-structure/organizational-structure-request.md) · [Evidence](organizational-structure/organizational-structure-evidence.md) · packets: [00](organizational-structure/generated/PHASE-00-discovery-evidence.md) [01](organizational-structure/generated/PHASE-01-domain-api.md) [02](organizational-structure/generated/PHASE-02-web-client.md) [03](organizational-structure/generated/PHASE-03-mobile-client.md) [04](organizational-structure/generated/PHASE-04-domain-actions.md) [05](organizational-structure/generated/PHASE-05-integration-runtime.md) [06](organizational-structure/generated/PHASE-06-final-reconciliation.md) |
| `recruitment` | [Review](recruitment/recruitment-review.md) · [Web](recruitment/recruitment-web.md) · [Mobile](recruitment/recruitment-mobile.md) · [recruitment-domain-design](recruitment/recruitment-domain-design.md) |
| `workforce-planning` | [Review](workforce-planning/workforce-planning-review.md) · [API](workforce-planning/workforce-planning-api.md) · [Web](workforce-planning/workforce-planning-web.md) · [Mobile](workforce-planning/workforce-planning-mobile.md) · [Request](workforce-planning/workforce-planning-request.md) · [Evidence](workforce-planning/workforce-planning-evidence.md) · [PHASE-02-BUDGETS-ENVELOPES-IMPLEMENTATION](workforce-planning/PHASE-02-BUDGETS-ENVELOPES-IMPLEMENTATION.md) · [WORKFORCE_PLANNING_TO_HIRE_V1_IMPLEMENTATION_PLAN](workforce-planning/WORKFORCE_PLANNING_TO_HIRE_V1_IMPLEMENTATION_PLAN.md) · [WORKFORCE_PLANNING_V1_ALL_PHASES_REVIEW_GUIDE](workforce-planning/WORKFORCE_PLANNING_V1_ALL_PHASES_REVIEW_GUIDE.md) · packets: [00](workforce-planning/generated/PHASE-00-discovery-evidence.md) [01](workforce-planning/generated/PHASE-01-domain-api.md) [02](workforce-planning/generated/PHASE-02-web-client.md) [03](workforce-planning/generated/PHASE-03-mobile-client.md) [04](workforce-planning/generated/PHASE-04-domain-actions.md) [05](workforce-planning/generated/PHASE-05-integration-runtime.md) [06](workforce-planning/generated/PHASE-06-final-reconciliation.md) |
