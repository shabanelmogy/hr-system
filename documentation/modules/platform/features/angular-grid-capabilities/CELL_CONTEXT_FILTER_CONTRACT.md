# Bounded cell context filter — 2026-10-30

User D28 requests a general reusable context menu, initially filtering a column by
the value of the cell where it is opened. This is an authorized bounded extension
of existing S1-A14; it does not close the remaining complete Table matrix.

Ownership: Shared ContextMenuPanel owns native PrimeNG menu rendering, items,
commands, body append, theme, keyboard and focus return. MyDataGrid owns captured
current source/row/column/value and emits the existing controlled filtersChange.
Features supply their column/filter contracts and optional raw filterValue accessor;
they retain server query/permission ownership. No new API/schema/domain/native work.

Reuse the existing PrimeNG ContextMenu and current row-action menu, strict
GridFilters parsing and advanced-filter adapter. Consulted current MCP ContextMenu
API/command example before runtime. Native context menu must remain opaque/themed
and bounded at390/1440; native arrow/Enter/Escape behavior retained. Existing column
filter menus remain an accessible keyboard alternative for entering exact values.

Only columns declaring a valid filter participate. Use equals for text/number/boolean
and dateIs for canonical YYYY-MM-DD dates, and only if the definition allows that
mode/value. Preserve0/false without truthiness coercion. Null/undefined/blank,
unsupported/custom values and disallowed exact modes do not create an invalid rule.
Formatted values require explicit filterValue; never guess localized numbers/dates
or derive a filter from rendered HTML. Replacing this column's group with one exact
condition preserves other columns and toolbar criteria; owner resets to page1 and
queries server, never filters only the current remote page. No mutation request.

Capture the exact immutable source snapshot, row reference and column/value at
opening. Reject callbacks after scope/page/criteria/refresh/row/column replacement
or loss of ready state. Recheck eligibility and current allowed mode before emit.
Retain existing authorized row actions without allowing action-ID collisions with
the built-in filter. Close stale overlays and preserve source/action permissions.

Required checks: pure typed filter merging/value/limit cases, current/stale menu
callbacks and generic menu eligibility; full Angular check; actual Countries cell
right-click → native command → server criterion/first-page request/native filter
menu synchronization, retained other criteria,0/false/date mapping and unsupported
null behavior, EN/AR/light/dark/390/1440, native keyboard/Escape and current row-action
regression. All business writes remain intercepted synthetic fixtures. Full Table
benchmark/source matrix and host publication remain FOLLOW-016/PROD-019, not accepted
by this bounded enhancement. Phase06 complete-matrix status remains Not Verified.
