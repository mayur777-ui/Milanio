import  {createClient} from 'redis';
import { config } from 'dotenv';
config();

const Redisclient = createClient({
    password:process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: 15614
    }
    
});


Redisclient.on('error',err=> console.log(err));

( async () =>{
    try{
        await Redisclient.connect();
        console.log("✅ Redis client connected successfully");
    }catch(err){
        console.error("Redis connection error:", err);
    }
})()
export default Redisclient;