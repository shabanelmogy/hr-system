---
type: "query"
date: "2026-08-11T18:57:00.761650+00:00"
question: "Diagnose and fix recurring Turbopack panic: Next.js package not found while /login returns 200."
contributor: "graphify"
outcome: "useful"
source_nodes: ["next", "login/page.tsx", "proxy()"]
---

# Q: Diagnose and fix recurring Turbopack panic: Next.js package not found while /login returns 200.

## Answer

Expanded from original query via graph vocabulary: [next, login, auth, cache, config, proxy, route, server]. The panic log showed Turbopack failed to emit /(auth)/login/page because the Next.js package was not found, while Node resolved local next@16.2.10 successfully. The persistent Turbopack cache under web-next/.next contained thousands of SST/meta files and the failures followed cache compaction. Clearing only web-next/.next and cold/warm restarting resolved the issue: 45 total login requests returned 200, with no panic markers and no new panic logs. No source code was changed.

## Outcome

- Signal: useful

## Source Nodes

- next
- login/page.tsx
- proxy()