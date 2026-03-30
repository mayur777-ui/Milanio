"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
exports.io = io;
const userInROOM = new Map();
const pendingRoomDeletion = new Map();
const pendingUserCleanup = new Map();
const roomInitiator = new Map();
const userSocketMap = new Map();
const mapRoomTouserId = new Map();
const alreadyLeaveUser = new Set();
io.on("connection", (socket) => {
    console.log(`user ${socket.id} connected`);
    const userId = socket.handshake.query.userId;
    userSocketMap.set(userId, socket.id);
    // console.log('this userid ', userId);
    socket.on("create:room", ({ roomId }) => {
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
    socket.on("room:validate", ({ roomid, userDetails }) => {
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
            roomUsers === null || roomUsers === void 0 ? void 0 : roomUsers.add(userId);
        }
        if (pendingUserCleanup.has(userId)) {
            clearTimeout(pendingUserCleanup.get(userId));
            pendingUserCleanup.delete(userId);
            let roomid = mapRoomTouserId.get(userId);
            if (roomid) {
                const roomUser = userInROOM.get(roomid);
                roomUser === null || roomUser === void 0 ? void 0 : roomUser.add(userId);
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
        const roomUser = userInROOM.get(roomid);
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
        const initatorSocket = userSocketMap.get(initator);
        // console.log(initatorSocket);
        if (initatorSocket) {
            io.to(initatorSocket).emit("incomming:join-request", {
                requesterId: userId,
                roomId: roomid,
                userDetails: userDetails
            });
            console.log(`📨 Sent join request from ${userId} ➝ to initiator ${initator}`);
        }
    });
    socket.on("join:request-accept", ({ requesterId, roomId }) => {
        const targetSocketId = userSocketMap.get(requesterId);
        if (targetSocketId) {
            io.to(targetSocketId).emit("join:approved", {
                roomId,
                ownUserId: requesterId,
            });
        }
    });
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
        roomUsers === null || roomUsers === void 0 ? void 0 : roomUsers.add(userId);
        mapRoomTouserId.set(userId, roomId);
        socket.emit("room:joined", { roomId, ownUserId });
    });
    socket.on("webrtc:start", ({ roomId, ownUserId }) => {
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
            if (!RemotesocketId)
                return;
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
    });
    socket.on("webrtc:offer", ({ requesterId, targetuserId, offer }) => {
        console.log(`📞 WebRTC offer from ${requesterId} to ${targetuserId}:`, offer);
        const targetSocketId = userSocketMap.get(targetuserId);
        socket
            .to(targetSocketId)
            .emit("webrtc:shared", { requesterId, offer });
    });
    socket.on("send:ans", ({ to: requesterId, ans }) => {
        // console.log(`📞 Sending WebRTC answer to ${to} from ${socket.id}:`, ans);
        const toSocketId = userSocketMap.get(requesterId);
        console.log("sending ans to", userId, "ans is", requesterId);
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
        const toSocketId = userSocketMap.get(to);
        socket
            .to(toSocketId)
            .emit("checking-iceCandidate", { candidate, remoteUserId: requesterId });
    });
    socket.on("start-chat", ({ roomId, message, OwnuserId }) => {
        console.log(`💬 Starting chat in room ${roomId} with message:`, message);
        io.to(roomId).emit("chat:started", { message, senderid: OwnuserId });
    });
    socket.on("leave:room", ({ roomId, OwnuserId }) => {
        var _a;
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
        if (roomInitiator.get(roomId) === OwnuserId) {
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
        else {
            if (roomUsers.has(OwnuserId)) {
                roomUsers.delete(OwnuserId);
                mapRoomTouserId.delete(OwnuserId);
                socket.leave(roomId);
                alreadyLeaveUser.add(OwnuserId);
            }
        }
        if (((_a = userInROOM.get(roomId)) === null || _a === void 0 ? void 0 : _a.size) === 0) {
            userInROOM.delete(roomId);
            roomInitiator.delete(roomId);
            mapRoomTouserId.forEach((value, key) => {
                if (value === roomId) {
                    mapRoomTouserId.delete(key);
                }
            });
        }
        socket.to(roomId).emit("user:left", { leaver: OwnuserId, roomId });
    });
    socket.on('mic:toggle', ({ userId, micOn, roomId }) => {
        socket.to(roomId).emit("peer:mic-toggled", { userId, micOn });
    });
    socket.on('camera:toggle', ({ userId, cameraOn, roomId }) => {
        socket.to(roomId).emit("peer:camera-toggled", { userId, cameraOn });
    });
    socket.on("disconnect", (reason) => {
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
                        var _a;
                        if (((_a = userInROOM.get(roomId)) === null || _a === void 0 ? void 0 : _a.has(userId)) === false) {
                            userInROOM.delete(roomId);
                            roomInitiator.delete(roomId);
                            mapRoomTouserId.delete(userId);
                            io.to(roomId).emit("room-closed", {
                                message: "Room closed by creator.",
                            });
                            io.in(roomId).socketsLeave(roomId);
                            console.log(`💣 Room ${roomId} force closed (initiator didn't come back)`);
                        }
                        pendingRoomDeletion.delete(roomId);
                    }, 10000);
                    pendingRoomDeletion.set(roomId, timeOut);
                }
                else {
                    const timeOut = setTimeout(() => {
                        var _a;
                        if (((_a = userInROOM.get(roomId)) === null || _a === void 0 ? void 0 : _a.has(userId)) === false) {
                            // userInROOM.get(roomId)?.delete(userId);
                            mapRoomTouserId.delete(userId);
                            console.log(`🗑️ User ${userId} removed from room ${roomId} after timeout.`);
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
