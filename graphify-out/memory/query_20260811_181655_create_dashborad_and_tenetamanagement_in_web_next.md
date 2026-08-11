---
type: "query"
date: "2026-08-11T18:16:55.686631+00:00"
question: "create dashborad and tenetamanagement in web-next and mobile"
contributor: "graphify"
outcome: "useful"
source_nodes: ["TenantDashboardPage()", "TenantDashboardScreen()"]
---

# Q: create dashborad and tenetamanagement in web-next and mobile

## Answer

Expanded from original query via graph vocabulary: [dashboard, tenant, tenants, management, navigation, route, routes, mobile, web, admin, metrics, summary]. Implemented a shared-data super-admin dashboard in web-next and mobile-react. Web now has /super-admin, sidebar access, super-admin landing behavior, tenant summaries, subscription distribution, account capacity, expiring subscriptions, and recent tenants. Mobile now has /super-admin-dashboard with matching metrics, drawer/home access, and super-admin landing behavior. Both dashboard and tenant management routes are restricted to super_admin, include English and Arabic labels, and reuse the tenant API/query with 10-second refresh so changes converge across clients. No builds or tests were run at the user's request.

## Outcome

- Signal: useful

## Source Nodes

- TenantDashboardPage()
- TenantDashboardScreen()