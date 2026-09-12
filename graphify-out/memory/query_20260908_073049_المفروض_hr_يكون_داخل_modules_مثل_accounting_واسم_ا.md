---
type: "query"
date: "2026-09-08T07:30:49.021957+00:00"
question: "المفروض HR يكون داخل Modules مثل Accounting واسم المشروع العام ERP System"
contributor: "graphify"
outcome: "useful"
source_nodes: ["ErpSystem.sln", "Modules", "Accounting"]
---

# Q: المفروض HR يكون داخل Modules مثل Accounting واسم المشروع العام ERP System

## Answer

Expanded from original query via graph vocab: [accounting, application, bootstrap, domain, host, hrms, infrastructure, management, module, modules, presentation, solution]. تم اعتماد api/ErpSystem.sln؛ الـAPI Host عام في الجذر، وModules يحتوي HR وAccounting. HR تجميع منطقي انتقالي للمشروعات الحالية ذات ApplicationDbContext المشترك، بينما Accounting موديول مستقل فعليًا. جميع Solution Folders تستخدم Visual Studio GUID الصحيح.

## Outcome

- Signal: useful

## Source Nodes

- ErpSystem.sln
- Modules
- Accounting