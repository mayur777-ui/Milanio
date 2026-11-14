"use client";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/Socketcontext";
import { useParams } from "next/navigation";
import PeerService from "@/utility/Peer";
import { useUserid } from "@/context/UserIdcontext";
import { useRouter } from "next/navigation";
import {
  PhoneOff,
  MicOff,
  Mic,
  CameraOff,
  Camera,
  Copy,
  Check,
  MessageSquare,
  Users,
} from "lucide-react";
import { flushSync } from "react-dom";
import { useRoomReload } from "@/hooks/useRoomReload";
import Chat from "@/component/Chat";
import VideoTile from "@/component/VideoTile";
export default function Homepage() {
  const { socket, isConnected, socketId } = useSocket();
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const param = useParams();
  const roomId = param.id as string;
  const [copied, setCopied] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [roomStatus, setRoomStatus] = useState<boolean>(false);
  const [ispending, setIspending] = useState<
  { requesterId: string; roomId: string, userDetails:{name: string; email: string} }[]
>([]);
  const [showJoinPermission, setShowJoinPermission] = useState<boolean>(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );

  const [showNotification, setShowNotification] = useState<{ leaver: string; leaverName?: string; roomid: string } | null>(null);
  const [hostNotice, setHostNotice] = useState<string | null>(null);
  const [localUserName, setLocalUserName] = useState<string>("You");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload?.name) setLocalUserName(payload.name);
      } catch (_) {}
    }
  }, []);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const handleChatMessageReceived = useCallback(() => {
    setIsChatOpen((open) => {
      if (!open) {
        setUnreadMessages((prev) => prev + 1);
      }
      return open;
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const router = useRouter();
  const mainUserId = useUserid();
  const userIdREF = useRef<string>(mainUserId);
  const streamRef = useRef<MediaStream | null>(null);
  const isReload = useRoomReload(roomId);
  const [toggleStream, setToggleStream] = useState<{cameraToggle?:boolean,micToggle?:boolean}>({
    cameraToggle:true,
    micToggle: true
  });
  type PeerInfo = {
    userId: string;
    name?: string;
    cameraOn: boolean;
    micOn: boolean;
  };
  const [peers, setPeers] = useState<PeerInfo[]>([]);

  useEffect(() => {
    if (mainUserId) {
      userIdREF.current = mainUserId;
    }
  }, [mainUserId]);




  const waitForStream = async(): Promise<MediaStream> =>{
    return new Promise((res,rej)=>{
       const timeout = setTimeout(() => rej(new Error("Stream timeout")), 10000);
      const check=()=>{
        if(streamRef.current){
          console.log("hogya bhai")
          clearTimeout(timeout); 
          res(streamRef.current!);
        }else{
          setTimeout(check, 100);
          console.log("waiting for stream")
        }
      }
      check();
    })
  }

useEffect(() => {
  const getStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      console.log("📹 Local stream acquired:", stream);

      // Optionally inspect tracks
      const allTracks = stream.getTracks();
      console.log("All tracks:", allTracks);

      streamRef.current = stream;
      setMyStream(stream);

      const shouldStart = localStorage.getItem("webrtc:start");
      if (shouldStart === "true") {
        localStorage.removeItem("webrtc:start");
        socket?.emit("webrtc:start", { roomId, ownUserId: mainUserId });
      }
    } catch (err) {
      console.error("❌ Failed to get media stream:", err);

      // Fallback: maybe only request audio if camera fails
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        console.log("🎤 Only audio acquired:", audioStream);
        streamRef.current = audioStream;
        setMyStream(audioStream);
      } catch (audioErr) {
        console.error("❌ No audio devices either:", audioErr);
        // At this point, you could disable call controls / show error UI
      }
    }
  };

  if (!streamRef.current) {
    getStream();
  } else {
    const shouldStart = localStorage.getItem("webrtc:start");
    if (shouldStart === "true" && socket && mainUserId) {
      localStorage.removeItem("webrtc:start");
      socket.emit("webrtc:start", { roomId, ownUserId: mainUserId });
    }
  }
}, [socket, roomId, mainUserId]);

// Hardware teardown on unmount
useEffect(() => {
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };
}, []);


  //   useEffect(() => {
  //   streamRef.current = myStream;
  // }, [myStream]);

  const handleJoinRequest = useCallback(
    ({ requesterId, roomId, userDetails }: { requesterId: string; roomId: string, userDetails:{name: string; email: string}}) => {
      setIspending((prev)=>{
        const alreadyRequested = prev.some(req => req.requesterId === requesterId);
  if (alreadyRequested) return prev;
  return [...prev, { requesterId, roomId, userDetails }];
      }
      );
      setShowJoinPermission(true);
    },
    [setIspending, setShowJoinPermission]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("incomming:join-request", handleJoinRequest);

    return () => {
      socket.off("incomming:join-request", handleJoinRequest);
    };
  }, [socket, handleJoinRequest]);

  const handleInAcceptace = useCallback((requesterId:string, roomId:string) => {
    if(!requesterId || !roomId){
      return;
    }
    console.log("yes i click it");
    console.log("Accepting join request from:", requesterId, "for room:", roomId);
    socket?.emit("join:request-accept", {
      requesterId:requesterId,
      roomId: roomId,
    })

    setIspending((prev)=>prev.filter((req)=> req.requesterId !== requesterId));
    if(ispending.length === 0){
      setShowJoinPermission(false);
    }
   
  }, [socket]);

  const handleInRejected = useCallback((requesterId:string, roomId:string ) => {
    if(!requesterId || !roomId){
      return;
    }
      socket?.emit("join:request-rejected", {
      requesterId: requesterId,
      roomId: roomId
    })
    
    setIspending((prev)=>prev.filter((req)=> req.requesterId !== requesterId));
    if(ispending.length === 0){
      setShowJoinPermission(false);
    }
  }, [socket]);

  type validationDto = {
    roomId: string;
    users: string[];
    userCount: number;
  };

  useEffect(() => {
    
    console.log("Navigation type:", isReload);
    if (!socket || !isReload ) return;
    const handleRealoadValidation = async() => {
      try {
        await waitForStream();
        socket.emit("room:validate", { roomid: roomId });

      }catch(error){
        console.error("Error during room validation:", error);
      }
    };
    handleRealoadValidation();
    const handleValid = (data: validationDto) => {
      console.log("room validation success", data);
      // If this user is not the initiator and they're in the room, start WebRTC
      const currentUserId = userIdREF.current;
      const currentStream = streamRef.current;
      if (data.users && data.users.length > 1 && currentStream) {
        // console.log(
        //   "🚀 Multiple users in room, starting WebRTC for:",
        //   currentUserId
        // );
        socket?.emit("webrtc:start", {
          roomId: data.roomId,
          ownUserId: currentUserId,
        });
      }
    };
    const handleInvalid = ({ message }: { message: string }) => {
      setRoomStatus(true);
    };
    socket.on("room:valid", handleValid);
    socket.on("room:invalid", handleInvalid);
    return () => {
      socket.off("room:valid", handleValid);
      socket.off("room:invalid", handleInvalid);
    };
  }, [socket, roomId, isReload]);

  type handleStartCallingDTO = {
    ownSocketId: string;
    roomId: string;
    ownUserId: string;
    users: {
      userId: string;
      RemotesocketId: string;
      name?: string;
    }[];
  };

  useEffect(() => {
    const handleStartCalling = async (data: handleStartCallingDTO) => {
      // console.log("📞 Starting call with data:", data);
      const justLeft = localStorage.getItem("just:leave");
      if(justLeft === "true"){
        await new Promise((resolve)=> setTimeout(resolve, 2000));
        localStorage.removeItem("just:leave");
      }
      let { ownSocketId, roomId, ownUserId, users } = data;

      setPeers((prev) => {
        const next = [...prev];
        users.forEach((u) => {
          const idx = next.findIndex((p) => p.userId === u.userId);
          if (idx >= 0) {
            next[idx] = { ...next[idx], name: u.name };
          } else {
            next.push({ userId: u.userId, name: u.name, cameraOn: true, micOn: true });
          }
        });
        return next;
      });

      await Promise.all(
        users.map(async ({ userId, RemotesocketId }) => {
          const existingPeer = PeerService.getPeer(userId);
          if (existingPeer) {
            PeerService.removePeer(userId);
          }
          console.log('call start kar de bha')
          const peer = PeerService.createPeerConnection(userId);
          // console.log(
          //   "🔗 Created peer connection for user:",
          //   userId,
          //   "with socket:",
          //   RemotesocketId
          // // );
          // console.log("what is peer: ", peer);
          // Set up ICE candidate handling
          peer.onicecandidate = (e) => {
            // console.log(
            //   "🧊 ICE candidate event for user:",
            //   userId,
            //   "candidate:",
            //   e.candidate
            // );
            if (e.candidate) {
              // console.log(
              //   "🧊 ICE candidate from User B to User A:",
              //   e.candidate
              // );
              socket?.emit("icecandidate-check", {
                to: userId, // User A's userid
                candidate: e.candidate,
                requesterId: ownUserId, // User B
              });
            }
          };
          // console.log('stream:', myStream);
          const currentStream = await waitForStream();
          console.log("currentStream:", currentStream);
          if (currentStream) {
            console.log("📹 Adding local stream to peer for user:", userId);
            PeerService.addTrack(peer, currentStream);
          }

          peer.ontrack = (e) => {
            // console.log(
            //   "🎯 ontrack fired for user:",
            //   userId,
            //   "stream:",
            //   e.streams[0]
            // );
            const remoteStream = e.streams[0];
            setRemoteStreams((prev) => {
              const newMap = new Map(prev).set(userId, remoteStream);
              // console.log("📺 Updated remoteStreams map:", newMap);
              return newMap;
            });
          };
          const offer = await PeerService.getOffer(userId);
          // await peer.setLocalDescription(offer);

          socket?.emit("webrtc:offer", {
            requesterId: ownUserId,
            targetuserId: userId,
            offer,
          });
        })

      );
    };
    socket?.on("start:call", handleStartCalling);
    return () => {
      socket?.off("start:call", handleStartCalling);
    };
  }, [socket, myStream]);

  useEffect(() => {
    const handleOffering = async ({
      requesterId,
      offer,
    }: {
      requesterId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      const existingPeer = PeerService.getPeer(requesterId);
      if (existingPeer) {
        PeerService.removePeer(requesterId);
         await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log("hello i am mayur at webrtc:shared");
      // console.log(
      //   "📞 WebRTC offer received from:",
      //   from,
      //   "requesterId:",
      //   requesterId,
      //   "offer:",
      //   offer
      // );
      const peer = PeerService.createPeerConnection(requesterId);
      // console.log("📦 Peer created:", peer);
      // console.log("📦 ICE gathering state:", peer.iceGatheringState);
      // console.log("📦 Signaling state:", peer.signalingState);
      // console.log(mainUserId);
      peer.onicecandidate = (e) => {
        console.log("🧊 ICE candidate generated:", e.candidate);
        if (e.candidate) {
          console.log("🧊 ICE candidate from User A to User B:", e.candidate);
          socket?.emit("icecandidate-check", {
            to: requesterId,
            candidate: e.candidate,   
            requesterId: mainUserId, // This is the key used to get the peer later
          });
        } else {
          console.log("🧊 No more ICE candidates from User A to User B");
        }
      };
      

      peer.ontrack = (e) => {
        // console.log(
        //   "🎯 ontrack fired for requesterId:",
        //   requesterId,
        //   "stream:",
        //   e.streams[0]
        // );
        const remoteStream = e.streams[0];
        setRemoteStreams((prev) => {
          const newMap = new Map(prev).set(requesterId, remoteStream);
          // console.log("📺 Updated remoteStreams map:", newMap);
          return newMap;
        });
      };
      await PeerService.SetRemoteDescription(requesterId, offer);
      // console.log("📦 Remote description set:", peer.remoteDescription);
      const currentStream = streamRef.current;
      console.log(currentStream);
      if (currentStream) {
        PeerService.addTrack(peer, currentStream);
      }
      const ans = await PeerService.getAnswer(requesterId);
      // console.log("📦 Local description set (answer):", peer.localDescription);

      socket?.emit("send:ans", {to: requesterId, ans });
    };
    socket?.on("webrtc:shared", handleOffering);
    return () => {
      socket?.off("webrtc:shared", handleOffering);
    };
  }, [socket]);

// webrtc:getAns handler mein add karo:
useEffect(() => {
  const handleAcceptAns = async ({
    ans,
    remoteUserId,
  }: {
    ans: RTCSessionDescriptionInit;
    remoteUserId: string;
  }) => {
    console.log("🔍 ==================");
    console.log("🔍 ANSWER RECEIVED DEBUG");
    console.log("🔍 RemoteUserId:", remoteUserId);
    console.log("🔍 Answer type:", ans.type);
    
    const peer = PeerService.getPeer(remoteUserId);
    if (peer) {
      console.log("🔍 Peer signaling state:", peer.signalingState);
      console.log("🔍 Peer connection state:", peer.connectionState);
      console.log("🔍 Has local description:", !!peer.localDescription);
      console.log("🔍 Has remote description:", !!peer.remoteDescription);
      console.log("🔍 Local description type:", peer.localDescription?.type);
      if (peer.remoteDescription || peer.signalingState === 'stable') {
        console.log("✅ Answer already processed, skipping duplicate");
        console.log("🔍 ==================");
        return;
      }
    } else {
      console.log("❌ No peer found for remoteUserId:", remoteUserId);
    }
    console.log("🔍 ==================");
    
    await PeerService.SetRemoteDescription(remoteUserId, ans);      
  };
  socket?.on("webrtc:getAns", handleAcceptAns);
  return () => {
    socket?.off("webrtc:getAns", handleAcceptAns);
  };
}, [socket]);

  useEffect(() => {
    socket?.on("checking-iceCandidate", async (data: { candidate: RTCIceCandidateInit; remoteUserId: string }) => {
      if (data?.candidate && data?.remoteUserId) {
        await PeerService.addIceCandidate(data.remoteUserId, data.candidate);
      }
    });
    return () => {
      socket?.off("checking-iceCandidate");
    };
  }, [socket]);

 
 


  useEffect(()=>{
    if(!socket)return;
    socket.on('room-closed', ()=>{
      PeerService.clearAll();
      if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
      streamRef.current = null;
    }
    flushSync(()=>{
    setMyStream(null);
    setRemoteStreams(new Map());
   
    setShowJoinPermission(false);
    setIspending([]);
    })
      router.replace('/Loby');
    });

    return ()=>{
      socket.off('room-closed');
    }
  },[router, socket]);

  const totalStreams = remoteStreams.size + (streamRef.current ? 1 : 0);
  let gridClass = "grid-cols-1";
  if (totalStreams === 2) gridClass = "grid-cols-2";
  else if (totalStreams === 3) gridClass = "grid-cols-3";
  else if (totalStreams === 4) gridClass = "grid-cols-2 grid-rows-2";
  else if (totalStreams === 5 || totalStreams === 6)
    gridClass = "grid-cols-3 grid-rows-2";
  else if (totalStreams === 7 || totalStreams === 8)
    gridClass = "grid-cols-4 grid-rows-2";
  else if (totalStreams === 9) gridClass = "grid-cols-3 grid-rows-3";
  else if (totalStreams >= 10) gridClass = "grid-cols-4";
  // }

  const handleLeaveRoom = async() => {
    if (!socket) return;
    socket.emit("leave:room", { roomId, OwnuserId: mainUserId });
    localStorage.setItem("just:leave", "true");
    PeerService.clearAll();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track)=>{
        track.stop();
      });
      streamRef.current = null;
    }
    remoteStreams.forEach((stream, userId) => {
        stream.getTracks().forEach(track => track.stop());
        console.log(`🛑 Stopped remote stream for ${userId}`);
      });
    flushSync(()=>{
      setMyStream(null);
    setRemoteStreams(new Map());
    setShowJoinPermission(false);
    setIspending([]);
    setRoomStatus(false);
    })
    await new Promise((resolve)=> setTimeout(resolve, 1000));
    localStorage.removeItem("webrtc:start");
    router.replace("/Loby");
  }


  useEffect(()=>{
    socket?.on("user:left", (data: { leaver: string; leaverName?: string; roomId: string })=>{
      setShowNotification({leaver: data.leaver, leaverName: data.leaverName, roomid: data.roomId});

      // REMOVE THE STREAM FROM THE MAP
      setRemoteStreams((prev)=>{
        const newMap = new Map(prev);
        newMap.delete(data.leaver);
        return newMap;
      });

      // remove user's peer connection
      const existingPeer = PeerService.getPeer(data.leaver);
    if (existingPeer) {
      console.log("🧹 Cleaning up peer for left user:", data.leaver);
       const remoteStream = remoteStreams.get(data.leaver);
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => {
          track.stop();
          console.log(`🛑 Stopped remote track for ${data.leaver}:`, track.kind);
        });
      }
      PeerService.removePeer(data.leaver);
    }

      setTimeout(() => {
      setShowNotification(null);
    }, 4000);
    })
    return () => {
      socket?.off("user:left");
    }
  },[socket, remoteStreams]);
  


const toggleMic = () => {
  if (!streamRef.current) return;
  streamRef.current.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled; // mute/unmute
  });
  const newMicState = !toggleStream.micToggle;
  setToggleStream(prev => ({
    ...prev, micToggle: newMicState
  }))

  socket?.emit('mic:toggle', {
    userId:mainUserId,
    micOn: newMicState,
    roomId
  })
};

const toggleCamera = () => {
  if (!streamRef.current) return;

  streamRef.current.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled; // on/off
  });
  const newCameraState = !toggleStream.cameraToggle
  setToggleStream(prev => ({
    ...prev, cameraToggle: newCameraState
  }))

  socket?.emit('camera:toggle',{
    userId:mainUserId,
    cameraOn:newCameraState,
    roomId
  })
};


  useEffect(() => {
    if (!socket) return;

    const handleMicToggle = (data: { userId: string; micOn: boolean }) => {
      setPeers((prev) => {
        const exist = prev.find((p) => p.userId === data.userId);
        if (exist) {
          return prev.map((peer) =>
            peer.userId === data.userId ? { ...peer, micOn: data.micOn } : peer
          );
        } else {
          return [...prev, { userId: data.userId, micOn: data.micOn, cameraOn: true }];
        }
      });
    };

    const handleCameraToggle = (data: { userId: string; cameraOn: boolean }) => {
      setPeers((prev) => {
        const exist = prev.find((p) => p.userId === data.userId);
        if (exist) {
          return prev.map((peer) =>
            peer.userId === data.userId ? { ...peer, cameraOn: data.cameraOn } : peer
          );
        } else {
          return [...prev, { userId: data.userId, micOn: true, cameraOn: data.cameraOn }];
        }
      });
    };

    const handleHostPromoted = (data: { newHostId: string; newHostName: string }) => {
      if (data.newHostId === mainUserId) {
        setHostNotice("You are now the meeting host");
      } else {
        setHostNotice(`${data.newHostName || "A participant"} is now the meeting host`);
      }
      setTimeout(() => setHostNotice(null), 5000);
    };

    socket.on("peer:mic-toggled", handleMicToggle);
    socket.on("peer:camera-toggled", handleCameraToggle);
    socket.on("host:promoted", handleHostPromoted);

    return () => {
      socket.off("peer:mic-toggled", handleMicToggle);
      socket.off("peer:camera-toggled", handleCameraToggle);
      socket.off("host:promoted", handleHostPromoted);
    };
  }, [socket, mainUserId]);


  return (
    <div className="w-full h-screen bg-zinc-950 flex overflow-hidden text-zinc-100 select-none">
      {/* Main Video Arena */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Toast Notification when participant leaves */}
        {showNotification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 text-zinc-200 px-4 py-2 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            <span>
              <strong className="text-white">{showNotification.leaverName || `User ${showNotification.leaver.slice(0, 6)}`}</strong> left the meeting
            </span>
          </div>
        )}

        {/* Host Promoted Toast Notification */}
        {hostNotice && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-indigo-950/95 backdrop-blur-xl border border-indigo-700/60 text-indigo-200 px-4 py-2 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>{hostNotice}</span>
          </div>
        )}

        {/* Top Meeting Header */}
        <header className="px-6 py-3.5 flex items-center justify-between z-20 border-b border-zinc-900/60 bg-zinc-950/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm tracking-wide text-zinc-200">Milanio</span>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-800/80 px-2.5 py-1 rounded-md text-xs font-mono text-zinc-300">
              <span>{roomId}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
              title="Copy Meeting Link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-800">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              <span>{totalStreams}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Video Grid Area */}
        <main className="flex-1 p-4 md:p-6 pb-24 overflow-y-auto flex items-center justify-center">
          <div
            className={`w-full h-full max-w-7xl mx-auto grid ${gridClass} gap-4 place-content-center place-items-center`}
          >
            {/* Local Video Stream */}
            {streamRef.current && (
              <div className="relative w-full h-full min-h-[200px] max-h-[520px] aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-2xl flex items-center justify-center group transition-all">
                <VideoTile
                  stream={streamRef.current}
                  isLocal={true}
                />

                {/* Local Camera Off Fallback */}
                {!toggleStream.cameraToggle && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-800 border-2 border-zinc-700/80 flex items-center justify-center text-white text-2xl font-bold shadow-xl transition-all ${
                        toggleStream.micToggle
                          ? "ring-4 ring-emerald-500/30 ring-offset-4 ring-offset-zinc-900 animate-pulse"
                          : ""
                      }`}
                    >
                      {localUserName ? localUserName.slice(0, 2).toUpperCase() : "You"}
                    </div>
                    <span className="text-zinc-400 text-xs mt-3 font-medium flex items-center gap-1.5">
                      <CameraOff className="w-3.5 h-3.5 text-zinc-500" /> Camera off
                    </span>
                  </div>
                )}

                {/* Identity Badge */}
                <div className="absolute bottom-3 left-3 bg-zinc-950/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/80 text-white text-xs font-medium flex items-center gap-2 z-20 shadow-md">
                  <span>{localUserName} (You)</span>
                  {toggleStream.micToggle ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Microphone active" />
                  ) : (
                    <span title="Muted">
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Remote Participants' Video Streams */}
            {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
              const peerInfo = peers.find((p) => p.userId === userId);
              const isCamOn = peerInfo ? peerInfo.cameraOn : true;
              const isMicOn = peerInfo ? peerInfo.micOn : true;
              const displayName = peerInfo?.name || `User ${userId.slice(0, 6)}`;
              const initials = displayName.slice(0, 2).toUpperCase();

              return (
                <div
                  key={userId}
                  className="relative w-full h-full min-h-[200px] max-h-[520px] aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-2xl flex items-center justify-center group transition-all"
                >
                  <VideoTile
                    stream={stream}
                    isLocal={false}
                  />

                  {/* Remote Camera Off Fallback */}
                  {!isCamOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 z-10">
                      <div
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-800 border-2 border-zinc-700/80 flex items-center justify-center text-white text-2xl font-bold shadow-xl transition-all ${
                          isMicOn
                            ? "ring-4 ring-emerald-500/30 ring-offset-4 ring-offset-zinc-900 animate-pulse"
                            : ""
                        }`}
                      >
                        {initials}
                      </div>
                      <span className="text-zinc-400 text-xs mt-3 font-medium flex items-center gap-1.5">
                        <CameraOff className="w-3.5 h-3.5 text-zinc-500" /> Camera off
                      </span>
                    </div>
                  )}

                  {/* Identity Badge */}
                  <div className="absolute bottom-3 left-3 bg-zinc-950/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800/80 text-white text-xs font-medium flex items-center gap-2 z-20 shadow-md">
                    <span>{displayName}</span>
                    {isMicOn ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Microphone active" />
                    ) : (
                      <span title="Muted">
                        <MicOff className="w-3.5 h-3.5 text-red-400" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* Host Admission / Knocking Dialog */}
        {showJoinPermission && ispending.length > 0 && (
          <div className="absolute top-16 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
            {ispending.map((request) => (
              <div
                key={request.requesterId}
                className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 p-4 rounded-xl shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center font-bold text-sm">
                    {(request?.userDetails?.name || request.requesterId).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">
                      {request?.userDetails?.name ?? `User ${request.requesterId.slice(0, 6)}`}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">Wants to join the call</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium transition cursor-pointer"
                    onClick={() => handleInRejected(request?.requesterId, request?.roomId)}
                  >
                    Deny
                  </button>
                  <button
                    className="px-3.5 py-1.5 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold rounded-lg text-xs transition cursor-pointer shadow-sm"
                    onClick={() => handleInAcceptace(request?.requesterId, request?.roomId)}
                  >
                    Admit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modern Floating Control Dock Toolbar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/90 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3">
          {/* Mic Button */}
          <button
            onClick={toggleMic}
            title={toggleStream.micToggle ? "Mute Microphone" : "Unmute Microphone"}
            className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              toggleStream.micToggle
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60"
                : "bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25"
            }`}
          >
            {toggleStream.micToggle ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-400" />}
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            title={toggleStream.cameraToggle ? "Turn Off Camera" : "Turn On Camera"}
            className={`p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              toggleStream.cameraToggle
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60"
                : "bg-red-500/15 border border-red-500/40 text-red-400 hover:bg-red-500/25"
            }`}
          >
            {toggleStream.cameraToggle ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5 text-red-400" />}
          </button>

          {/* Chat Toggle Button */}
          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              if (!isChatOpen) setUnreadMessages(0);
            }}
            title={isChatOpen ? "Close Chat" : "Open Chat"}
            className={`relative p-3 rounded-xl transition-all duration-200 cursor-pointer ${
              isChatOpen
                ? "bg-white text-zinc-950 font-semibold shadow-md"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/60"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadMessages > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-900">
                {unreadMessages}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-zinc-800 mx-1" />

          {/* Leave Call Button */}
          <button
            onClick={handleLeaveRoom}
            title="Leave Meeting"
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-lg shadow-red-600/20"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* In-Call Chat Sidebar Drawer */}
      <Chat
        socket={socket}
        roomId={roomId}
        userid={mainUserId as string}
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        onMessageReceived={handleChatMessageReceived}
      />
    </div>
  );
}
