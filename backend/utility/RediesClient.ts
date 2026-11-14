import { createClient } from 'redis';
import { REDIS_URL } from '../config/env';

const Redisclient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis: Max reconnect attempts reached');
        return new Error('Redis max retries reached');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

Redisclient.on('error', (err) => console.log('Redis error:', err));

export const connectRedis = async () => {
  if (!Redisclient.isOpen) {
    try {
      await Redisclient.connect();
      console.log('✅ Redis client connected successfully');
    } catch (err) {
      console.error('❌ Redis connection error:', err);
      throw err;
    }
  }
};

// Fallback auto-connect if module is imported directly
if (!Redisclient.isOpen) {
  connectRedis().catch((err) => {
    console.warn('⚠️ Initial Redis background connect pending/failed:', err.message);
  });
}

export default Redisclient;
