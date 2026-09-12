---
type: "query"
date: "2026-09-08T03:42:00.110281+00:00"
question: "مراجعة شاملة لهيكل المشروع وتجهيزه كـ Modular Monolith لإضافة موديول حسابات وأنشطة مستقبلية"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Modular Monolith Architecture", "AccountingModule", "ModuleCatalog", "AccountingDbContext", "ArchitectureDependencyTests"]
---

# Q: مراجعة شاملة لهيكل المشروع وتجهيزه كـ Modular Monolith لإضافة موديول حسابات وأنشطة مستقبلية

## Answer

النظام كان layered HR monolith بحدود طبقات فقط وApplicationDbContext مشترك. أضيف ModuleCatalog صريح وBuildingBlocks عامة، وفُصل Accounting إلى Contracts وDomain وApplication وInfrastructure وPresentation وBootstrap، مع AccountingDbContext وschema ومهاجرات مستقلة، واختبارات csproj عامة تمنع مراجع legacy والتجاوزات بين الوحدات. يظل HR legacy انتقاليا، وتحتاج أول عملية حرجة بين HR وAccounting إلى Platform.Contracts محايدة وoutbox/inbox idempotent قبل التنفيذ.

## Outcome

- Signal: useful

## Source Nodes

- Modular Monolith Architecture
- AccountingModule
- ModuleCatalog
- AccountingDbContext
- ArchitectureDependencyTests