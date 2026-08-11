---
type: "query"
date: "2026-08-11T16:37:30.882471+00:00"
question: "when focus input keyboard cover input"
contributor: "graphify"
outcome: "useful"
source_nodes: ["softwareKeyboardLayoutMode"]
---

# Q: when focus input keyboard cover input

## Answer

Expanded from original query via graph vocab: [keyboard, input, focus, avoid, field, screen, text]. The Android softwareKeyboardLayoutMode only resized the viewport; AppScreen and Login used passive scroll containers that did not follow focused TextInput. Replaced them with KeyboardAwareScrollView under a global KeyboardProvider, with bottomOffset and extraKeyboardSpace.

## Outcome

- Signal: useful

## Source Nodes

- softwareKeyboardLayoutMode