// Plain JS custom server entrypoint.
// Uses tsx only for transpiling user TypeScript (not node_modules).
// This avoids tsx's module hook conflicting with Next.js's require-hook.

const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');

// Register tsx as a TypeScript transformer for user code only.
// tsx by default skips node_modules, avoiding conflicts with next's require-hook.
require('tsx/cjs');

const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '8000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Load the Socket.IO initializer (TypeScript, processed by tsx above)
  const { initSocketServer } = require('./src/server/socketServer');
  initSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`\n💸 DollarCord running at http://${hostname}:${port}\n`);
  });

  httpServer.on('error', (err) => {
    console.error('Server error:', err);
    process.exit(1);
  });
});
