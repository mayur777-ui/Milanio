import express from "express";
import { createServer } from "http";
import { DisconnectReason, Server } from "socket.io";
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();
const server = createServer(app);
console.log(process.env.FRONTEND_URL);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🛡️ Authenticate socket connection during initial HTTP upgrade handshake
io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers?.authorization?.split(" ")[1] as string | undefined);

  if (!token) {
    return next(new Error("Authentication required: missing token"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; name?: string };
    socket.data.userId = decoded.id;
    socket.data.userName = decoded.name || "Participant";
    next();
  } catch (err) {
    console.warn("Socket handshake JWT rejected:", err);
    return next(new Error("Authentication failed: invalid token"));
  }
});

const userInROOM = new Map<string, Set<string>>();
const pendingRoomDeletion = new Map<string, NodeJS.Timeout>();
const pendingUserCleanup = new Map<string, NodeJS.Timeout>();
const roomInitiator = new Map<string, string>();
const userSocketMap = new Map<string, string>();
const mapRoomTouserId = new Map<string, string>();
const userNames = new Map<string, string>();
const alreadyLeaveUser = new Set<string>();

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  const userName = (socket.data.userName as string) || "Participant";
  userNames.set(userId, userName);
  console.log(`user ${userId} (${userName}) connected on socket ${socket.id}`);
  userSocketMap.set(userId, socket.id);
  // console.log('this userid ', userId);
  socket.on("create:room", ({ roomId }: { roomId: string }) => {
    if ([...roomInitiator.values()].includes(userId)) {
      socket.emit("room:exists", { message: "you are already in a room" });
      return;
    }

    const existingSocketId = userSocketMap.get(userId);
    if (!existingSocketId || existingSocketId !== socket.id) {
      userSocketMap.set(userId, socket.id);
    }
    userInROOM.set(roomId, new Set([userId])); //see: new Set(iterable) not single value ok and also can't use string why because 423j9hr291 then {"4","2", ''...}thing would like this that's why arr there 
    roomInitiator.set(roomId, userId); //this roomInitiator->userid
    mapRoomTouserId.set(userId, roomId); //userId -> roomId;
    socket.join(roomId); //actually join of a room name roomId;
    socket.emit("room:created", {
      roomId: roomId,
      message: "Room created successfully",
      userId: userId,
      socketid: socket.id,
    }); //emit it self that room:created 
    // console.log(userInROOM);
  });
  socket.on("room:validate", ({ roomid, userDetails }: { roomid: string, userDetails:{name: string; email: string}}) => {
    console.log("validating room by user iD", userId);
    // is the room is valid or not 
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


    // To check whether user is already in a room or not
    const currentRoom = mapRoomTouserId.get(userId);
    if (currentRoom && currentRoom !== roomid) {
      socket.emit("already-in-room", {
        message: `You are already in room ${currentRoom}. Leave it first.`,
      });
      return;
    }

    // to see if user is rejoing same room(it comes in when user reload)
    const roomUser = userInROOM.get(roomid)!;
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
        userDetails: {
          name: userName,
          email: userDetails?.email || "",
        },
      });
      console.log(
        `📨 Sent join request from ${userName} (${userId}) ➝ to initiator ${initator}`
      );
    }
  });

  socket.on(
    "join:request-accept",
    ({ requesterId, roomId }: { requesterId: string; roomId: string }) => {
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
    // console.log(userInROOM);
    const roomUsers = userInROOM.get(roomId);
    roomUsers?.add(userId);
    mapRoomTouserId.set(userId, roomId);
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
        .map((u) => {
          let RemotesocketId = userSocketMap.get(u);
          if (!RemotesocketId) return;
          return {
            userId: u,
            RemotesocketId,
            name: userNames.get(u) || "Participant",
          };
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
    ({ targetuserId, offer }: { requesterId?: string; targetuserId: string; offer: any }) => {
      console.log(
        `📞 WebRTC offer from ${userId} to ${targetuserId}:`,
        offer
      );
      const targetSocketId = userSocketMap.get(targetuserId)!;
      if (targetSocketId) {
        socket
          .to(targetSocketId)
          .emit("webrtc:shared", { requesterId: userId, offer });
      }
    }
  );

  socket.on("send:ans", ({ to: requesterId, ans }) => {
    const toSocketId = userSocketMap.get(requesterId)!;
    console.log("sending ans from", userId, "to", requesterId);
    if (toSocketId) {
      socket.to(toSocketId).emit("webrtc:getAns", {
        ans,
        remoteUserId: userId,
      });
    }
  });

  socket.on("icecandidate-check", ({ to, candidate }) => {
    console.log(`🧊 ICE candidate from ${userId} to ${to}:`, candidate);
    const toSocketId = userSocketMap.get(to)!;
    if (toSocketId) {
      socket
        .to(toSocketId)
        .emit("checking-iceCandidate", { candidate, remoteUserId: userId });
    }
  });

  socket.on("start-chat", ({ roomId, message }) => {
    console.log(`💬 Starting chat in room ${roomId} by ${userName} (${userId})`);
    io.to(roomId).emit("chat:started", {
      message,
      senderid: userId,
      senderName: userName,
    });
  });

  socket.on("leave:room", ({ roomId }: { roomId: string }) => {
    console.log(`👋 User ${userName} (${userId}) is leaving room ${roomId}`);
    if (!userInROOM.has(roomId)) {
      console.log(`❌ Room ${roomId} does not exist.`);
      return;
    }
    const roomUsers = userInROOM.get(roomId);
    if (!roomUsers) {
      console.log(`❌ No users in room ${roomId}.`);
      return;
    }

    if (roomInitiator.get(roomId) === userId) {
      roomUsers.delete(userId);
      mapRoomTouserId.delete(userId);
      socket.leave(roomId);
      alreadyLeaveUser.add(userId);

      if (roomUsers.size > 0) {
        const nextHostId = Array.from(roomUsers)[0];
        roomInitiator.set(roomId, nextHostId);
        const nextHostName = userNames.get(nextHostId) || "Participant";
        console.log(`👑 Host migrated in room ${roomId} from ${userId} to ${nextHostId} (${nextHostName})`);
        io.to(roomId).emit("host:promoted", {
          newHostId: nextHostId,
          newHostName: nextHostName,
        });
      } else {
        console.log(`🚪 Last user (host) left room ${roomId}. Closing room.`);
        io.to(roomId).emit("room-closed", {
          message: "Room closed.",
        });
        io.in(roomId).socketsLeave(roomId);
        userInROOM.delete(roomId);
        roomInitiator.delete(roomId);
        mapRoomTouserId.forEach((value, key) => {
          if (value === roomId) {
            mapRoomTouserId.delete(key);
          }
        });
      }
    } else {
      if (roomUsers.has(userId)) {
        roomUsers.delete(userId);
        mapRoomTouserId.delete(userId);
        socket.leave(roomId);
        alreadyLeaveUser.add(userId);
      }
    }
    if (userInROOM.get(roomId)?.size === 0) {
      userInROOM.delete(roomId);
      roomInitiator.delete(roomId);
      mapRoomTouserId.forEach((value, key) => {
        if (value === roomId) {
          mapRoomTouserId.delete(key);
        }
      });
    }
    socket.to(roomId).emit("user:left", {
      leaver: userId,
      leaverName: userName,
      roomId,
    });
  });


  socket.on('mic:toggle', ({ micOn, roomId }: { userId?: string; micOn: boolean; roomId: string }) => {
    socket.to(roomId).emit("peer:mic-toggled", { userId, micOn });
  });

  socket.on('camera:toggle', ({ cameraOn, roomId }: { userId?: string; cameraOn: boolean; roomId: string }) => {
    socket.to(roomId).emit("peer:camera-toggled", { userId, cameraOn });
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
              const currentUsers = userInROOM.get(roomId);
              if (currentUsers && currentUsers.size > 0) {
                const nextHostId = Array.from(currentUsers)[0];
                roomInitiator.set(roomId, nextHostId);
                const nextHostName = userNames.get(nextHostId) || "Participant";
                mapRoomTouserId.delete(userId);
                console.log(
                  `👑 Host disconnect timeout in room ${roomId}. Promoted ${nextHostId} (${nextHostName}) to host.`
                );
                io.to(roomId).emit("host:promoted", {
                  newHostId: nextHostId,
                  newHostName: nextHostName,
                });
                io.to(roomId).emit("user:left", {
                  leaver: userId,
                  leaverName: userName,
                  roomId,
                });
              } else {
                userInROOM.delete(roomId);
                roomInitiator.delete(roomId);
                mapRoomTouserId.delete(userId);
                io.to(roomId).emit("room-closed", {
                  message: "Room closed by creator.",
                });
                io.in(roomId).socketsLeave(roomId);
                console.log(
                  `💣 Room ${roomId} force closed (initiator didn't come back and no participants remain)`
                );
              }
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
              io.to(roomId).emit("user:left", {
                leaver: userId,
                leaverName: userName,
                roomId,
              });
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
