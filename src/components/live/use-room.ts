"use client";
import { useMemo } from "react";
import { useConvexConnectionState, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { RoomSnapshot } from "@/lib/live/types";

type Ack = (result: { ok: true; data: unknown } | { ok: false; error: string }) => void;

export function useRoom(code: string) {
  const room = useQuery(api.live.room, { code: code.toUpperCase() });
  const join = useMutation(api.live.join);
  const vote = useMutation(api.live.vote);
  const command = useMutation(api.live.command);
  const connection = useConvexConnectionState();
  const socket = useMemo(() => ({
    emit(event: string, payload: Record<string, unknown>, ack?: Ack) {
      const operation = event === "attendee:join" ? join(payload as never)
        : event === "attendee:vote" ? vote(payload as never)
          : event === "host:command" ? command(payload as never)
            : Promise.resolve(null);
      void operation.then((data) => ack?.({ ok: true, data })).catch((error: unknown) => ack?.({ ok: false, error: error instanceof Error ? error.message : "Could not complete this live action." }));
    },
    on(..._args: unknown[]) {},
    off(..._args: unknown[]) {},
  }), [command, join, vote]);

  const snapshot = room === undefined ? null : room as RoomSnapshot | null;
  return { snapshot, connected: connection.isWebSocketConnected, error: room === null ? "Room unavailable" : null, socket };
}
