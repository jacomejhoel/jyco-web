// Mini servidor estático para revisar J&Co en local (sin dependencias).
// Uso: desde la carpeta jyco-web ->  node scripts/serve.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const PORT = 8095;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/' || p.endsWith('/')) p += 'index.html';
  let fp = path.normalize(path.join(root, p));
  if (!fp.startsWith(root)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p>No se encontró: ' + p + '</p>'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('\n  J&Co — sitio servido en:  http://localhost:' + PORT + '\n');
  console.log('  Deja esta ventana abierta mientras revisas. Ciérrala para apagar el servidor.\n');
});
