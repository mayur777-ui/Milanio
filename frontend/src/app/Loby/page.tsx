"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/Socketcontext";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/themeContext";
import {
  Video,
  Keyboard,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Moon,
  Sun,
  LogOut,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserService } from "@/apis/user.api";
import VideoTile from "@/component/VideoTile";
import { disconnectSocket } from "@/utility/getSocket";

type ValidationDto = {
  roomId: string;
  users: string[];
  userCount: number;
};

export default function LobbyPage() {
  const [input, setInput] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsjoining] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showUserBox, setshowUserBox] = useState<boolean>(false);
  const [isreject, setisreject] = useState<string>("");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  // Hardware Green Room Preview State
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCamOn, setIsCamOn] = useState<boolean>(true);

  const { socket } = useSocket();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  // Helper to cleanly stop preview hardware tracks when entering a room or leaving
  const stopPreviewTracks = useCallback(() => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach((track) => track.stop());
      previewStreamRef.current = null;
    }
    setPreviewStream(null);
  }, []);

  // Request Green Room hardware preview on mount
  useEffect(() => {
    let isMounted = true;

    const startPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (isMounted) {
          previewStreamRef.current = stream;
          setPreviewStream(stream);
        } else {
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch (err) {
        console.warn("Could not acquire lobby preview stream:", err);
      }
    };

    startPreview();

    return () => {
      isMounted = false;
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach((t) => t.stop());
        previewStreamRef.current = null;
      }
    };
  }, []);

  const toggleMic = () => {
    if (previewStream) {
      previewStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (previewStream) {
      previewStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCamOn;
      });
      setIsCamOn(!isCamOn);
    }
  };

  // Fetch current user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await UserService.getUsre();
        const data = res.data;
        setUser({
          name: data.user.name,
          email: data.user.email,
        });
      } catch (err) {
        console.error("Failed to fetch user data", err);
      }
    };

    fetchUser();
  }, []);

  // Pre-fill room code from URL query param or post-auth redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const paramRoomId = params.get("roomId");
      const storedRoomId = localStorage.getItem("pendingRoomId");

      if (paramRoomId) {
        setInput(paramRoomId);
      } else if (storedRoomId) {
        setInput(storedRoomId);
        localStorage.removeItem("pendingRoomId");
      }
    }
  }, []);

  // Room creation handler
  const handleRoomCreated = useCallback(
    (data: { roomId: string }) => {
      stopPreviewTracks();
      const roomId = data.roomId;
      if (localStorage.getItem("just:leave") === "true") {
        localStorage.removeItem("just:leave");
        setTimeout(() => {
          router.replace(`/Loby/Video/${roomId}`);
        }, 200);
      } else {
        router.replace(`/Loby/Video/${roomId}`);
      }
    },
    [router, stopPreviewTracks]
  );

  useEffect(() => {
    socket?.on("room:created", handleRoomCreated);
    return () => {
      socket?.off("room:created", handleRoomCreated);
    };
  }, [socket, handleRoomCreated]);

  const createRoom = async () => {
    setIsCreating(true);
    setError(null);
    setisreject("");

    try {
      const res = await UserService.getRoomId();
      const rmid = res.data.roomId as string;
      if (socket) {
        socket.emit("create:room", { roomId: rmid });
      }
    } catch (err) {
      setError("Unable to create a new room. Please try again.");
      setIsCreating(false);
    }
  };

  // Socket validation listeners
  const handleValidation = useCallback((data: ValidationDto) => {
    console.log("Room is valid:", data.roomId, "Users:", data.users);
  }, []);

  const handleInvalid = useCallback(() => {
    setisreject("This room ID does not exist or has already closed.");
    setIsjoining(false);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("room:valid", handleValidation);
    socket.on("room:invalid", handleInvalid);
    socket.on("room:exists", ({ message }: { message: string }) => {
      setError(message);
      setIsjoining(false);
      setIsCreating(false);
    });
    socket.on("already-in-room", (data) => {
      setError(data.message);
      setIsjoining(false);
      setIsCreating(false);
    });

    return () => {
      socket.off("room:valid", handleValidation);
      socket.off("room:invalid", handleInvalid);
      socket.off("room:exists");
      socket.off("already-in-room");
    };
  }, [socket, handleValidation, handleInvalid]);

  useEffect(() => {
    socket?.on(
      "join:approved",
      ({ roomId, ownUserId }: { roomId: string; ownUserId: string }) => {
        socket.emit("join:room", { roomId, ownUserId });
      }
    );

    socket?.on("join:rejected", (data) => {
      setisreject(data.message || "The host declined your admission request.");
      setIsjoining(false);
    });

    socket?.on("room:joined", (data) => {
      stopPreviewTracks();
      localStorage.setItem("webrtc:start", "true");
      router.replace(`/Loby/Video/${data.roomId}`);
    });

    return () => {
      socket?.off("join:approved");
      socket?.off("join:rejected");
      socket?.off("room:joined");
    };
  }, [socket, router, stopPreviewTracks]);

  const handleJoinViaLink = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = input.trim();
    if (!cleanId) {
      setError("Please enter a valid Room ID.");
      return;
    }

    setIsjoining(true);
    setError(null);
    setisreject("");
    socket?.emit("room:validate", { roomid: cleanId, userDetails: user });
  };

  const handleLogout = () => {
    stopPreviewTracks();
    disconnectSocket();
    localStorage.removeItem("adminToken");
    router.replace("/");
  };

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans select-none transition-colors duration-200">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm shadow-sm">
            M
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-white">
            Milanio
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer shadow-sm"
          >
            {theme === "dark" ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-zinc-700" />}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setshowUserBox(!showUserBox)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 hidden sm:inline">
                {user?.name || "Account"}
              </span>
            </button>

            <AnimatePresence>
              {showUserBox && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-3 z-50"
                >
                  <div className="px-2 py-1.5 mb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{user?.name || "User"}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user?.email || ""}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
        {/* Left Side: Meeting Actions */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 max-w-lg">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Ready to meet?
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Start an instant room, or join an ongoing call. Set up your camera and audio on the right before entering.
            </p>
          </div>

          {/* Action 1: Create New Room */}
          <div className="flex flex-col gap-3">
            <button
              onClick={createRoom}
              disabled={isCreating || isJoining}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 disabled:opacity-50 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Room...</span>
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  <span>Start New Meeting</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-medium">
              or join with code
            </span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Action 2: Join Existing Room Form */}
          <form onSubmit={handleJoinViaLink} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 shadow-sm transition-all">
              <Keyboard className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (error) setError(null);
                  if (isreject) setisreject("");
                }}
                placeholder="Enter room ID or code"
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none py-1.5 font-mono"
              />
              <button
                type="submit"
                disabled={isJoining || isCreating || !input.trim()}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 disabled:opacity-40 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Join
              </button>
            </div>
          </form>

          {/* Calming Waiting Room State (When guest has knocked) */}
          {isJoining && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-zinc-900 dark:text-zinc-100 animate-spin shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Asking host for admission...</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Please wait while the room creator approves.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsjoining(false)}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Feedback & Error States */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isreject && (
            <div className="flex items-center gap-2.5 p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-600 dark:text-amber-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{isreject}</span>
            </div>
          )}
        </div>

        {/* Right Side: Google Meet-style Green Room Hardware Preview */}
        <div className="w-full lg:w-1/2 flex flex-col items-center max-w-lg">
          <div className="w-full aspect-video rounded-2xl bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl dark:shadow-2xl relative overflow-hidden flex items-center justify-center group">
            {/* Live Video Preview */}
            <VideoTile
              stream={previewStream}
              isLocal={true}
              className={`w-full h-full object-cover transition-opacity duration-200 ${
                isCamOn && previewStream ? "opacity-100" : "opacity-0"
              }`}
            />

            {/* Camera Off Fallback */}
            {(!isCamOn || !previewStream) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
                <div
                  className={`w-20 h-20 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-white text-xl font-bold shadow-xl transition-all ${
                    isMicOn ? "ring-4 ring-emerald-500/30 ring-offset-4 ring-offset-zinc-900" : ""
                  }`}
                >
                  {initials}
                </div>
                <span className="text-zinc-400 text-xs mt-3 font-medium flex items-center gap-1.5">
                  <CameraOff className="w-3.5 h-3.5 text-zinc-500" /> Camera is off
                </span>
              </div>
            )}

            {/* Hardware Controls Overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-zinc-950/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-zinc-800/80 shadow-lg">
              <button
                type="button"
                onClick={toggleMic}
                aria-label={isMicOn ? "Mute microphone" : "Unmute microphone"}
                className={`p-2.5 rounded-full transition-all cursor-pointer ${
                  isMicOn
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                    : "bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25"
                }`}
              >
                {isMicOn ? <Mic size={17} /> : <MicOff size={17} />}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                aria-label={isCamOn ? "Turn off camera" : "Turn on camera"}
                className={`p-2.5 rounded-full transition-all cursor-pointer ${
                  isCamOn
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                    : "bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25"
                }`}
              >
                {isCamOn ? <Camera size={17} /> : <CameraOff size={17} />}
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 text-center">
            {isCamOn && isMicOn
              ? "Camera and microphone are active"
              : isMicOn
              ? "Microphone is on, camera is off"
              : isCamOn
              ? "Camera is on, microphone is muted"
              : "Camera and microphone are turned off"}
          </p>
        </div>
      </main>
    </div>
  );
}
