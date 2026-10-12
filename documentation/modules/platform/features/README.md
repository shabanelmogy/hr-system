# Platform feature catalog

This is the module-owned feature index. Keep one entry per vertical slice and
link to its reviewed API, web, mobile, and cross-project evidence. Do not copy
the shared phase rules or generated packets; use documentation/system/ as the
single source for the documentation workflow.

| Feature | Status | Evidence |
| --- | --- | --- |
| User Administration | Implemented | Platform `UsersController`, CQRS user queries/commands, scoped persistence stores, Web users route, Mobile Administration screen, and cross-client response-contract tests |
| Role Administration and Permissions | Implemented | Platform role CQRS/controllers and module-catalog ownership metadata, Web module-first P-006 editor, Mobile responsive module selector plus screen cards, and API/Web/Mobile contract/presentation tests |
| Company Geographic Scope | Implemented | [review](../../../project/COMPANY_GEOGRAPHIC_SCOPE_FEATURE_FULL_REVIEW.md) · [API](../../../api/CompanyGeographicScope_API_Implementation_Profile.md) · [web](../../../web-next/features/company-geographic-scope-frontend-reference.md) · [mobile](../../../mobile-react/company-geographic-scope-mobile-reference.md) |

Add further entries only when the corresponding runtime and verification evidence
exists, and mark future ideas as Planned or Deferred.
