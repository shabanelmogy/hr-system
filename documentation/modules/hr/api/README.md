# HR API documentation

The HR Presentation project owns HR routes and controller application parts;
Application owns handlers and validation, while Infrastructure owns persistence.
The host does not own HR endpoints.

Current endpoint contracts are documented in the canonical API profiles linked
from [the module index](../README.md). Before adding or moving a route, record
authorization, request/response envelope, validation, errors, paging/sorting,
and tests in the owning feature book. Cross-module calls use Contracts/events,
not another module's database or Infrastructure assembly.
