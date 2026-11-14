"use client";

import React, { useRef, useEffect } from "react";

interface VideoTileProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  className?: string;
}

export const VideoTile = React.memo(function VideoTile({
  stream,
  isLocal = false,
  className = "w-full h-full object-cover",
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !stream) return;

    // 🛡️ CRITICAL PERFORMANCE GUARD:
    // Only assign srcObject if it points to a different MediaStream reference.
    // In the HTML5 Media spec, assigning video.srcObject resets the media pipeline,
    // clears the frame buffer, and re-negotiates tracks, producing an annoying black flicker.
    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isLocal}
      className={`${className} ${isLocal ? "scale-x-[-1]" : ""}`}
    />
  );
});

VideoTile.displayName = "VideoTile";
export default VideoTile;
