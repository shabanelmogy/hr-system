# Platform web client documentation

Platform User Administration is implemented under the Administration users route.
The page uses a server-managed paged query, the Platform user service boundary,
and strict response parsing before data reaches the grid. The user response accepts
only the public lifecycle values `active` and `archived`; internal numeric Identity
values are never a client compatibility fallback.

Future Platform features must document their route, server/client boundary,
loading/error/empty states, permissions, localization, and verification before
release.
