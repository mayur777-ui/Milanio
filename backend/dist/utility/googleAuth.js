"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = void 0;
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: "Token is required" });
    }
    try {
        const ticket = yield client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: "Invalid token" });
        }
        const { email, name } = payload;
        let user = yield client_1.default.user.findUnique({
            where: {
                email: email,
            }
        });
        if (!user) {
            user = yield client_1.default.user.create({
                data: {
                    email: email,
                    name: name,
                    password: '',
                }
            });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const jwtToken = jsonwebtoken_1.default.sign({ id: user.id }, jwtSecret, {
            expiresIn: "1h",
        });
        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        }).status(200).json({
            message: "User authenticated successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        });
    }
    catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.googleAuth = googleAuth;
