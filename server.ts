import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { initSocketServer } from "./src/server/socketServer";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  initSocketServer(httpServer);

  httpServer.listen(port, () => {
    console.log(`\n💸 DollarCord running at http://${hostname}:${port}\n`);
  });

  httpServer.on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });
});
