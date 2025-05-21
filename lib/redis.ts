import { createClient } from 'redis';

declare global {
  var _redisClient: ReturnType<typeof createClient> | undefined;
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = global._redisClient ?? createClient({ url: redisUrl });

if (!global._redisClient) {
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.connect().catch(console.error);
  global._redisClient = redisClient;
}

export default redisClient;
