---
type: "query"
date: "2026-08-11T18:26:28.622140+00:00"
question: "super admin will not see other tenant details it will be to admin tenant only"
contributor: "graphify"
outcome: "useful"
source_nodes: ["TenantMemberAttribute", "getNavigationConfig()", "canAccessRoute()"]
---

# Q: super admin will not see other tenant details it will be to admin tenant only

## Answer

Expanded from original query via graph vocabulary: [tenant, admin, authorization, permission, role, route, navigation, company, user, scope, session, filter]. Enforced platform/tenant separation. A super_admin can access only the platform tenant dashboard, tenant subscription management, and personal profile/settings; web and mobile hide tenant modules and direct-route guards reject them. Added a TenantMember API policy that explicitly rejects super_admin and requires admin or user, then applied it to all tenant-domain controllers. The existing EF Core tenant/company query filters continue restricting tenant records to the signed-in tenant administrator's tenant and selected company. Aggregate tenant counts and subscription/contact metadata remain visible to super_admin, but individual users, roles, HR records, files, reports, appointments, and tenant notifications do not. Builds and tests were not run at the user's request.

## Outcome

- Signal: useful

## Source Nodes

- TenantMemberAttribute
- getNavigationConfig()
- canAccessRoute()