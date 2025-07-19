import express from "express";
import { createServer } from "http";
import { DisconnectReason, Server } from "socket.io";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const userInROOM = new Map<string, Set<string>>();
const pendingRoomDeletion = new Map<string, NodeJS.Timeout>();
const pendingUserCleanup = new Map<string, NodeJS.Timeout>();
const roomInitiator = new Map<string, string>();
const userSocketMap = new Map<string, string>();
const mapRoomTouserId = new Map<string, string>();
const alreadyLeaveUser = new Set<string>();
io.on("connection", (socket) => {
  console.log(`user ${socket.id} connected`);
  const userId = socket.handshake.query.userId as string;
  userSocketMap.set(userId, socket.id);
  socket.on("create:room", ({ roomId }: { roomId: string }) => {
    if ([...roomInitiator.values()].includes(userId)) {
      socket.emit("room:exists", { message: "you are already in a room" });
      return;
    }

    const existingSocketId = userSocketMap.get(userId);
    if (!existingSocketId || existingSocketId !== socket.id) {
      userSocketMap.set(userId, socket.id);
    }
    userInROOM.set(roomId, new Set([userId]));
    roomInitiator.set(roomId, userId);
    mapRoomTouserId.set(userId, roomId);
    socket.join(roomId);
    socket.emit("room:created", {
      roomId: roomId,
      message: "Room created successfully",
      userId: userId,
      socketid: socket.id,
    });
    console.log(userInROOM);
  });
  socket.on("room:validate", ({ roomid }: { roomid: string }) => {
    console.log("validating room by user iD", userId);
    if (!userInROOM.has(roomid)) {
      socket.emit("room:invalid", { message: "not exist" });
      return;
    }

    if (pendingRoomDeletion.has(roomid)) {
      clearTimeout(pendingRoomDeletion.get(roomid));
      pendingRoomDeletion.delete(roomid);
      let roomUsers = userInROOM.get(roomid);
      roomUsers?.add(userId);
    }

    if (pendingUserCleanup.has(userId)) {
      clearTimeout(pendingUserCleanup.get(userId));
      pendingUserCleanup.delete(userId);
      let roomid = mapRoomTouserId.get(userId);
      if (roomid) {
        const roomUser = userInROOM.get(roomid);
        roomUser?.add(userId);
      }
    }

    const currentRoom = mapRoomTouserId.get(userId);
    if (currentRoom && currentRoom !== roomid) {
      socket.emit("already-in-room", {
        message: `You are already in room ${currentRoom}. Leave it first.`,
      });
      return;
    }
    const roomUser = userInROOM.get(roomid)!;
    // console.log(roomUser);
    const isRejoining = roomUser.has(userId);
    if (isRejoining) {
      socket.join(roomid);
      socket.emit("room:valid", {
        roomId: roomid,
        users: Array.from(roomUser),
        userCount: roomUser.size,
        rejoined: true,
      });
      console.log(`[REJOIN] ${userId} silently rejoined room ${roomid}`);
      return;
    }
    const initator = roomInitiator.get(roomid);
    const initatorSocket = userSocketMap.get(initator!);
    // console.log(initatorSocket);
    if (initatorSocket) {
      io.to(initatorSocket).emit("incomming:join-request", {
        requesterId: userId,
        roomId: roomid,
      });
      console.log(
        `📨 Sent join request from ${userId} ➝ to initiator ${initator}`
      );
    }
  });

  socket.on(
    "join:request-accept",
    ({ requesterId, roomId }: { requesterId: string; roomId: string }) => {
      // Now you can use requesterId and roomId directly
      const roomUser = userInROOM.get(roomId)!;
      // console.log(
      //   "✅ Initiator accepted request for",
      //   requesterId,
      //   "to join room",
      //   roomId
      // );
      const targetSocketId = userSocketMap.get(requesterId);
      if (targetSocketId) {
        io.to(targetSocketId).emit("join:approved", {
          roomId,
          ownUserId: requesterId,
        });
      }
    }
  );

  socket.on("join:request-rejected", (data) => {
    const targetSocketId = userSocketMap.get(data.requesterId);
    if (targetSocketId) {
      io.to(targetSocketId).emit("join:rejected", {
        message: "not allow to join",
      });
    }
  });
  socket.on("join:room", ({ roomId, ownUserId }) => {
    socket.join(roomId);
    console.log(userInROOM);
    const roomUsers = userInROOM.get(roomId);
    roomUsers?.add(userId);
    mapRoomTouserId.set(userId, roomId);
    console.log(`${userId} joined room ${roomId}`);
    socket.emit("room:joined", { roomId, ownUserId });
  });

  socket.on(
    "webrtc:start",
    ({ roomId, ownUserId }: { roomId: string; ownUserId: string }) => {
      const roomUsers = userInROOM.get(roomId);
      const ownSocketId = userSocketMap.get(ownUserId);
      console.log("bhai me bina bole hi restart hogya kyu");
      // console.log(
      //   `📞 Starting WebRTC call in room ${roomId} for requester ${ownUserId}`,
      //   roomUsers
      // );
      if (!roomUsers) {
        console.log(`❌ Room ${roomId} does not exist or has no users.`);
        return;
      }
      const otherSocketIds = Array.from(roomUsers)
        .filter((user) => user !== ownUserId)
        .map((userId) => {
          let RemotesocketId = userSocketMap.get(userId);
          if (!RemotesocketId) return;
          return { userId, RemotesocketId };
        })
        .filter(Boolean);
      // console.log(`📞 Data being sent:`, {
      //   ownSocketId,
      //   roomId,
      //   ownUserId,
      //   users: otherSocketIds,
      // });
      // console.log(`📞 About to emit start:call to socket: ${socket.id}`);
      socket.emit("start:call", {
        ownSocketId,
        roomId,
        ownUserId,
        users: otherSocketIds,
      });
      // console.log(`📞 start:call emitted successfully`);
    }
  );

  socket.on(
    "webrtc:offer",
    ({ requesterId, targetuserId, offer}) => {
      console.log(
        `📞 WebRTC offer from ${requesterId} to ${targetuserId}:`,
        offer
      );
      const targetSocketId = userSocketMap.get(targetuserId)!;
      socket
        .to(targetSocketId)
        .emit("webrtc:shared", {requesterId, offer });
    }
  );

  socket.on("send:ans", ({to: requesterId, ans }) => {
    // console.log(`📞 Sending WebRTC answer to ${to} from ${socket.id}:`, ans);
    
    const toSocketId = userSocketMap.get(requesterId)!;
    console.log("sending ans to", userId, "ans is",requesterId);
    socket.to(toSocketId).emit("webrtc:getAns", {
        ans,
        remoteUserId: userId,
      });
  });

  // socket.on('iceshare:start',({to, requesterId, remoteUserId})=>{
  //     console.log(`🧊 Starting ICE sharing from ${requesterId} to ${to} for remote user ${remoteUserId}`);
  //     socket.emit('ice-start:sharing', {to, requesterId, remoteUserId});
  // })

  socket.on("icecandidate-check", ({ to, candidate, requesterId }) => {
    console.log(`🧊 ICE candidate from ${requesterId} to ${to}:`, candidate);
    const toSocketId = userSocketMap.get(to)!;
    socket
      .to(toSocketId)
      .emit("checking-iceCandidate", { candidate, remoteUserId: requesterId });
  });

  socket.on("start-chat", ({ roomId, message, OwnuserId }) => {
    console.log(`💬 Starting chat in room ${roomId} with message:`, message);
    io.to(roomId).emit("chat:started", { message, senderid: OwnuserId });
  });

  socket.on("leave:room", ({ roomId, OwnuserId }) => {
    console.log(`👋 User ${OwnuserId} is leaving room ${roomId}`);
    if (!userInROOM.has(roomId)) {
      console.log(`❌ Room ${roomId} does not exist.`);
      return;
    }
    const roomUsers = userInROOM.get(roomId);
    if (!roomUsers) {
      console.log(`❌ No users in room ${roomId}.`);
      return;
    }

    if(roomInitiator.get(roomId) === OwnuserId) {
      io.to(roomId).emit("room-closed", {
        message: "Room closed by creator.",
      });
      io.in(roomId).socketsLeave(roomId);
      userInROOM.delete(roomId);
      roomInitiator.delete(roomId);
      mapRoomTouserId.forEach((value, key) => {
        if (value === roomId) {
          mapRoomTouserId.delete(key);
        }
        // console.log(`💣 Room ${roomId} force closed by initiator ${OwnuserId}`);
      });
    }
    if (roomUsers.has(OwnuserId)) {
      roomUsers.delete(OwnuserId);
      mapRoomTouserId.delete(OwnuserId);
      userSocketMap.delete(OwnuserId);
      socket.leave(roomId);
      alreadyLeaveUser.add(OwnuserId);
    }
    if(userInROOM.get(roomId)?.size === 0) {
      userInROOM.delete(roomId);
      roomInitiator.delete(roomId);
      mapRoomTouserId.forEach((value, key) => {
        if (value === roomId) {
          mapRoomTouserId.delete(key);
        }
      });
      userSocketMap.forEach((value, key) => {
        if (value === roomId) {
          userSocketMap.delete(key);
        }
      });
    }
    socket.to(roomId).emit("user:left", { leaver: OwnuserId, roomId });
  });
  socket.on("disconnect", (reason: DisconnectReason) => {
    // for me(for each has parameter for map like this map.foreach((value, key)))
    console.log("disconnect emited");
    if (alreadyLeaveUser.has(userId)) {
      alreadyLeaveUser.delete(userId);
      return;
    }
    userInROOM.forEach((userSet, roomId) => {
      if (userSet.has(userId)) {
        userSet.delete(userId);
        // console.log(`Removed user ${userId} from room ${roomId}`);

        const isInitiator = roomInitiator.get(roomId) === userId;
        if (isInitiator) {
          const timeOut = setTimeout(() => {
            if (userInROOM.get(roomId)?.has(userId) === false) {
              userInROOM.delete(roomId);
              roomInitiator.delete(roomId);
              mapRoomTouserId.delete(userId);
              io.to(roomId).emit("room-closed", {
                message: "Room closed by creator.",
              });
              io.in(roomId).socketsLeave(roomId);
              console.log(
                `💣 Room ${roomId} force closed (initiator didn't come back)`
              );
            }
            pendingRoomDeletion.delete(roomId);
          }, 10000);

          pendingRoomDeletion.set(roomId, timeOut);
        } else {
          const timeOut = setTimeout(() => {
            if (userInROOM.get(roomId)?.has(userId) === false) {
              // userInROOM.get(roomId)?.delete(userId);
              mapRoomTouserId.delete(userId);
              console.log(
                `🗑️ User ${userId} removed from room ${roomId} after timeout.`
              );
            }
            pendingUserCleanup.delete(userId);
          }, 10000);
          pendingUserCleanup.set(userId, timeOut);
        }
      }
    });

    userSocketMap.delete(userId);
  });
});


export { app, io, server };
