/**
 * Aura Craft Dedicated Admin Server
 * Runs on Port 3001 and serves the Admin Panel directly.
 * 
 * - Opening http://localhost:3001 redirects automatically to http://localhost:3001/admin
 * - All admin dashboard pages, APIs, and Next.js assets are served seamlessly.
 * - Supports WebSockets for live Fast Refresh (HMR).
 */

const http = require('http');
const net = require('net');

const WEBSITE_HOST = process.env.WEBSITE_HOST || '127.0.0.1';
const WEBSITE_PORT = parseInt(process.env.WEBSITE_PORT || '3000', 10);
const ADMIN_PORT = parseInt(process.env.ADMIN_PORT || '3001', 10);

const server = http.createServer((req, res) => {
  // If user visits root of port 3001, take them straight into the Admin Panel!
  if (req.url === '/' || req.url === '') {
    res.writeHead(302, { Location: '/admin' });
    res.end();
    return;
  }

  // Forward all requests to Next.js on port 3000
  const options = {
    hostname: WEBSITE_HOST,
    port: WEBSITE_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${ADMIN_PORT}`,
      'x-forwarded-host': `localhost:${ADMIN_PORT}`,
      'x-forwarded-port': `${ADMIN_PORT}`,
      'x-forwarded-proto': 'http',
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // If backend attempts to redirect to /admin on port 3000, rewrite location header to port 3001
    const headers = { ...proxyRes.headers };
    if (headers.location && headers.location.includes(`:${WEBSITE_PORT}`)) {
      headers.location = headers.location.replace(`:${WEBSITE_PORT}`, `:${ADMIN_PORT}`);
    }

    res.writeHead(proxyRes.statusCode, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Aura Craft Admin - Connecting...</title>
        <meta http-equiv="refresh" content="3">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #fdfbf7; color: #553722; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 2.5rem; border-radius: 1.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center; max-width: 480px; border: 1px solid #eee; }
          h2 { margin: 0 0 1rem; color: #553722; font-size: 1.5rem; }
          p { color: #766; font-size: 0.95rem; line-height: 1.5; margin: 0 0 1.5rem; }
          .spinner { width: 36px; height: 36px; border: 3px solid #f3ece4; border-top: 3px solid #553722; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <h2 style="margin-top: 1.5rem;">Connecting to Aura Craft Core...</h2>
          <p>The main website server on port 3000 is still starting up or recompiling. This page will automatically refresh in a moment.</p>
        </div>
      </body>
      </html>
    `);
  });

  req.pipe(proxyReq, { end: true });
});

// Support WebSockets for Next.js Fast Refresh & HMR on port 3001
server.on('upgrade', (req, socket, head) => {
  const proxySocket = net.connect(WEBSITE_PORT, WEBSITE_HOST, () => {
    proxySocket.write(
      `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n` +
      Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n') +
      '\r\n\r\n'
    );
    if (head && head.length > 0) {
      proxySocket.write(head);
    }
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxySocket.on('error', () => {
    socket.destroy();
  });
});

server.listen(ADMIN_PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🔐 Aura Craft Admin Panel running on: http://localhost:${ADMIN_PORT}`);
  console.log(`======================================================\n`);
});
