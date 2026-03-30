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
exports.getUser = exports.resendOtp = exports.resetPassword = exports.verifyOtpAndRegister = exports.Login = exports.ReqOpt = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const RediesClient_1 = __importDefault(require("../utility/RediesClient"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../utility/email");
// it's for when user first time come to our website we go for email and verify it so that no a dublicate unauthorized person get into our web app
const ReqOpt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const existingUser = yield client_1.default.user.findUnique({
            where: {
                email: email
            }
        });
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        const hashPass = yield bcrypt_1.default.hash(password, 10);
        const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        yield RediesClient_1.default.set(`register:${email}`, JSON.stringify({ name: name, password: hashPass, otp: otp.toString() }), { EX: 1800 });
        // const data = await Redisclient.get(`register:${email}`);
        // console.log("Data from Redis:", data);
        yield (0, email_1.sendEmailOtp)(email, otp);
        res.status(200).json({ message: 'OTP sent to your email', email: email });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.ReqOpt = ReqOpt;
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Logging in user with data:", req.body);
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        const user = yield client_1.default.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            res.status(404).json({ error: 'User does not exist' });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid password' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        res.status(200).json({ message: 'Login successful', user: user, token: token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.Login = Login;
const verifyOtpAndRegister = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Verifying OTP and registering user with data:", req.body);
    const { email, otp } = req.body;
    try {
        if (!email || !otp) {
            res.status(400).json({ error: 'Email and OTP are required' });
            return;
        }
        const data = yield RediesClient_1.default.get(`register:${email}`);
        // console.log("Data from Redis:", data);
        if (!data) {
            res.status(400).json({ error: 'Session expired or no registration data found for this email' });
            return;
        }
        const parseData = JSON.parse(data);
        if (parseData.otp !== otp) {
            res.status(400).json({ error: 'Invalid OTP' });
            return;
        }
        const newUser = yield client_1.default.user.create({
            data: {
                name: parseData.name,
                email: email,
                password: parseData.password
            }
        });
        yield RediesClient_1.default.del(`register:${email}`);
        const token = jsonwebtoken_1.default.sign({ id: newUser.id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        res.status(200).json({ message: 'User created successfully', token: token, user: newUser });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.verifyOtpAndRegister = verifyOtpAndRegister;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, newPassword } = req.body;
    try {
        if (!email || !newPassword) {
            res.status(400).json({ error: 'Email and new password are required' });
            return;
        }
        const user = yield client_1.default.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            res.status(400).json({ error: 'User does not exist' });
            return;
        }
        const hashPass = yield bcrypt_1.default.hash(newPassword, 10);
        yield client_1.default.user.update({
            where: {
                email: email
            },
            data: {
                password: hashPass
            }
        });
        res.status(200).json({ message: 'Password reset successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.resetPassword = resetPassword;
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }
        const data = yield RediesClient_1.default.get(`register:${email}`);
        if (!data) {
            res.status(400).json({ error: 'session expired' });
            return;
        }
        const parseData = JSON.parse(data);
        const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        yield (0, email_1.sendEmailOtp)(email, otp);
        yield RediesClient_1.default.set(`register:${email}`, JSON.stringify(Object.assign(Object.assign({}, parseData), { otp: otp.toString() })), { EX: 1800 });
        res.status(200).json({ message: 'OTP resent successfully', otp: otp });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.resendOtp = resendOtp;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userid.id;
    // console.log("Fetching user with ID:", userId);
    try {
        const user = yield client_1.default.user.findUnique({
            where: {
                id: userId,
            }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user: user });
    }
    catch (err) {
        // console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.getUser = getUser;
