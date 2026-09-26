# Platform mobile client documentation

Platform User Administration is implemented in the Administration navigation
surface. Its repository is online-authoritative and validates the bounded user
collection before presentation. The user response accepts only the public
lifecycle values `active` and `archived`; internal numeric Identity values are
rejected at the remote boundary.

Future Platform features must record native offline, retry, accessibility,
localization, permission, and device decisions instead of assuming Web behavior
can be reused.
