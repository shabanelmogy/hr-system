# Documentation System Guidance

- Treat `recipe-manifest.json`, `templates/`, and the canonical books listed in the manifest as authored sources.
- Never edit `generated/` files directly. Run `Generate-Documentation.ps1` after changing a template, manifest, or canonical numbered section.
- Keep paths in feature manifests repository-relative and use forward slashes.
- A required source file belongs in its application project. Reference it from a manifest; do not copy runtime source into `documentation/`.
- Preserve the distinction between verified current behavior, desired behavior, and an unresolved finding.
- Every feature review must finish with phase 06 and a passing `Generate-Documentation.ps1 -Check` result.
- Do not place secrets, environment values, generated binaries, package caches, or test output in this directory.
