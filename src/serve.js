#!/usr/bin/env node
// Tiny dependency-free static server for local preview.
const http = require('http');
const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, '..', 'dist');
const PORT = process.env.PORT || 4173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.json': 'application/json',
};

http
  .createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(DIST, urlPath);
    if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(DIST, '404.html');
      res.statusCode = 404;
    }
    const ext = path.extname(file);
    res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  })
  .listen(PORT, () => console.log(`PrintMath preview: http://localhost:${PORT}`));
