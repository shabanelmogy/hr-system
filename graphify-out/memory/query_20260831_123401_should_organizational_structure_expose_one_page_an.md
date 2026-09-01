---
type: "query"
date: "2026-08-31T12:34:01.280960+00:00"
question: "Should Organizational Structure expose one page and route per entity?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["OrganizationalStructurePage", "OrganizationalStructureManagementScreen", "CountriesScreen", "StatesScreen"]
---

# Q: Should Organizational Structure expose one page and route per entity?

## Answer

Yes. Following the Countries/States page pattern, web and mobile now expose separate guarded routes for branches, departments, divisions, job-titles, job-levels, positions, and job-descriptions. The shared management composition is reused inside each fixed-resource page; the cross-entity selector was removed. Web root and legacy manage URLs redirect to Branches for compatibility.

## Outcome

- Signal: useful

## Source Nodes

- OrganizationalStructurePage
- OrganizationalStructureManagementScreen
- CountriesScreen
- StatesScreen