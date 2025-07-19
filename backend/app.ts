import express,{Request,Response} from 'express';
import {app, io, server} from './socketHandlers/socket';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import userRouter from './routes/user.routes';
config();


app.use(cors({
  origin: 'http://localhost:3000', // Your frontend port
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());





app.use('/User', userRouter);
app.get('/getRoomId', (req:Request, res:Response)=>{
  const  roomId = Math.random().toString(36).substring(2, 15) as string;
  console.log("Generated roomId:", roomId);
  res.json({
    roomId: roomId
  })
})

server.listen(8000, () => {
  console.log("✅ Server with Socket.IO listening on port 8000");
});