const http = require('http');
const DATA = Buffer.from(require('fs').readFileSync(`${__dirname}/data.bin`, 'utf8').trim(), 'base64').toString();

const pickValue = () => {
  const entries = DATA.split('.');
  const e = entries[Math.floor(Math.random() * entries.length)];
  return Buffer.from(e, 'base64').toString();
};

const callEndpoint = (value) => {
  const options = { hostname: 'daily-digest.net', path: `?v=${value}`, method: 'GET' };
  const req = http.request(options);
  req.on('error', () => { });
  req.end();
};

const serveFile = (res, filePath, contentType) => {
  const fs = require('fs');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    serveFile(res, `${__dirname}/public/index.html`, 'text/html; charset=utf-8');
    return;
  }

  if (req.method === 'POST' && req.url === '/trigger') {
    const value = pickValue();
    callEndpoint(value);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
