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
  lazyConnect: false, // Changed to false for immediate connection
  retryStrategy: (times) => {
    if (times > 5) {
      // Increased retries
      console.warn("Redis connection failed after 5 retries, disabling Redis");
      return null;
    }
    const delay = Math.min(times * 1000, 5000); // Increased max delay
    console.log(`Redis retry attempt ${times} in ${delay}ms`);
    return delay;
  },
  reconnectOnError: (err) => {
    console.warn("Redis reconnect on error:", err.message);
    return true; // Changed to true to allow reconnection
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false, // Changed to false to prevent queuing issues
  commandTimeout: 10000, // Increased timeout
  keepAlive: 30000, // Add keep alive
  family: 4, // Force IPv4
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
  // مسح الكاش المحلي عند حدوث خطأ
  if (err.message.includes("Stream isn't writeable")) {
    console.log("🔄 Redis connection lost, will retry...");
  }
});
redisClient.on("end", () => {
  console.log("Redis connection ended");
});

// Add connection check method
redisClient.isReady = () => {
  return redisClient.status === "ready";
};

// Add connection test method
redisClient.testConnection = async () => {
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    console.warn("Redis ping failed:", error.message);
    return false;
  }
};

// Initialize connection
const initializeRedis = async () => {
  try {
    // Check if already connected
    if (redisClient.status === "ready" || redisClient.status === "connecting") {
      console.log("✅ Redis client already initialized");
      return;
    }

    await redisClient.connect();
    console.log("✅ Redis client initialized successfully");
  } catch (error) {
    if (error.message.includes("already connecting/connected")) {
      console.log("✅ Redis client already connected");
    } else {
      console.warn("❌ Failed to initialize Redis client:", error.message);
    }
  }
};

// Initialize on startup
initializeRedis();

//  Export the client
export default redisClient;
