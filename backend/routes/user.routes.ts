import {Router} from 'express';
import { ReqOpt,Login,verifyOtpAndRegister,resetPassword, resendOtp, getUser, Registerdirect } from '../controllers/user.controller';
import auth  from '../Middleware/auth';
// import { register } from 'module';/

const router = Router();

// router.post('/register', Registerdirect);
router.post('/login', Login);
router.post('/verifyOtpAndRegister', verifyOtpAndRegister);
router.post('/resetPassword', resetPassword);
router.post('/resendOtp',resendOtp);
router.get('/getUser', auth,getUser);
router.post("/register", Registerdirect);

export default router;