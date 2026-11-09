import fs from 'node:fs/promises';
import path from 'node:path';

/** Serves built Angular assets in intercepted Chrome requests, without a dev server. */
export async function serveAngularFixtureBuild(
  context,
  root,
  origin,
  build = path.join(root, 'dist/erp-angular/browser'),
) {
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const requested = path.resolve(build, relative);
    if (requested !== build && !requested.startsWith(build + path.sep)) return route.abort();
    const file = path.extname(relative) ? requested : path.join(build, 'index.html');
    const contentType =
      {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.woff2': 'font/woff2',
        '.svg': 'image/svg+xml',
      }[path.extname(file)] ?? 'application/octet-stream';
    try {
      return await route.fulfill({ body: await fs.readFile(file), contentType });
    } catch {
      return route.fulfill({ status: 404, body: '' });
    }
  });
}
