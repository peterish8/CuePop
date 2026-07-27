"use client";
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket() {
  if (typeof window === "undefined") throw new Error("The realtime client is only available in the browser.");
  if (!socket) socket = io({ path: "/socket.io", transports: ["websocket", "polling"] });
  return socket;
}
