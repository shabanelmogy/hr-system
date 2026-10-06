# Platform web client documentation

Platform User Administration is implemented under the Administration users route.
The page uses a server-managed paged query, the Platform user service boundary,
and strict response parsing before data reaches the grid. The user response accepts
only the public lifecycle values `active` and `archived`; internal numeric Identity
values are never a client compatibility fallback.

Role Permissions uses P-006 as a module-first master/detail editor. The API-owned
`moduleCode` builds a logical Modules rail; selecting Accounting, HR, CRM,
Administration, or another installed owner filters the existing vertical screen
accordions without discarding hidden edits. At `md` and above the rail and screen
panel are two columns; narrower Web layouts stack the same module list above the
unchanged screen-first editor. The module rail has an independent bilingual search
by translated name or module code. Its header uses the same padding, typography,
vertical rhythm, and shared field size as the screen/permission filter header, so
its helper is deliberately one short translated line and all four controls — module
search, screen/permission search, screen filter, and selection toggle — share one
horizontal baseline on desktop. On desktop the rail is
`320px` wide and module labels wrap instead of truncating. The former Hero is a single low-height status
strip: edit/read-only state, selected/total coverage, and pending changes only; it
must not duplicate the page title, render metric cards, or reserve progress-chart
space. At `md` and above the route uses the Shell fixed-height contract: the page
body does not scroll, the default pagination renders five screens, pagination stays
visible, and only the screen/module list owns bounded overflow when an expanded
screen or a larger user-selected page size exceeds the available panel. Narrow Web
layouts retain normal page scrolling. Screen search/filtering, pagination, read-only
behavior, dirty protection, bulk selection, and full replace-set save remain in
the current feature controller.

Administration route visibility follows the API resource that the screen reads.
Invitations requires `UserInvitations:View`, not `Users:View`, while the Create
action additionally requires `UserInvitations:Create`, `Users:View`, and
`Roles:View` because its form loads company and role options from separately
protected endpoints. Offline Operations requires `OfflineOperations:View` to
open and `OfflineOperations:Edit` to change policy. Sidebar metadata, route
policies, page actions, and controller attributes must remain aligned.

Future Platform features must document their route, server/client boundary,
loading/error/empty states, permissions, localization, and verification before
release.
