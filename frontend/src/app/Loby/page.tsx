"use client";
import React, {useCallback, useEffect, useState } from "react";
import { useSocket } from "@/context/Socketcontext";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/themeContext";
import Carousel from "@/component/Carousel";
import { Moon, Sun,LogOut, Loader2  } from "lucide-react";
import { User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [roomid, setRoomid] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsjoining] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showUserBox, setshowUserBox] = useState<boolean>(false);
  const { socket } = useSocket();
  const router = useRouter();
  const [isreject, setisreject] = useState<string>("");
  const { theme, toggleTheme } = useTheme();
const [user, setUser] = useState<{name: string; email: string} | null>(null);



  useEffect(()=>{
    const fetchUser = async() => {
      const res = await fetch("/api/auth/getUser");
      if (!res.ok) {
        console.error("Failed to fetch user data");
        return;
      }
      const data = await res.json();
      setUser({
        name: data.user.user.name,
        email: data.user.user.email        
      });
    }
    fetchUser();
  },[]);
  // To handle input for join via roomid
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (error) setError(null);
    if (isreject) setisreject("");
  };

  const hadleRoomCreated = useCallback(
    (data: { roomId: string }) => {
      const roomId = data.roomId;
      if(localStorage.getItem("just:leave") === "true"){
        localStorage.removeItem("just:leave");
        setTimeout(()=>{
           router.replace(`/Loby/Video/${roomId}`);
        },200);
      }else{
        router.replace(`/Loby/Video/${roomId}`);
      }
    },
    [router]
  );

  // User Profile show and hide
  const handleShowUser = () =>{
    setshowUserBox(!showUserBox);
  }
  useEffect(() => {
    socket?.on("room:created", hadleRoomCreated);

    return () => {
      socket?.off("room:created", hadleRoomCreated);
    };
  }, [socket, hadleRoomCreated]);  
  // to join room
  const JoinRoom = async () => {
    setIsCreating(true);
    let res = await fetch("http://localhost:8000/getRoomId", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    let data = await res.json();
    let rmid = data.roomId as string;
    // console.log(rmid);
    setRoomid(rmid);
    if (!socket) return;
    socket.emit("create:room", { roomId: rmid });
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("room:exists", ({ message }: { message: string }) => {
      setError(message);
      setIsjoining(false);
    });
    return () => {
      socket.off("room:exists");
    };
  }, [socket]);

  type validationDto = {
    roomId: string;
    users: string[];
    userCount: number;
  };

  const handleValidation = useCallback(
    (data: validationDto) => {
      const roomid = data.roomId;
      console.log(
        "Room is valid:",
        roomid,
        "Users:",
        data.users,
        "User Count:",
        data.userCount
      );
      // router.push(`/Video/${roomid}`);
      // setIsjoining(false);
    },
    [router]
  );

  const handleInvalid = useCallback(
    ({ message }: { message: string }) => {
      setisreject("room does not exist");
      setIsjoining(false);
    },
    [socket]
  );

  useEffect(() => {
    // effect run when initiator accept our request and by backend emit this event to notify requster so that id is our own requesterid which we only attached.
    socket?.on(
      "join:approved",
      ({ roomId, ownUserId }: { roomId: string; ownUserId: string }) => {
        // console.log("Join approved for room:", roomId, "ownUserId:", ownUserId);
        socket.emit("join:room", { roomId, ownUserId });
      }
    );
  }, [socket]);

  useEffect(() => {
    socket?.on("join:rejected", (data) => {
      console.log(data.message);
      setisreject(data.message);
      setIsjoining(false);
      return ()=>{
        socket?.off("join:rejected");
      }
    });
  },[socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on("room:valid", handleValidation);
    socket.on("room:invalid", handleInvalid);
    return () => {
      socket.off("room:valid", handleValidation);
      socket.off("room:invalid", handleInvalid);
    };
  }, [socket, handleValidation, handleInvalid]);

  useEffect(() => {
    socket?.on("room:joined", (data) => {
      localStorage.setItem("webrtc:start", "true");
      router.replace(`Loby/Video/${data.roomId}`);
    });
    return () => {
      socket?.off("room:joined");
    };
  }, [socket, router]);
  const handleJoinViaLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!input.trim()) {
      setError("Please enter a Room ID");
      return;
    }
    console.log("Joining room with ID:", input);
    setIsjoining(true);
    socket?.emit("room:validate", { roomid: input, userDetails: user});
  };

  useEffect(() => {
    socket?.on("already-in-room", (data) => {
      setError(data.message);
      setIsjoining(false);
      setIsCreating(false);
    });
    return () => {
      socket?.off("already-in-room");
    };
  }, [socket]);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const res = await fetch("/api/auth/Logout", {
      method: "POST",
    })
    if (!res.ok) {
      return;
    }
    router.replace("/");
  }
  return (
    <>
    {isCreating || isJoining && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-30 z-50 flex items-center justify-center">
            <Loader2 className="animate-spin text-white w-10 h-10" />
          </div>
      )}
    <div className="w-full h-full bg-white dark:bg-zinc-900 transition-colors duration-300">
      {/* Header */}
      {/* {isreject && <div className="absolute left-1/2 -translate-x-1/2 top-5"><p className="border border-black px-5 py-3 dark:border-amber-50 text-red-500 text-md text-center">{isreject}</p></div>} */}
      <header className="flex items-center justify-between p-6">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">
          Milanio
        </h1>
        <div className="flex items-center gap-4">
          
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full border dark:border-zinc-700 border-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
        >
          {theme === "dark" ? (
            <Sun className="text-yellow-400" size={20} />
          ) : (
            <Moon className="text-blue-600" size={20} />
          )}
        </button>
          <div className="relative">
      {/* User Icon */}
      <button
        onClick={handleShowUser}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <User className="w-6 h-6 text-gray-700 dark:text-gray-200" />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showUserBox && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-10"
          >
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {user?.name || "Loading..."}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email || "Loading..."}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-800 dark:text-gray-200"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col md:flex-row w-full h-[85vh]">
        {/* Left Panel - Create & Join */}
        <div className="w-full h-full md:w-1/2 flex flex-col justify-center items-center px-8 py-12 gap-6">
          <h2 className="text-3xl font-bold text-zinc-800 dark:text-white text-center">
            Start Your Meeting
          </h2>

          <button
            onClick={JoinRoom}
            disabled={isJoining}  
            className="w-full max-w-sm px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg font-medium shadow transition"
          >
            {isCreating ? "Creating Room..." : "Create New Room"}
          </button>

          <div className="w-full max-w-sm flex flex-col gap-2">
            <input
              type="text"
              value={input}
              onChange={handleChange}
              placeholder="Enter Room ID"
              className="px-4 py-3 border rounded-md border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {error && <p className="text-red-500 text-md text-center">{error}</p>}
            {isreject && <p className="text-red-500 text-md text-center">{isreject}</p>}
            <button
              onClick={handleJoinViaLink}
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium shadow transition"
            >
              {isJoining ? "Joining..." : "Join Room"}
            </button>
          </div>
        </div>

        {/* Right Panel - Carousel */}
        <div className="w-full h-full md:w-1/2 py-10 px-6 flex flex-col items-center justify-center gap-6">
          <h3 className="text-2xl font-bold text-center text-zinc-800 dark:text-white">
            Features You'll Love
          </h3>
          <div className="w-full max-w-3xl">
            <Carousel />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
