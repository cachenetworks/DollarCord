// Plain JS custom server entrypoint.
// Uses tsx only for transpiling user TypeScript, not node_modules.

const { createServer } = require("http");
const { parse } = require("url");

const isProductionStart = process.argv.includes("--production");
if (isProductionStart) {
  process.env.NODE_ENV = "production";
}

require("@next/env").loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
require("tsx/cjs");

const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const { initSocketServer } = require("./src/server/socketServer");
  initSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`\nDollarCord running at http://${hostname}:${port}\n`);
  });

  httpServer.on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });
});
