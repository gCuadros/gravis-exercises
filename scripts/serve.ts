import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { root } from './lib.ts';
const dir = path.join(root, 'dist/site');
const port = Number(process.env.PORT || 4371);
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(dir, '.' + pathname);
    if (file !== dir && !file.startsWith(dir + path.sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith('/')) {
        res.writeHead(308, { Location: url.pathname + '/' + url.search });
        res.end();
        return;
      }
      file = path.join(file, 'index.html');
    }
    const content = await readFile(file);
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      await readFile(path.join(dir, '404.html')).catch(() =>
        Buffer.from('Not found. Run npm run build first.'),
      ),
    );
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Gravis preview: http://127.0.0.1:${port}`));
