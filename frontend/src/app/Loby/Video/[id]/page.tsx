"use client";
import React, { use, useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/context/Socketcontext";
import { useParams } from "next/navigation";
import PeerService from "@/utility/Peer";
import { useUserid } from "@/context/UserIdcontext";
import { useRouter } from "next/navigation";
import { PhoneCall,MicOff,Mic,CameraOff,Camera } from "lucide-react";
import { flushSync } from "react-dom";
import { useRoomReload } from "@/hooks/useRoomReload";
import Chat from "@/component/Chat";
export default function Homepage() {
  const { socket, isConnected, socketId } = useSocket();
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const param = useParams();
  const roomId = param.id as string;
  const [copied, setCopied] = useState(false);
  const [roomStatus, setRoomStatus] = useState<boolean>(false);
  const [ispending, setIspending] = useState<
  { requesterId: string; roomId: string, userDetails:{name: string; email: string} }[]
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
  const userIdREF = useRef<string>(mainUserId);
  const streamRef = useRef<MediaStream | null>(null);
  const isReload = useRoomReload(roomId);
  const [toggleStream, setToggleStream] = useState<{cameraToggle?:boolean,micToggle?:boolean}>({
    cameraToggle:true,
    micToggle: true
  });
  type PeerInfo = {
    userId: string,
    cameraOn: boolean,
    micOn: boolean
  }
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
  }
}, [socket, roomId, mainUserId]);


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


  useEffect(()=>{
    socket?.on('peer:mic-toggled',(data: { userId: string; micOn: boolean })=>{
      setPeers(prev => {
        let exist = prev.find(p => p.userId === data.userId)
        if(exist){
          return prev.map(peer => peer.userId === data.userId ? {...peer, micOn: data.micOn} : peer)
        }else{
          return [...prev, {userId: data.userId, micOn: data.micOn, cameraOn: true}]
        }
      })
    })
  },[socket])



  useEffect(()=>{
    socket?.on('peer:camera-toggled', (data: {userId:string,cameraOn: boolean})=>{
      setPeers(prev => {
        let exist  = prev.map(p => p.userId === data.userId)
        if(exist){
          return prev.map(peer => peer.userId === data.userId ? {...peer, cameraOn: data.cameraOn}: peer)
        }else{
          return [...prev, {userId: data.userId, micOn:true, cameraOn: data.cameraOn}]
        }
      })
    })
  })


  return (
    <>
      {/* Optional chat input (currently commented out) */}
      <div className="w-full min-h-screen bg-black flex flex-col">
        {showNotification && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {showNotification.leaver} has left the room {showNotification.roomid}
          </div>
        )}
        <div
          className={`flex-1 p-4 grid ${gridClass} gap-4 place-items-center max-w-[1920px] mx-auto`}
        >
          {streamRef.current && (
            <div className="relative w-full h-full max-h-[360px] sm:max-h-[480px] rounded-lg overflow-hidden shadow-lg">
              <video
                autoPlay
                muted
                playsInline
                ref={(video) => {
                  if (video && streamRef.current) video.srcObject = streamRef.current;
                }}
                className="w-full h-full object-cover bg-black"
              />
              {
                !toggleStream.cameraToggle && (
                   <div className="absolute inset-0 flex items-center justify-center bg-blue-300 bg-opacity-70 rounded-lg">
      <div className="flex flex-col items-center space-y-2 text-white">
        <CameraOff size={40} />
        <span>Camera Off</span>
      </div>
    </div>
                )
              }
              <div className="absolute bottom-2 left-2 bg-gray bg-opacity-50 text-white px-2 py-1 rounded text-sm">
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
              {peers.length > 0 && peers.map(p => {
                return <div key={userId}>
                {(p.userId === userId) && <>
                  {!p.micOn && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full">
          <MicOff className="text-red-500" />
        </div>
      )}
                  {!p.cameraOn && <div className="absolute inset-0 flex items-center justify-center bg-blue-300 bg-opacity-70 rounded-lg">
      <div className="flex flex-col items-center space-y-2 text-white">
        <CameraOff size={40} />
        <span>Camera Off</span>
      </div>
    </div>}
                </> }
                </div>
              })}
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
              {request?.userDetails?.name ?? request?.requesterId} wants to join
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
        

<div className="fixed flex gap-2 items-center justify-center bottom-4 left-1/2 transform -translate-x-1/2 p-3">
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
<button 
  onClick={toggleMic}
  className="z-50 bg-gray-300 hover:bg-gray-600 hover:text-black text-zinc-700 px-4 py-2 rounded-lg"
>
  {toggleStream.micToggle ? <Mic />:<MicOff />}
</button>
<button 
  onClick={toggleCamera}
  className="z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
>
  {toggleStream.cameraToggle ? <Camera />: <CameraOff />}
</button>
</div>

<Chat socket={socket} roomId={roomId}  userid={mainUserId as string}/>
      </div>
    </>
  );
}
