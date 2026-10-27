# Error logs — Pre-plan specification (Draft)

Owner: Platform. Requester has authorized feature addition and confirmed separate
Super Admin/company visibility. DEC-023/DEC-022 remain open; this document is not
Implementation Ready and no runtime scaffold is authorized by its existence.

Target journey: open Error logs, choose time range/user and advanced filters,
refresh bounded server results, open grouped user/action/error details, and export
allowed filtered data to Excel. Use EN/AR, RTL and the existing shared list/detail
systems on Web and Mobile. No create/edit/import UI is requested.

System administrators see system-wide diagnostics. Company users require exact
independent permissions and see only their active company's sanitized projection;
never raw stack traces or company selectors that expand their authority.
Proposed permission actions are ErrorLogs:View, ErrorLogs:ViewDetails and
ErrorLogs:Export, subject to the final permission matrix and current Super Admin
policy. Capture is internal, not a public arbitrary-log-write endpoint.

Date/time, actor, module/service/action, elapsed duration, origin/client,
correlation ID, safe error classification and sanitized message are target fields.
Full technical frames are system-only; request parameters/custom data follow an
explicit allowlist. Raw bodies, tokens, cookies, credentials and connection strings
are not implied by the screenshot. Exact field limits, source labels, retention,
query bounds and export limits are finalized after discovery.

Required source breadth and retention remain user decisions. Runtime implementation
follows the documented plan/slice gates after those blocking decisions resolve.
