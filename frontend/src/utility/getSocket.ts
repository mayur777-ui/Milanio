import { io, Socket } from "socket.io-client";

// Global socket instance - will persist across all component renders and route changes
let globalSocket: Socket | null = null;

export const getSocket = (userid: string): Socket | null => {
  // If we already have a connected socket, return it immediately
  console.log("getSocket() called");
  if (globalSocket && globalSocket.connected) {
    console.log("Returning existing connected socket:", globalSocket.id);
    return globalSocket;
  }

  // If we have a socket but it's disconnected, try to reconnect
  if (globalSocket && globalSocket.disconnected) {
    console.log("Reconnecting existing socket");
    globalSocket.connect();
    return globalSocket;
  }

  // Only create a new socket if we don't have one at all
  if (!globalSocket) {
    console.log("Creating brand new socket instance");
    console.log("Attempting to connect to: http://localhost:8000");

    globalSocket = io("http://localhost:8000", {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: false,
      query: {
        userId: userid,
      },
    });

    // Add event listeners only once
    globalSocket.on("connect", () => {
      console.log("Global socket connected with ID:", globalSocket?.id);
    });

    globalSocket.on("disconnect", (reason) => {
      console.log("Global socket disconnected:", reason);
    });

    globalSocket.on("connect_error", (error) => {
      console.error("Global socket connection error:", error);
      console.error("Error details:", error);
    });

    globalSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Reconnection attempt #${attemptNumber}`);
    });

    globalSocket.on("reconnect_failed", () => {
      console.error("All reconnection attempts failed");
    });
  }

  return globalSocket;
};

export const disconnectSocket = () => {
  if (globalSocket) {
    console.log("🔌 Manually disconnecting global socket");
    globalSocket.disconnect();
    globalSocket = null;
  }
};

// For debugging - check socket status
export const getSocketStatus = () => {
  return {
    exists: !!globalSocket,
    connected: globalSocket?.connected || false,
    id: globalSocket?.id || null,
  };
};
