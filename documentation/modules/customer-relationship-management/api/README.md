# CustomerRelationshipManagement API documentation

## Verified foundation

The module owns its API layer and exposes it through the Presentation project.
The generated scaffold has no controllers, routes, handlers, or public DTOs;
those surfaces are **not implemented** yet.

When a feature is added, document the exact route, authorization policy,
request/response envelope, validation, errors, paging/sorting, and tests here
or in a linked feature book. Cross-module communication uses Contracts/events,
never another module's Infrastructure or EF model.