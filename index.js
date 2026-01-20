const http = require('http');
const https = require('https');
const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const targetUrl = 'https://generativelanguage.googleapis.com' + req.url;
  const proxyReq = https.request(targetUrl, {
    method: req.method,
    headers: { ...req.headers, host: 'generativelanguage.googleapis.com' }
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', () => { res.writeHead(502); res.end(); });
  req.pipe(proxyReq);
});

// 重点：加上 '0.0.0.0'，彻底解决 Connection Refused
server.listen(port, '0.0.0.0', () => {
  console.log('Online on port ' + port);
});
