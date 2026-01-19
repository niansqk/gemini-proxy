const http = require('http');  
const https = require('https');  
const server = http.createServer((req, res) => {  
  // 修正路径逻辑，确保完美转发给 Google  
  const targetUrl = 'https://generativelanguage.googleapis.com' + req.url;  
    
  const proxyReq = https.request(targetUrl, {  
    method: req.method,  
    headers: {   
      ...req.headers,   
      host: 'generativelanguage.googleapis.com'   
    }  
  }, (proxyRes) => {  
    // 加上跨域通行证，防止浏览器拦截  
    res.writeHead(proxyRes.statusCode, {  
      ...proxyRes.headers,  
      'Access-Control-Allow-Origin': '*',  
      'Access-Control-Allow-Methods': '*',  
      'Access-Control-Allow-Headers': '*'  
    });  
    proxyRes.pipe(res);  
  });  
  req.pipe(proxyReq);  
});  
server.listen(8080, '0.0.0.0', () => {  
  console.log('Server listening on port 8080');  
});  
