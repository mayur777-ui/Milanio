import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuth = async(req:Request, res:Response, next:NextFunction) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: "Token is required" });
    }
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ error: "Invalid token" });
        }
        const { email, name} = payload;
        let user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        })
        if (!user) {
            user = await prisma.user.create({
               data:{
                 email: email as string,
                name: name as string,
                password: '',
               }
            })
        }

         const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        
        const jwtToken = jwt.sign({ id: user.id }, jwtSecret, {
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
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}