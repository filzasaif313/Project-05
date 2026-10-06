const http = require('http');

const req = http.request('http://localhost:5678/healthz', (res) => {
  console.log('n8n healthz status:', res.statusCode);
});
req.on('error', (e) => console.log('n8n error:', e.message));
req.end();
