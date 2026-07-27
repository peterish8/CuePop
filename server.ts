import { createServer } from "node:http";
import next from "next";
import { initializeDatabase } from "./src/lib/db";
import { attachSocketServer } from "./src/lib/live/socket-server";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

async function main() {
  initializeDatabase();
  const app = next({ dev, hostname, port });
  const handler = app.getRequestHandler();
  await app.prepare();

  const server = createServer((req, res) => handler(req, res));
  attachSocketServer(server);

  server.listen(port, hostname, () => {
    console.log(`\nCuePop is running at http://localhost:${port}`);
    console.log("For QR testing on a phone, open the app through your computer's LAN IP.\n");
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
