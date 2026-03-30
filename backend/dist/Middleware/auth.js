"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => {
    var _a;
    const token = req.cookies.token || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
    if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userid = decode;
        next();
    }
    catch (err) {
        console.error("JWT verification error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
exports.default = auth;
