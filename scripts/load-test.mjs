import { io } from "socket.io-client";
import crypto from "node:crypto";

const baseUrl = process.env.BASE_URL || "http://localhost:3000";
const code = (process.env.ROOM_CODE || "").toUpperCase();
const clients = Number(process.env.CLIENTS || 500);
const optionId = process.env.OPTION_ID || "";

if (!code) {
  console.error("Set ROOM_CODE to a running CuePop room. Open a poll before testing votes.");
  process.exit(1);
}

const start = performance.now();
let joined = 0;
let voted = 0;
let failed = 0;
const sockets = [];

function emitAck(socket, event, payload) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${event} timeout`)), 15000);
    socket.emit(event, payload, (response) => {
      clearTimeout(timeout);
      response?.ok ? resolve(response.data) : reject(new Error(response?.error || `${event} failed`));
    });
  });
}

await Promise.all(Array.from({ length: clients }, async (_, index) => {
  const socket = io(baseUrl, { path: "/socket.io", transports: ["websocket"], reconnection: false });
  sockets.push(socket);
  try {
    await new Promise((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    });
    const result = await emitAck(socket, "attendee:join", {
      code,
      deviceId: `load-${crypto.randomUUID()}`,
      name: `Load attendee ${index + 1}`,
    });
    joined += 1;
    const snapshot = result.snapshot;
    const activeOption = optionId || snapshot.currentItem?.options?.[index % (snapshot.currentItem?.options?.length || 1)]?.id;
    if (snapshot.status === "active" && snapshot.currentItem?.id && activeOption) {
      await emitAck(socket, "attendee:vote", {
        code,
        attendeeId: result.attendeeId,
        itemId: snapshot.currentItem.id,
        optionId: activeOption,
      });
      voted += 1;
    }
  } catch (error) {
    failed += 1;
    if (failed < 6) console.error(error.message);
  }
}));

const duration = Math.round(performance.now() - start);
console.log(JSON.stringify({ baseUrl, code, clients, joined, voted, failed, durationMs: duration }, null, 2));
for (const socket of sockets) socket.disconnect();
process.exit(failed ? 1 : 0);
