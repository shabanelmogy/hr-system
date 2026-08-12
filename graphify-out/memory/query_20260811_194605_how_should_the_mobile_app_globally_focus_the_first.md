---
type: "query"
date: "2026-08-11T19:46:05.613774+00:00"
question: "How should the mobile app globally focus the first input in each form?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["mobile-react/src/shared/components/forms/AppForm.tsx", "mobile-react/src/shared/components/controls/AppTextField.tsx", "mobile-react/src/features/auth/login/components/LoginForm.tsx", "mobile-react/src/features/tenants/components/TenantFormModal.tsx"]
---

# Q: How should the mobile app globally focus the first input in each form?

## Answer

Add a shared AppForm focus coordinator. AppTextField registers eligible native inputs with the nearest AppForm; the coordinator focuses only the first after mount, respects explicit autoFocus false, disabled and non-focusable fields, and preserves forwarded refs. LoginForm and TenantFormModal now use AppForm.

## Outcome

- Signal: useful

## Source Nodes

- mobile-react/src/shared/components/forms/AppForm.tsx
- mobile-react/src/shared/components/controls/AppTextField.tsx
- mobile-react/src/features/auth/login/components/LoginForm.tsx
- mobile-react/src/features/tenants/components/TenantFormModal.tsx