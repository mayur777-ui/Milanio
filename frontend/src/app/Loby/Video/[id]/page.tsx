"use client";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/Socketcontext";
import { useParams } from "next/navigation";
import PeerService from "@/utility/Peer";
import { useUserid } from "@/context/UserIdcontext";
import Peer from "@/utility/Peer";
import { useRouter } from "next/navigation";
import { PhoneCall } from "lucide-react";
import { flushSync } from "react-dom";
export default function Homepage() {
  const { socket, isConnected, socketId } = useSocket();
  const [input, setInput] = useState<string>("");
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const param = useParams();
  const roomId = param.id as string;
  const [copied, setCopied] = useState(false);
  const [roomStatus, setRoomStatus] = useState<boolean>(false);
  const [ispending, setIspending] = useState<
  { requesterId: string; roomId: string }[]
>([]);
  const [showJoinPermission, setShowJoinPermission] = useState<boolean>(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );

  const [showNotification,setShowNotification] = useState<{leaver:string, roomid:string} | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const router = useRouter();
  const mainUserId = useUserid();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const userIdREF = useRef<string>(mainUserId);
  const streamRef = useRef<MediaStream | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  type ChatMessage = {
    id: string;
    senderid: string;
    message: string;
    timestamp: string;
  };
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (mainUserId) {
      userIdREF.current = mainUserId;
    }
  }, [mainUserId]);

  useEffect(() => {
    streamRef.current = myStream;
  }, [myStream]);


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
    let getStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("📹 Local stream acquired:", stream);
      setMyStream(stream);
      const shouldStart = localStorage.getItem("webrtc:start");
      if (shouldStart === "true") {
        localStorage.removeItem("webrtc:start");
        socket?.emit("webrtc:start", { roomId, ownUserId: mainUserId });
      }
    };
    if(!streamRef.current){
      getStream();
    }
  }, []);

  const handleJoinRequest = useCallback(
    ({ requesterId, roomId }: { requesterId: string; roomId: string }) => {
      // console.log(
      //   "📨 Join request received from:",
      //   requesterId,
      //   "for room:",
      //   roomId
      // );
      setIspending((prev)=>{
        const alreadyRequested = prev.some(req => req.requesterId === requesterId);
  if (alreadyRequested) return prev;
  return [...prev, { requesterId, roomId }];
      }
      );
      setShowJoinPermission(true);
      // console.log("✅ Join request received");
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
    socket?.emit("join:request-accept", {
      requesterId:requesterId,
      roomId: roomId,
    })

    setIspending((prev)=>prev.filter((req)=> req.requesterId !== requesterId));
    if(ispending.length === 0){
      setShowJoinPermission(false);
    }
   
  }, [ispending, socket]);

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
  }, [ispending, socket]);

  type validationDto = {
    roomId: string;
    users: string[];
    userCount: number;
  };

  useEffect(() => {
    const navigateEntries = performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];
    console.log("Navigation type:", navigateEntries[0]?.type);
    const isReload = navigateEntries[0]?.type === "reload";
    if (!socket || !isReload ) return;
    // console.log("🔗 Validating room:", roomId);
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
  }, [socket, roomId]);

  type handleStartCallingDTO = {
    ownSocketId: string;
    roomId: string;
    ownUserId: string;
    users: {
      userId: string;
      RemotesocketId: string;
    }[];
  };

  useEffect(() => {
    const handleStartCalling = async (data: handleStartCallingDTO) => {
      // console.log("📞 Starting call with data:", data);
      let { ownSocketId, roomId, ownUserId, users } = data;
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
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
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
    socket?.on("checking-iceCandidate", (data) => {
      // console.log("🧊 Receiving ICE candidate:", data);
      const peer = PeerService.getPeer(data.remoteUserId);
      peer?.addIceCandidate(new RTCIceCandidate(data.candidate));
    });
    return () => {
      socket?.off("checking-iceCandidate");
    };
  }, [socket]);

  useEffect(() => {
    socket?.on("chat:started", ({ message, senderid }) => {
      const newMsg: ChatMessage = {
        id: crypto.randomUUID(),
        senderid,
        message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      socket?.off("chat:started");
    };
  }, [socket]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handelSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input || typeof input !== "string" || input.trim() === "") {
      // console.error('Invalid input:', input);
      return;
    }

    const message = input.trim();
    socket?.emit("start-chat", { roomId, message, OwnuserId: userIdREF.current });

    setInput("");
  };


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
    setChatMessages([]);
      setIsChatOpen(false);
    setShowJoinPermission(false);
    setIspending([]);
    })
      router.replace('/Loby');
    });

    return ()=>{
      socket.off('room-closed');
    }
  },[router, socket]);

  const totalStreams = remoteStreams.size + (myStream ? 1 : 0);
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
    setIsChatOpen(false);
    setChatMessages([]);
    setShowJoinPermission(false);
    setIspending([]);
    setRoomStatus(false);
    })
    await new Promise((resolve)=> setTimeout(resolve, 100));
    localStorage.removeItem("webrtc:start");
    router.replace("/Loby");
  }


  useEffect(()=>{
    socket?.on("user:left", (data)=>{
      setShowNotification({leaver: data.leaver, roomid: data.roomId});

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
      PeerService.removePeer(data.leaver);
    }

      setTimeout(() => {
      setShowNotification(null);
    }, 3000);
    })
    return () => {
      socket?.off("user:left");
      setShowNotification(null);
    }
  },[socket]);
  return (
    <>
      {/* Optional chat input (currently commented out) */}
      <div className="w-full min-h-screen bg-gray-900 flex flex-col">
        {showNotification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {showNotification.leaver} has left the room {showNotification.roomid}
          </div>
        )}
        <div
          className={`flex-1 p-4 grid ${gridClass} gap-4 place-items-center max-w-[1920px] mx-auto`}
        >
          {myStream && (
            <div className="relative w-full h-full max-h-[360px] sm:max-h-[480px] rounded-lg overflow-hidden shadow-lg">
              <video
                autoPlay
                muted
                playsInline
                ref={(video) => {
                  if (video && myStream) video.srcObject = myStream;
                }}
                className="w-full h-full object-cover bg-black"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                You
              </div>
            </div>
          )}
          {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
            <div
              key={userId}
              className="relative w-full h-full max-h-[360px] sm:max-h-[480px] rounded-lg overflow-hidden shadow-lg"
            >
              <video
                autoPlay
                playsInline
                ref={(video) => {
                  if (video && stream) video.srcObject = stream;
                }}
                className="w-full h-full object-cover bg-black"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {userId}
              </div>
            </div>
          ))}
        </div>

      
          {showJoinPermission && (
          <div className="absolute top-4 right-4 z-50 flex flex-col gap-3 min-h-[400px] max-h-screen">
            {
          ispending.map((request)=>(
            
            <div key={request.requesterId} className=" bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm">
            <p className="text-white text-lg font-semibold mb-4">
              {request?.requesterId} wants to join
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                onClick={()=>handleInAcceptace(request?.requesterId,request?.roomId)}
              >
                Accept
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                onClick={()=>handleInRejected(request?.requesterId,request?.roomId)}
              >
                Reject
              </button>
            </div>
          </div>
          ))}
          </div>
        )}
        

<div className="fixed flex gap-2 items-center justify-center bottom-4 left-1/2 transform -translate-x-1/2">
  <button
        onClick={handleCopy}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
      >
        {copied ? 'Copied!' : 'Share Room Link'}
      </button>
     <button 
  onClick={handleLeaveRoom}
  className="z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
>
  <PhoneCall />
</button>
</div>

        {!isChatOpen && (
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => setIsChatOpen((prev) => !prev)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg"
            >
              💬
            </button>
          </div>
        )}
        

        {isChatOpen && (
          <div className="fixed bottom-16 right-4 z-50 w-80 bg-gray-800 rounded-lg shadow-xl flex flex-col h-[80vh]">
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-t-lg">
              <h3 className="text-white font-semibold">Meeting Chat</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map(({ id, senderid, message, timestamp }) => {
                const isMine = senderid === userIdREF.current;
                return (
                  <div
                    key={id}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        isMine
                          ? "bg-blue-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      <p className="text-sm">{message}</p>
                      <p className="text-xs opacity-70 mt-1">{timestamp}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={handelSubmit}
              className="p-3 border-t border-gray-600"
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 p-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
