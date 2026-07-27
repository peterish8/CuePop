"use client";
import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket } from "@/lib/live/socket-client";
import type { RoomSnapshot } from "@/lib/live/types";

export function useRoom(code: string) {
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const normalizedCode = code.toUpperCase();
    const client = getSocket();
    setSocket(client);

    const onSnapshot = (next: RoomSnapshot) => {
      if (next.code === normalizedCode) setSnapshot(next);
    };
    const subscribe = () => {
      setConnected(true);
      setError(null);
      client.emit("room:subscribe", { code: normalizedCode }, (ack: any) => {
        if (!ack?.ok) setError(ack?.error || "Could not join room.");
      });
    };
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => setError("The realtime connection could not be established.");

    client.on("room:snapshot", onSnapshot);
    client.on("connect", subscribe);
    client.on("disconnect", onDisconnect);
    client.on("connect_error", onConnectError);
    if (client.connected) subscribe();

    return () => {
      client.emit("room:unsubscribe", { code: normalizedCode });
      client.off("room:snapshot", onSnapshot);
      client.off("connect", subscribe);
      client.off("disconnect", onDisconnect);
      client.off("connect_error", onConnectError);
    };
  }, [code]);

  return { snapshot, connected, error, socket };
}
