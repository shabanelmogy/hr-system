# ERP System Frontend

`web-next/` is the canonical and supported frontend for this repository.

Use this application for all frontend development, bug fixes, tests, configuration, documentation, and deployments. The sibling `web/` Vite application is legacy and is retained temporarily only for migration/reference until it can be removed.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Local development uses the API's HTTP endpoint at
`http://localhost:5293`, so no local certificate installation or TLS bypass is
required.

For optional HTTPS on Windows, install a certificate for the current account,
then start the HTTPS server:

```bash
npm run cert:install
npm run dev:https
```

The setup command uses the native mkcert executable downloaded by Next.js, so
a global `mkcert` command is not required. Existing certificate files are moved
to timestamped `.stale-*` backups before replacement.

See [`../documentation/web-next/architecture/frontend-architecture-reference.md`](../documentation/web-next/architecture/frontend-architecture-reference.md) for the frontend architecture conventions.

## Modular architecture checks

The application uses the applied `src/platform`, `src/modules`, `src/shell` and
`src/shared` boundaries. Before completing structural work run:

```bash
npm run check:architecture
npm run type-check
npm run lint -- --quiet
npm run test:module-generator
npm run test:coverage
npm run build
npm run measure:build
```

Create a new frontend module boundary with `npm run generate:module -- --slug
<folder> --code <backend-code> --name "<display name>"`. Registration is only
valid after the matching backend module catalog code exists.

