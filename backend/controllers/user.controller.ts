import prisma from '../prisma/client';
import {Request, Response} from 'express';
import Redisclient from '../utility/RediesClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendEmailOtp } from '../utility/email';
import { Prisma } from '@prisma/client';
declare global {
  namespace Express {
    interface Request {
      userid?: any;
    }
  }
}
export const ReqOpt = async(req: Request, res: Response) =>{
    console.log("Registering user with data:", req.body);
    const {name,email, password} = req.body;
    try{
        if(!name || !email || !password){
            res.status(400).json({error: 'All fields are required'});
            return;
        }
        const existingUser = await prisma.user.findUnique({
            where:{
                email: email
            }
        });
        if(existingUser){
            res.status(400).json({error: 'User already exists'});
            return;
        }
        const hashPass = await bcrypt.hash(password, 10);
        const otp = Math.floor(Math.random()* (9999-1000 + 1))  + 1000;
        await Redisclient.set(`register:${email}`,JSON.stringify({name:name, password:hashPass, otp:otp.toString()}),{EX: 1800});
        const data = await Redisclient.get(`register:${email}`);
        // console.log("Data from Redis:", data);
        await sendEmailOtp(email as string, otp);
        res.status(200).json({message: 'OTP sent to your email', email: email});
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

export const Login = async(req: Request, res: Response) =>{
    // console.log("Logging in user with data:", req.body);
    const {email, password} = req.body;
    try{
        if(!email || !password){
            res.status(400).json({error: 'All fields are required'});
            return;
        }
        const user = await prisma.user.findUnique({
            where:{
                email: email
            }
        });
        if(!user){
            res.status(404).json({error: 'User does not exist'});
            return;
        }   
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            res.status(401).json({error: 'Invalid password'});
            return;
        }
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET!, {
            expiresIn: '1d'
        });
        res.status(200).json({message: 'Login successful', user: user, token: token});
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


export const verifyOtpAndRegister = async(req: Request, res: Response) => {
    // console.log("Verifying OTP and registering user with data:", req.body);
    const {email, otp} = req.body;
    try{
        if(!email || !otp){
            res.status(400).json({error: 'Email and OTP are required'});
            return;
        }
        const data = await Redisclient.get(`register:${email}`);
        // console.log("Data from Redis:", data);
        if(!data){
            res.status(400).json({error: 'Session expired or no registration data found for this email'});
            return;
        }
        const parseData = JSON.parse(data);
        if(parseData.otp !== otp){
            res.status(400).json({error:'Invalid OTP'});
            return;
        }
        const newUser = await prisma.user.create({
            data:{
                name:parseData.name,
                email:email,
                password:parseData.password
            }
        })

        await Redisclient.del(`register:${email}`);
         const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET!, {
            expiresIn: '1d'
        });

        res.status(200).json({message: 'User created successfully', token: token,user: newUser});

    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}



export const resetPassword = async(req: Request, res: Response) =>{
    const {email, newPassword} = req.body;
    try{
        if(!email || !newPassword){
            res.status(400).json({error: 'Email and new password are required'});
            return;
        }
        const user = await prisma.user.findUnique({
            where:{
                email: email    
            }   
        });
        if(!user){
            res.status(400).json({error: 'User does not exist'});
            return;
        }
        const hashPass = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where:{
                email: email
            },
            data:{
                password: hashPass
            }
        });
        res.status(200).json({message: 'Password reset successfully'});
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


export const resendOtp = async(req: Request, res: Response)=>{
    const {email} = req.body;
    try{
        if(!email){
            res.status(400).json({error: 'Email is required'});
            return;
        }
        const data = await Redisclient.get(`register:${email}`);
        if(!data){
            res.status(400).json({error: 'session expired'});
            return;
        }
        const parseData = JSON.parse(data);
        const otp = Math.floor(Math.random()* (9999-1000 + 1))  + 1000;
        await sendEmailOtp(email as string, otp);
        await Redisclient.set(`register:${email}`, JSON.stringify({...parseData, otp: otp.toString()}), {EX: 1800});
        res.status(200).json({message: 'OTP resent successfully', otp: otp});
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


export const getUser = async(req: Request, res: Response) =>{
    const userId = req.userid.id;
    // console.log("Fetching user with ID:", userId);
    try{
        const user = await prisma.user.findUnique({
            where:{
                id:userId,  
            }   
        });

        if(!user){
            res.status(404).json({error: 'User not found'});
        }
        res.status(200).json({user: user});
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
}