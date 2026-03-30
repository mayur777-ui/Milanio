"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = __importDefault(require("../Middleware/auth"));
const router = (0, express_1.Router)();
router.post('/register', user_controller_1.ReqOpt);
router.post('/login', user_controller_1.Login);
router.post('/verifyOtpAndRegister', user_controller_1.verifyOtpAndRegister);
router.post('/resetPassword', user_controller_1.resetPassword);
router.post('/resendOtp', user_controller_1.resendOtp);
router.get('/getUser', auth_1.default, user_controller_1.getUser);
exports.default = router;
