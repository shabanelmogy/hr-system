# Contacts web client documentation

Current foundation scope: **Excluded**. Party API revision/RBAC changes do not
add a web workflow. Before enabling one, the feature must provide permission-aware
views and send the last observed `revision` as `expectedRevision` on updates,
with explicit 409 conflict recovery through shared feedback components.

The module has no generated Next.js routes, pages, hooks, or API clients yet;
the web surface is **not implemented**. A future feature must document its
route, server/client boundary, loading/error/empty states, permissions,
localization, and verification before release.
