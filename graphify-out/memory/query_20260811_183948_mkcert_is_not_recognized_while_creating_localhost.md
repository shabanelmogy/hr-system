---
type: "query"
date: "2026-08-11T18:39:48.685616+00:00"
question: "mkcert is not recognized while creating localhost certificates"
contributor: "graphify"
outcome: "useful"
source_nodes: ["setup-local-https.ps1", "scripts", "Development"]
---

# Q: mkcert is not recognized while creating localhost certificates

## Answer

Expanded from the certificate issue via graph vocabulary: [https, localhost, development, server, script, next, config, security, browser]. The global mkcert command is unavailable, and the repository's npm mkcert package is a different CLI. The existing certificate was issued under another Windows account and its root CA is absent from the current trust store. Local development now defaults to HTTP with npm run dev at http://localhost:3000 and proxies to the backend HTTP launch URL at http://localhost:5293, removing NODE_TLS_REJECT_UNAUTHORIZED. Optional HTTPS is supported with npm run cert:install followed by npm run dev:https; the setup script locates Next.js's downloaded native mkcert executable, backs up stale leaf certificates, installs the current user's CA, and generates the certificate files expected by Next.js. The trust-store command was not executed automatically.

## Outcome

- Signal: useful

## Source Nodes

- setup-local-https.ps1
- scripts
- Development