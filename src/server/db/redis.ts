import { Redis } from "@upstash/redis";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Interface for global object to avoid TypeScript errors
interface RedisCache {
  client: Redis | null;
}

declare global {
  // Ensure the global object has the redis property
  var redis: RedisCache;
}

// Check if the global object already has the redis property, otherwise set it
global.redis = global.redis || { client: null };

const cached = global.redis;

function getRedisClient(): Redis {
  if (cached.client) {
    return cached.client;
  }

  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
      "Please define the UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables"
    );
  }

  cached.client = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });

  return cached.client;
}

export default getRedisClient;
