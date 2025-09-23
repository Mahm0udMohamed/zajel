// config/redisClient.js
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

//  Check for the presence of `REDIS_URL`
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.warn("Warning: REDIS_URL not found, using default local Redis");
}

const finalRedisUrl = redisUrl || "redis://localhost:6379";

//  Create a Redis client with enhanced options
const redisClient = new Redis(finalRedisUrl, {
  tls: finalRedisUrl.startsWith("rediss://") ? {} : undefined,
  connectTimeout: 10000, // Increased to 10 seconds
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn("Redis connection failed after 3 retries, disabling Redis");
      return null;
    }
    const delay = Math.min(times * 1000, 3000);
    return delay;
  },
  reconnectOnError: (err) => {
    console.warn("Redis reconnect on error:", err.message);
    return false;
  },
  maxRetriesPerRequest: 3, // Increased retries
  enableOfflineQueue: true, // Changed to true to allow queuing
  commandTimeout: 5000, // Add command timeout
});

//  Log Redis events for improved monitoring
redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});
redisClient.on("ready", () => {
  console.log("Redis ready for commands");
});
redisClient.on("reconnecting", (time) => {
  console.log(`Redis reconnecting in ${time}ms`);
});
redisClient.on("error", (err) => {
  console.warn("Redis connection error:", err.message);
});
redisClient.on("end", () => {
  console.log("Redis connection ended");
});

// Add connection check method
redisClient.isReady = () => {
  return redisClient.status === "ready";
};

//  Export the client
export default redisClient;
