# HR API documentation

The HR Presentation project owns HR routes and controller application parts;
Application owns handlers and validation, while Infrastructure owns persistence.
The host does not own HR endpoints.

Current endpoint contracts are documented in the canonical API profiles linked
from [the module index](../README.md). Before adding or moving a route, record
authorization, request/response envelope, validation, errors, paging/sorting,
and tests in the owning feature book. Cross-module calls use Contracts/events,
not another module's database or Infrastructure assembly.

Platform owns identity, authentication, tenant/company/membership, session, and
entitlement persistence in `PlatformDbContext` and the `platform` schema. HR
consumes Platform through public Contracts and never maps or queries Platform
tables. ReferenceData and Reporting are separate owners for geography and
reporting data; HR uses their public contracts where needed.

HR `ApplicationDbContext` contains only HR entities and applies its own tenant
and company filters. Pre-authentication and cross-module checks are implemented
inside Platform with explicit query-filter bypasses only where the platform
administrator workflow requires them. Subscription status conversion and
membership/session reads are covered by SQL integration tests at the Platform
boundary.
