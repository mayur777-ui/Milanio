import React, { useState, useEffect } from "react";

export function useRoomReload(roomId: string) {
  const [isRoomReload, setIsRoomReload] = useState(false);
  useEffect(() => {
    const key = `room-reload-${roomId}`;
    const hasReloaded = sessionStorage.getItem(key) === "true";
    if (hasReloaded) {
      setIsRoomReload(true);
    }
    sessionStorage.setItem(key, "true");
  }, [roomId]);
  return isRoomReload;
}
