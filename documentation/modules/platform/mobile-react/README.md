# Platform mobile client documentation

Platform User Administration is implemented in the Administration navigation
surface. Its repository is online-authoritative and validates the bounded user
collection before presentation. The user response accepts only the public
lifecycle values `active` and `archived`; internal numeric Identity values are
rejected at the remote boundary.

Role Permissions consumes the API-owned `moduleCode` and keeps the P-006
screen-first disclosure cards inside the selected business module. Tablets use a
two-column Modules rail plus permission panel; phones use a horizontally scrollable
module selector above the same cards so touch targets and text scaling are not
compressed. The module selector has its own bilingual translated-name/code search,
separate from screen/permission search. Module changes reset only presentation
filters/expansion; all edited
claim values remain in the single form until the explicit online-authoritative
replace-set save succeeds. The role heading is one line and the former summary Hero
is a single compact status row containing selected/total coverage and pending-change
state; it does not repeat descriptive text or reserve progress-bar space.

Administration route visibility follows the API resource being read. Invitations
requires `UserInvitations:View`; users with that claim can read invitations
without inheriting `Users:View`. Creating an invitation additionally requires
`UserInvitations:Create`, `Users:View`, and `Roles:View`, and the company/role
queries stay disabled when that combined capability is absent. Offline Operations
requires `OfflineOperations:View`, while every mutation control and handler also
requires `OfflineOperations:Edit` and tenant write availability.

Future Platform features must record native offline, retry, accessibility,
localization, permission, and device decisions instead of assuming Web behavior
can be reused.
