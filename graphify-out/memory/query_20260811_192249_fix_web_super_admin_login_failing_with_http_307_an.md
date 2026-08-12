---
type: "query"
date: "2026-08-11T19:22:49.132059+00:00"
question: "Fix web super-admin login failing with HTTP 307 and React minWidth DOM warning on the tenant dashboard."
contributor: "graphify"
outcome: "useful"
source_nodes: ["SuperAdminLoginButton()", "proxy()", "TenantDashboardPage()"]
---

# Q: Fix web super-admin login failing with HTTP 307 and React minWidth DOM warning on the tenant dashboard.

## Answer

Expanded from graph vocabulary: [login, super, admin, auth, request, status, redirect, proxy, session, token, route, error]. The Next API proxy posted to BACKEND_URL=http://localhost:5293 with redirect manual, while ASP.NET Core unconditionally called UseHttpsRedirection, so login POSTs were returned as 307 instead of reaching AuthController. Program.cs now enables HTTPS redirection only outside Development, preserving production HTTPS while matching the documented local HTTP setup. The isolated Development API returned 400 for an invalid probe instead of 307, and the live Next proxy returned 200 for the real super-admin login. TenantDashboardPage and TenantManagementPage also moved MUI v9 layout props such as minWidth, fontWeight, gap, mt, py, alignItems and justifyContent into sx; TypeScript and targeted ESLint pass, and no legacy props remain.

## Outcome

- Signal: useful

## Source Nodes

- SuperAdminLoginButton()
- proxy()
- TenantDashboardPage()