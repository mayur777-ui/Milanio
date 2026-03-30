"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_1 = require("./socketHandlers/socket");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = require("dotenv");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
(0, dotenv_1.config)();
socket_1.app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', //cors origin for secure connection 
    credentials: true
}));
socket_1.app.use(express_1.default.json());
socket_1.app.use((0, cookie_parser_1.default)());
socket_1.app.use('/User', user_routes_1.default);
socket_1.app.get('/getRoomId', (req, res) => {
    const roomId = Math.random().toString(36).substring(2, 15);
    console.log("Generated roomId:", roomId);
    res.json({
        roomId: roomId
    });
});
socket_1.server.listen(8000, () => {
    console.log("✅ Server with Socket.IO listening on port 8000");
});
