const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT       = 3000;
const ROOT       = __dirname;
const SCOREBOARD = path.join(ROOT, 'memory', 'scoreboard.txt');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.svg':  'image/svg+xml',
  '.txt':  'text/plain',
  '.json': 'application/json'
};

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ---- API: scoreboard ----

  if (req.url === '/api/scoreboard') {
    if (req.method === 'GET') {
      try {
        const data = fs.readFileSync(SCOREBOARD, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      } catch {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('[]');
      }
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          fs.writeFileSync(SCOREBOARD, JSON.stringify(parsed, null, 4));
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"ok":true}');
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, err: e.message }));
        }
      });
      return;
    }
  }

  // ---- Archivos estáticos ----

  const urlPath = req.url.split('?')[0];
  const file    = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);

  // Evita path traversal fuera del directorio raíz
  if (!file.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const mime = MIME[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(buf);
  });

}).listen(PORT, () => {
  console.log(`Red Bajo Ataque  →  http://localhost:${PORT}`);
});
