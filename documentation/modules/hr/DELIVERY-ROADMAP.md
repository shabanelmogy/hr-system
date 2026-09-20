# HR delivery roadmap

Use the shared status vocabulary: Foundation, Required, Planned, Deferred, and
Excluded. Only source and test evidence can promote a capability to implemented.

## Foundation (verified)

- Canonical six-project module boundary and explicit host registration.
- `hr` schema ownership, schema migration, and module migration history.
- Existing geographical/reference-data documentation remains linked from its
  established canonical paths.

## Required / in progress

Keep feature-specific scope and gates in the corresponding canonical review and
API/web/mobile books. A roadmap line alone is not runtime evidence.

## Planned

- Complete HR vertical slices with one reviewed contract across API, web, and
  mobile where each platform is required.
- Record employee, organization, attendance, and hiring ownership decisions in
  module feature books before implementation.
- Publish cross-module contracts only for explicitly approved consumers; this
  roadmap does not define the future business-module plan.

For every slice, begin with a reuse inventory of BuildingBlocks and HR-local
abstractions. Record reused, extended, rejected, and newly module-local pieces
in the feature evidence before implementation.

## Deferred or excluded

Classify each optional report, import, workflow, and client surface explicitly
in its feature evidence. Do not use a copied HR reference as a global ERP
requirement.

## Future product boundary

The public Job Portal is a planned independent module and is not an HR screen
or a new HR persistence surface. HR remains the owner of Candidate profile/link,
EmploymentApplication, requisition/job posting/opening, interview, offer, and
hire lifecycle. JobPortal owns only public vacancy projection/search/index,
tenant-branded channel content, saved jobs/alerts/preferences, draft application
UX, and public/employer BFF read models. Submit calls an HR Contract
idempotently; tenant/company comes from approved publication and host/channel.

It starts only after Recruitment public contracts, privacy/consent rules, and
Phase 00 feature evidence are reviewed. This stream is independent of
Accounting and Inventory. Platform owns the external auth principal.

Commerce, Sales, Procurement, storefront, checkout, and fulfillment remain
Excluded from HR. If a future integration is required, document a narrow
Contracts/Events boundary and keep the source of truth in the owning module.
