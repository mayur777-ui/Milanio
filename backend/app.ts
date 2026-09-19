import express,{Request,Response} from 'express';
import {app, io, server} from './socketHandlers/socket';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import userRouter from './routes/user.routes';
config();

console.log(process.env.FRONTEND_URL)
app.use(cors({                     
  origin: process.env.FRONTEND_URL,  //cors origin for secure connection 
  credentials: true
})); 
app.use(express.json()); 
app.use(cookieParser());




app.use('/User', userRouter);
app.get('/getRoomId', (req:Request, res:Response)=>{ //this route for generate roomid's 
  const  roomId = Math.random().toString(36).substring(2, 15) as string;
  console.log("Generated roomId:", roomId);
  res.json({
    roomId: roomId
  })
})

const port = Number(process.env.PORT) || 8000;

server.listen(port, () => {
  console.log(`Server with Socket.IO listening on port ${port}`);
});