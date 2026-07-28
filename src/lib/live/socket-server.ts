import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { executeHostCommand, getRoomSnapshot, joinAttendee, submitVote } from "@/lib/live/service";
import type { HostCommandType, SocketAck } from "@/lib/live/types";

const MAX_EVENTS_PER_WINDOW = 80;
const RATE_WINDOW_MS = 10_000;

function normalizeCode(value: unknown) {
  if (typeof value !== "string") throw new Error("A room code is required.");
  const code = value.trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) throw new Error("Enter a valid six-character room code.");
  return code;
}

export function attachSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    path: "/socket.io",
    serveClient: false,
    maxHttpBufferSize: 64 * 1024,
  });

  io.on("connection", (socket) => {
    let windowStartedAt = Date.now();
    let eventsInWindow = 0;

    socket.use((event, next) => {
      const now = Date.now();
      if (now - windowStartedAt > RATE_WINDOW_MS) {
        windowStartedAt = now;
        eventsInWindow = 0;
      }
      eventsInWindow += 1;
      if (eventsInWindow > MAX_EVENTS_PER_WINDOW) return next(new Error("Too many realtime requests. Slow down and try again."));
      next();
    });

    socket.on("room:subscribe", (payload: { code?: unknown }, ack?: SocketAck) => {
      try {
        const normalized = normalizeCode(payload?.code);
        const snapshot = getRoomSnapshot(normalized);
        if (!snapshot) throw new Error("Room not found.");
        socket.join(`room:${normalized}`);
        socket.emit("room:snapshot", snapshot);
        ack?.({ ok: true, data: snapshot });
      } catch (error) {
        ack?.({ ok: false, error: error instanceof Error ? error.message : "Could not join room." });
      }
    });

    socket.on("room:unsubscribe", (payload: { code?: unknown }) => {
      try {
        socket.leave(`room:${normalizeCode(payload?.code)}`);
      } catch {
        // Cleanup should never interrupt navigation.
      }
    });

    socket.on("attendee:join", (payload: { code?: unknown; deviceId?: unknown; name?: unknown }, ack?: SocketAck) => {
      try {
        const normalized = normalizeCode(payload?.code);
        if (typeof payload?.deviceId !== "string" || payload.deviceId.length < 8 || payload.deviceId.length > 128) {
          throw new Error("This device could not be identified. Refresh and try again.");
        }
        const name = typeof payload.name === "string" ? payload.name.slice(0, 80) : undefined;
        const result = joinAttendee(normalized, { deviceId: payload.deviceId, name });
        socket.join(`room:${normalized}`);
        io.to(`room:${normalized}`).emit("room:snapshot", result.snapshot);
        ack?.({ ok: true, data: result });
      } catch (error) {
        ack?.({ ok: false, error: error instanceof Error ? error.message : "Could not join room." });
      }
    });

    socket.on(
      "attendee:vote",
      (payload: { code?: unknown; attendeeId?: unknown; itemId?: unknown; optionId?: unknown }, ack?: SocketAck) => {
        try {
          const normalized = normalizeCode(payload?.code);
          if (![payload?.attendeeId, payload?.itemId, payload?.optionId].every((value) => typeof value === "string" && value.length > 0)) {
            throw new Error("The answer payload is incomplete.");
          }
          const result = submitVote(normalized, {
            attendeeId: payload.attendeeId as string,
            itemId: payload.itemId as string,
            optionId: payload.optionId as string,
          });
          io.to(`room:${normalized}`).emit("room:snapshot", result.snapshot);
          ack?.({ ok: true, data: result });
        } catch (error) {
          ack?.({ ok: false, error: error instanceof Error ? error.message : "Could not submit answer." });
        }
      },
    );

    socket.on("host:command", (payload: { code?: unknown; token?: unknown; command?: unknown }, ack?: SocketAck) => {
      try {
        const normalized = normalizeCode(payload?.code);
        if (typeof payload?.token !== "string" || payload.token.length < 20) throw new Error("Invalid presenter control token.");
        const allowed = new Set<HostCommandType>([
          "showJoin",
          "start",
          "next",
          "previous",
          "open",
          "close",
          "reveal",
          "end",
          "lockJoin",
          "unlockJoin",
        ]);
        if (!allowed.has(payload.command as HostCommandType)) throw new Error("Unknown presenter command.");
        const snapshot = executeHostCommand(normalized, payload.token, payload.command as HostCommandType);
        io.to(`room:${normalized}`).emit("room:snapshot", snapshot);
        ack?.({ ok: true, data: snapshot });
      } catch (error) {
        ack?.({ ok: false, error: error instanceof Error ? error.message : "Command rejected." });
      }
    });
  });

  return io;
}
