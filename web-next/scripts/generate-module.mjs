import fs from "node:fs";
import path from "node:path";
import process from "node:process";

export function moduleFiles({ code, slug = code, name }) {
  assertModuleCode(code);
  assertModuleSlug(slug);
  const safeName = String(name ?? "").trim();
  if (!safeName) throw new Error("--name is required");

  return new Map([
    ["index.ts", `export { ${identifier(code)}ModuleDefinition } from "./moduleDefinition";\n`],
    ["moduleDefinition.tsx", `import AppsRoundedIcon from "@mui/icons-material/AppsRounded";\nimport type { FrontendModuleDefinition } from "@/platform/modules";\n\nexport const ${identifier(code)}ModuleDefinition: FrontendModuleDefinition = {\n  code: ${JSON.stringify(code)},\n  name: ${JSON.stringify(safeName)},\n  icon: <AppsRoundedIcon />,\n  tone: "primary",\n  requiredDependencies: [],\n  optionalDependencies: [],\n  translationNamespace: ${JSON.stringify(`module-${code}`)},\n  loadTranslations: async (language) => (\n    language === "ar"\n      ? (await import("./locales/ar.json")).default\n      : (await import("./locales/en.json")).default\n  ),\n  submodules: [],\n};\n`],
    ["locales/en.json", `${JSON.stringify({ name: safeName }, null, 2)}\n`],
    ["locales/ar.json", `${JSON.stringify({ name: safeName }, null, 2)}\n`],
    ["README.md", `# ${safeName} frontend module\n\nFolder slug: \`${slug}\`. Backend/catalog code: \`${code}\`.\n\nGenerated module boundary. Add server-backed submodules and features through \`moduleDefinition.tsx\`; do not add shell-specific conditionals.\n\nBefore enabling a business feature, confirm its API/permission contract and coordinate shared contract changes with mobile.\n`],
  ]);
}

export function assertModuleCode(code) {
  if (!/^[a-z][a-z0-9-]*$/.test(String(code ?? ""))) {
    throw new Error("--code must be lowercase kebab-case");
  }
}

export function assertModuleSlug(slug) {
  if (!/^[a-z][a-z0-9-]*$/.test(String(slug ?? ""))) {
    throw new Error("--slug must be lowercase kebab-case");
  }
}

function identifier(code) {
  return code.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}

function parseArgs(argv) {
  const values = new Map();
  let dryRun = false;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (token.startsWith("--")) {
      values.set(token.slice(2), argv[index + 1]);
      index += 1;
    }
  }
  return { values, dryRun };
}

export function generateModule({ code, slug = code, name, root = path.resolve("src/modules"), dryRun = false }) {
  const files = moduleFiles({ code, slug, name });
  const rootResolved = path.resolve(root);
  const destination = path.resolve(rootResolved, slug);
  if (path.dirname(destination) !== rootResolved) throw new Error("Unsafe module destination");
  if (fs.existsSync(destination)) throw new Error(`Module directory already exists: ${destination}`);

  const planned = [...files].map(([relativePath, content]) => ({
    path: path.join(destination, relativePath),
    content,
  }));
  if (dryRun) return planned;

  for (const item of planned) {
    fs.mkdirSync(path.dirname(item.path), { recursive: true });
    fs.writeFileSync(item.path, item.content, "utf8");
  }
  return planned;
}

if (path.resolve(process.argv[1] ?? "") === path.resolve(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1"))) {
  const { values, dryRun } = parseArgs(process.argv.slice(2));
  const planned = generateModule({
    code: values.get("code"),
    slug: values.get("slug") ?? values.get("code"),
    name: values.get("name"),
    root: values.get("root") ? path.resolve(values.get("root")) : path.resolve("src/modules"),
    dryRun,
  });
  console.log(`${dryRun ? "Would create" : "Created"} ${planned.length} files:`);
  for (const item of planned) console.log(`  ${path.relative(process.cwd(), item.path)}`);
  if (!dryRun) {
    console.log("Register the new module in scripts/module-boundaries.mjs and src/app/(main)/moduleRegistration.ts after its backend catalog code exists.");
  }
}
