import { Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userid?: any;
    }
  }
}

const  auth = (req: Request, res: Response, next: Function):void =>{
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET!);
        req.userid = decode;
        next();
    }catch (err) {
        console.error("JWT verification error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
}

export default auth;