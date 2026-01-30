const Redis = require("ioredis");

function createRedisClient() {
  const useRedis = process.env.RATE_LIMIT_USE_REDIS === "true";
  if (!useRedis) return null;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("RATE_LIMIT_USE_REDIS=true mas REDIS_URL não definido");
    return null;
  }

  const client = new Redis(url);

  client.on("connect", () => {
    console.log("Redis conectado");
  });

  client.on("error", (err) => {
    console.error("Erro Redis:", err.message);
  });

  return client;
}

module.exports = { createRedisClient };
