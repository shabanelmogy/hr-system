---
type: "query"
date: "2026-08-11T19:57:02.715396+00:00"
question: "add min value and max value and counter in web-next\\\\src\\\\shared\\\\components\\\\forms\\\\text-fields"
contributor: "graphify"
outcome: "useful"
source_nodes: ["MyTextField.tsx", "characterCount.ts", "TextFieldEndAdornment.tsx", "inputConstraints.ts"]
---

# Q: add min value and max value and counter in web-next\\src\\shared\\components\\forms\\text-fields

## Answer

Expanded from original query via graph vocabulary: [text, field, form, counter, character, length, min, max, value, validation, input]. Added minValue and maxValue to MyTextField, mapped safely to native input constraints, added counter as an alias for showCounter, preserved the default numeric minimum of zero, and added unit coverage for constraint mapping and counter formatting.

## Outcome

- Signal: useful

## Source Nodes

- MyTextField.tsx
- characterCount.ts
- TextFieldEndAdornment.tsx
- inputConstraints.ts