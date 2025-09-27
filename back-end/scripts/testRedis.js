#!/usr/bin/env node

// Redis Connection Test Script
import redis from "../config/redisClient.js";
import dotenv from "dotenv";

dotenv.config();

const testRedisConnection = async () => {
  console.log("🔍 Testing Redis Connection...");
  console.log("=".repeat(50));

  // Basic connection info
  console.log(
    `Redis URL: ${process.env.REDIS_URL || "redis://localhost:6379"}`
  );
  console.log(`Redis Status: ${redis.status}`);
  console.log(`Redis Ready: ${redis.isReady()}`);

  try {
    // Test ping
    console.log("\n📡 Testing PING...");
    const pingResult = await redis.ping();
    console.log(`✅ PING successful: ${pingResult}`);

    // Test set/get
    console.log("\n💾 Testing SET/GET...");
    const testKey = "test:hero-occasions:connection";
    const testValue = JSON.stringify({
      message: "Redis connection test",
      timestamp: new Date().toISOString(),
    });

    await redis.setex(testKey, 60, testValue);
    console.log("✅ SET successful");

    const retrievedValue = await redis.get(testKey);
    console.log(`✅ GET successful: ${retrievedValue}`);

    // Test hero-occasions cache keys
    console.log("\n🔍 Checking existing hero-occasions keys...");
    const keys = await redis.keys("hero-occasions:*");
    console.log(`Found ${keys.length} hero-occasions keys:`);
    keys.forEach((key) => console.log(`  - ${key}`));

    // Clean up test key
    await redis.del(testKey);
    console.log("✅ Test key cleaned up");

    console.log("\n🎉 Redis connection test completed successfully!");
  } catch (error) {
    console.error("❌ Redis connection test failed:", error.message);
    console.error("Error details:", error);
  } finally {
    // Close connection
    redis.disconnect();
    console.log("\n🔌 Redis connection closed");
  }
};

// Run the test
testRedisConnection().catch(console.error);
