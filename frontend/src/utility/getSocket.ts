import { globalAgent } from "http";
import { io, Socket } from "socket.io-client";

// Global socket instance - will persist across all component renders and route changes
let globalSocket: Socket | null = null;


function getBaseUrl() {
  // Prefer DEV in development, PROD in production
  if (process.env.NODE_ENV === "development") {
    const devUrl = process.env.NEXT_PUBLIC_API_URL_DEV;
    if (!devUrl) throw new Error("NEXT_PUBLIC_API_URL_DEV is not set");
    return devUrl;
  } else {
    const prodUrl = process.env.NEXT_PUBLIC_API_URL_PROD;
    if (!prodUrl) throw new Error("NEXT_PUBLIC_API_URL_PROD is not set");
    return prodUrl;
  }
}

export const getSocket = (userid: string): Socket | null => {
  // If we already have a connected socket, return it immediately
  if (globalSocket){
    return globalSocket;
  }
    globalSocket = io(getBaseUrl(), {
      withCredentials: true,
      autoConnect: true,
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
