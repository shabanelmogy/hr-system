# Platform feature catalog

This is the module-owned feature index. Keep one entry per vertical slice and
link to its reviewed API, web, mobile, and cross-project evidence. Do not copy
the shared phase rules or generated packets; use documentation/system/ as the
single source for the documentation workflow.

| Feature | Status | Evidence |
| --- | --- | --- |
| User Administration | Implemented | Platform `UsersController`, CQRS user queries/commands, scoped persistence stores, Web users route, Mobile Administration screen, and cross-client response-contract tests |

Add further entries only when the corresponding runtime and verification evidence
exists, and mark future ideas as Planned or Deferred.
