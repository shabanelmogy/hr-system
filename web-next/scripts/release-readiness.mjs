import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(webRoot, "..");
const gateManifestPath = path.join(
  repositoryRoot,
  "documentation",
  "web-next",
  "architecture",
  "production-release-gates.json",
);

const REQUIRED_GATE_IDS = Object.freeze([
  "production-env-preflight",
  "demo-login-disabled",
  "collector-trace",
  "dashboards-alerts",
  "google-popup",
  "signalr",
  "reports-pdf",
  "files-media",
  "hangfire",
  "external-frames",
  "health-readiness",
  "tenant-company-rbac",
]);

function readGateManifest() {
  if (!fs.existsSync(gateManifestPath)) {
    throw new Error("Production release gate manifest is missing.");
  }
  const manifest = JSON.parse(fs.readFileSync(gateManifestPath, "utf8"));
  if (manifest.schemaVersion !== 1 || manifest.phase !== 14) {
    throw new Error("Production release gate manifest must use schemaVersion 1 and phase 14.");
  }
  if (!Array.isArray(manifest.gates)) {
    throw new Error("Production release gate manifest must contain a gates array.");
  }

  const ids = new Set();
  for (const gate of manifest.gates) {
    if (!gate || typeof gate !== "object") throw new Error("Every release gate must be an object.");
    if (typeof gate.id !== "string" || !gate.id.trim()) throw new Error("Every release gate needs an id.");
    if (ids.has(gate.id)) throw new Error(`Duplicate release gate '${gate.id}'.`);
    ids.add(gate.id);
    if (!["automated-preflight", "deployment-smoke"].includes(gate.kind)) {
      throw new Error(`Release gate '${gate.id}' has unsupported kind '${gate.kind}'.`);
    }
    if (gate.required !== true) throw new Error(`Release gate '${gate.id}' must be explicitly required.`);
    if (typeof gate.evidence !== "string" || !gate.evidence.trim()) {
      throw new Error(`Release gate '${gate.id}' must describe its evidence.`);
    }
  }

  for (const id of REQUIRED_GATE_IDS) {
    if (!ids.has(id)) throw new Error(`Required Phase 14 release gate '${id}' is missing.`);
  }
  return manifest;
}

function normalizeHttpsOrigin(name, value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required for Production release preflight.`);
  }
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error(`${name} must be an absolute HTTPS origin.`);
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${name} must be an HTTPS origin without credentials, path, query, or fragment.`);
  }
  return url.origin;
}

function checkContract() {
  const manifest = readGateManifest();
  const deploymentGateCount = manifest.gates.filter((gate) => gate.kind === "deployment-smoke").length;
  console.log(
    `Release readiness contract passed: ${manifest.gates.length} required gates (${deploymentGateCount} deployment smokes).`,
  );
}

function checkProductionEnvironment() {
  readGateManifest();

  const publicOrigin = normalizeHttpsOrigin("WEB_PUBLIC_ORIGIN", process.env.WEB_PUBLIC_ORIGIN);
  const backendOrigin = normalizeHttpsOrigin(
    "BACKEND_URL",
    process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL,
  );

  if (process.env.NEXT_PUBLIC_DEMO_LOGIN_ENABLED !== "false") {
    throw new Error("NEXT_PUBLIC_DEMO_LOGIN_ENABLED must be explicitly false for Production release.");
  }
  if (process.env.BACKEND_OVERRIDE_ENABLED === "true" || process.env.NEXT_PUBLIC_BACKEND_OVERRIDE_ENABLED === "true") {
    throw new Error("Developer backend override must be disabled for Production release.");
  }
  if (process.env.NEXT_PUBLIC_ENABLE_SELF_REGISTRATION === "true") {
    throw new Error("Public self-registration must remain disabled for this ERP Production release.");
  }

  const serverTelemetryEnabled = process.env.WEB_OTEL_ENABLED === "true";
  const browserTelemetryEnabled = process.env.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED === "true";
  if (serverTelemetryEnabled !== browserTelemetryEnabled) {
    throw new Error("WEB_OTEL_ENABLED and NEXT_PUBLIC_WEB_TELEMETRY_ENABLED must be enabled/disabled together.");
  }
  if (serverTelemetryEnabled && !process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) {
    throw new Error("OTEL_EXPORTER_OTLP_ENDPOINT is required when Production OpenTelemetry export is enabled.");
  }

  console.log(`Production release preflight passed for ${publicOrigin} -> ${backendOrigin}.`);
  console.log("Deployment-smoke evidence is still required; this preflight does not claim external integrations passed.");
}

const mode = process.argv[2];
if (mode === "--check-contract") checkContract();
else if (mode === "--production-preflight") checkProductionEnvironment();
else throw new Error("Usage: node scripts/release-readiness.mjs --check-contract|--production-preflight");
