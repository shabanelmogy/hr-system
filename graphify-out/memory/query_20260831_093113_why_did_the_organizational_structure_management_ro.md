---
type: "query"
date: "2026-08-31T09:31:13.495544+00:00"
question: "Why did the Organizational Structure management route return HTTP 500?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["OrganizationalStructureManagement", "GetOrganizationalStructureQuery", "OrganizationalStructureItem"]
---

# Q: Why did the Organizational Structure management route return HTTP 500?

## Answer

The EF Core list query applied filtering and ordering after a positional DTO constructor projection, and generic criteria referenced relationship fields unavailable for some resources. SQL Server could not translate those expressions. The fix uses a member-initialized projection plus resource-aware expression-tree search and parent ordering, keeping count, paging, filtering, and sorting server-side. The focused suite verifies 210 SQL Server translation combinations, and the authenticated Next.js proxy request now returns HTTP 200.

## Outcome

- Signal: useful

## Source Nodes

- OrganizationalStructureManagement
- GetOrganizationalStructureQuery
- OrganizationalStructureItem