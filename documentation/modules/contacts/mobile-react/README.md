# Contacts mobile client documentation

Current foundation scope: **Excluded**. Party API revision/RBAC changes do not
add a mobile workflow. A future screen must retain the last observed revision,
send `expectedRevision`, and handle 409 conflicts without silently overwriting
newer server data. Offline conflict behavior requires its own feature decision.

The module has no generated Expo/React Native screens, navigation entries, or
mobile API client yet; the mobile surface is **not implemented**. Record native
offline, retry, accessibility, localization, and permission decisions for each
future feature instead of assuming web behavior can be reused.
