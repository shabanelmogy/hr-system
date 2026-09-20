# <Capability / Phase> — Customer Education & Video Guide

> Create this document only after the phase/slice implementation is verified.
> It explains actual customer-visible behavior. It is not an architecture or
> implementation design document.

## 1. Document metadata

| Field | Value |
| --- | --- |
| Capability | `<name>` |
| Phase / Slice | `<id and name>` |
| Product version / release | `<version/milestone>` |
| Audience | `<roles/personas>` |
| Platforms | `Web / Mobile / Both / Other` |
| Verified against | `<runtime/test/release evidence>` |
| Last reviewed | `<YYYY-MM-DD>` |

## 2. What this feature gives the customer

Explain in plain customer language:

- the problem it solves;
- the business value;
- who should use it;
- what becomes possible after this phase.

Avoid internal class/service/database terminology.

## 3. Before you start

### Required access

| Role / permission | Why it is needed |
| --- | --- |
| `<role/permission>` | `<customer-facing explanation>` |

### Required setup / prerequisites

1. `<prerequisite>`
2. `<prerequisite>`

### Important limitations

- `<actual limitation>`
- Do not list Deferred or future behavior as available.

## 4. Main customer journey

Describe the normal workflow exactly as the customer performs it.

### Step 1 — <Action>

**Where:** `<menu/page/screen>`

**Do:**
1. `<action>`
2. `<action>`

**Expected result:**  
`<what the customer should see>`

**Why it matters:**  
`<business meaning>`

Repeat for each meaningful step.

## 5. Screen-by-screen explanation

| Screen / area | What the customer sees | What they can do | Important rule |
| --- | --- | --- | --- |
| `<screen>` | `<description>` | `<actions>` | `<plain-language rule>` |

## 6. Business rules customers need to understand

Explain only rules that affect customer decisions or outcomes.

| Rule | Customer explanation | Example |
| --- | --- | --- |
| `<rule>` | `<plain language>` | `<example>` |

## 7. Worked example / demo scenario

Use safe fictional data that can also be reused while recording a video.

### Scenario

`<short realistic business scenario>`

### Demo data

| Item | Example value |
| --- | --- |
| `<field/entity>` | `<safe fictional value>` |

### Expected outcome

`<what the completed scenario proves>`

## 8. Common problems and how to resolve them

| What the customer sees | Likely reason | What to do |
| --- | --- | --- |
| `<message/blocked action>` | `<reason>` | `<safe recovery steps>` |

Do not suggest database edits, hidden workarounds, or unsupported bypasses.

## 9. Frequently asked questions

### <Question>

<Short customer-facing answer.>

## 10. Terminology

| Term | Meaning for the customer |
| --- | --- |
| `<term>` | `<simple definition>` |

## 11. Video recording script / storyboard

The recording order should demonstrate one complete successful journey before
optional/edge-case material.

| Scene | Screen/action | Narration point | Expected visible result |
| --- | --- | --- | --- |
| 1 | `<opening screen>` | `<what to explain>` | `<result>` |
| 2 | `<action>` | `<what to explain>` | `<result>` |

### Suggested video structure

1. **Opening:** what problem this feature solves.
2. **Prerequisites:** what must already be configured.
3. **Main walkthrough:** complete customer journey.
4. **Important rules:** only the rules customers need to make correct decisions.
5. **Common mistake:** one useful blocked/error case and recovery.
6. **Result:** show the final business outcome.
7. **Close:** summarize what the customer can now do.

## 12. Recording checklist

- [ ] Use only fictional/demo data.
- [ ] No passwords, tokens, connection strings, personal customer data, or secrets are visible.
- [ ] UI language/RTL direction matches the intended audience.
- [ ] Browser/mobile notifications unrelated to the demo are hidden.
- [ ] Recording starts from a known clean demo state.
- [ ] Every narrated action exists in the verified product version.
- [ ] No Deferred/future feature is described as released.
- [ ] Final result is shown, not only the data-entry steps.

## 13. What changed in this phase

### New for customers

- `<new capability>`

### Changed behavior

- `<changed behavior or N/A>`

### Not included yet

- `<explicitly Deferred/Excluded item>`

## 14. Source-of-truth references

Use these only to keep the education document accurate; they are not part of the
customer-facing narration unless useful.

- Canonical plan: `<path>`
- Verified feature/runtime documentation: `<path>`
- Relevant release/test evidence: `<path>`
