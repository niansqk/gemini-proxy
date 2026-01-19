const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  // 1. 处理跨域预检请求 (让 Chatbox 和网页版都能通)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // 2. 构造转发到 Google 的目标地址
  const targetUrl = 'https://generativelanguage.googleapis.com' + req.url;

  // 3. 配置转发请求
  const proxyReq = https.request(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: 'generativelanguage.googleapis.com' // 必须强行改写 host，否则 Google 拒收
    }
  }, (proxyRes) => {
    // 4. 将 Google 的结果打上通行证回传
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*'
    });
    proxyRes.pipe(res);
  });

  // 5. 错误处理 (防止程序因超时而崩溃)
  proxyReq.on('error', (e) => {
    console.error('Proxy Error:', e);
    res.writeHead(500);
    res.end('Internal Server Error');
  });

  req.pipe(proxyReq);
});

// 6. 端口对齐：优先听系统的（8080），没有就用 3000，并对全世界开放 (0.0.0.0)
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
