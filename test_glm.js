const https = require('https');
const data = JSON.stringify({
  model: 'glm-4-flash',
  messages: [{ role: 'user', content: '你好，请回复OK' }]
});

const req = https.request({
  hostname: 'open.bigmodel.cn',
  path: '/api/paas/v4/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Authorization': 'Bearer 8ec0739d534540b4ad4e36ed1f5d1cb6.KLyPOylmIPZOPj9D'
  }
}, res => {
  let body = '';
  res.on('data', c => body += c);
  res.on('end', () => console.log(body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
