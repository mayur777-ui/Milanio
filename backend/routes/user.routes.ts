import {Router} from 'express';
import { ReqOpt,Login,verifyOtpAndRegister,resetPassword, resendOtp, getUser } from '../controllers/user.controller';
import auth  from '../Middleware/auth';

const router = Router();

router.post('/register', ReqOpt);
router.post('/login', Login);
router.post('/verifyOtpAndRegister', verifyOtpAndRegister);
router.post('/resetPassword', resetPassword);
router.post('/resendOtp',resendOtp);
router.get('/getUser', auth,getUser);

export default router;