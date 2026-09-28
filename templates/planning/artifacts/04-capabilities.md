# Capability map and workflows

## Capabilities

| ID | Capability (verb + object) | Area | Actors | Priority | Status | Legacy ref |
| --- | --- | --- | --- | --- | --- | --- |
| CAP-01 | <<Schedule appointment>> | <<Scheduling>> | <<Receptionist>> | Must | Proposed | <<SCR-03 / —>> |

Priority: Must · Should · Could · Won't (this release). Status: Proposed · Confirmed · Deferred.

## Workflows

Template per Must capability:

```markdown
### CAP-01 — <capability>

- **Trigger:** …
- **Actors:** …
- **Main path:**
  1. …
- **Business events:** `SomethingHappened`, …
- **End state:** …
- **Exceptions / alternatives:**
  - If …, then …
- **States of <main object>:** Draft → … (who moves each transition)
- **Rules found:** BR-###
- **Open questions:** Q-###
- **Impact on existing features (Track E):** …
```
