---
type: "query"
date: "2026-08-11T20:03:38.693723+00:00"
question: "i want show badge inputs characatre / max"
contributor: "graphify"
outcome: "corrected"
correction: "For text-like MyTextField inputs, counter requests the character badge. Use maxValue={N} counter (or maxLength={N} counter) to display current/N; minValue and maxValue are character-length constraints for text-like inputs and value bounds for numeric/date-like inputs."
source_nodes: ["MyTextField.tsx", "TextFieldEndAdornment.tsx", "characterCount.ts", "inputConstraints.ts"]
---

# Q: i want show badge inputs characatre / max

## Answer

Expanded from original query via graph vocabulary: [number, count, add, remove, button, adornment, input, value, min, max, control, change]. User clarified that counter means the character-count badge, not numeric step controls. MyTextField now treats numeric minValue/maxValue as minLength/maxLength for text-like inputs, gives the explicit counter prop precedence, and formats the existing badge as current/max.

## Outcome

- Signal: corrected
- Correction: For text-like MyTextField inputs, counter requests the character badge. Use maxValue={N} counter (or maxLength={N} counter) to display current/N; minValue and maxValue are character-length constraints for text-like inputs and value bounds for numeric/date-like inputs.

## Source Nodes

- MyTextField.tsx
- TextFieldEndAdornment.tsx
- characterCount.ts
- inputConstraints.ts