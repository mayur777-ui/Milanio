import { config } from 'dotenv';
config();

// Toggle switch: if true, uses cloud services; if false, uses local docker services
export const IS_PROD = process.env.IS_PROD === 'true';

export const DATABASE_URL = IS_PROD
  ? (process.env.PROD_DATABASE_URL || process.env.DATABASE_URL!)
  : (process.env.DEV_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/webvideo_dev');

export const DIRECT_URL = IS_PROD
  ? (process.env.PROD_DIRECT_URL || process.env.DIRECT_URL!)
  : (process.env.DEV_DIRECT_URL || 'postgresql://postgres:postgres@localhost:5432/webvideo_dev');

export const REDIS_URL = IS_PROD
  ? (process.env.PROD_REDIS_URL || process.env.REDIS_URL!)
  : (process.env.DEV_REDIS_URL || 'redis://localhost:6379');

// Sync process.env so Prisma CLI and external libraries pick up the active environment
process.env.DATABASE_URL = DATABASE_URL;
process.env.DIRECT_URL = DIRECT_URL;
process.env.REDIS_URL = REDIS_URL;

// Fail fast in production if required cloud connection strings are missing
if (IS_PROD) {
  if (!DATABASE_URL) {
    throw new Error('❌ Fatal: IS_PROD=true requires PROD_DATABASE_URL or DATABASE_URL to be defined.');
  }
  if (!REDIS_URL) {
    throw new Error('❌ Fatal: IS_PROD=true requires PROD_REDIS_URL or REDIS_URL to be defined.');
  }
}

console.log(
  `[ENV] Database & Redis Mode: ${
    IS_PROD ? '🌐 PRODUCTION (Cloud Supabase & Aiven)' : '💻 DEVELOPMENT (Local Docker)'
  }`
);
