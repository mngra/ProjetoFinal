const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis");
const { createRedisClient } = require("../config/redis");
const { envNumber } = require("../config/env");

const redisClient = createRedisClient();

function getStore() {
  if (!redisClient) return undefined; // memória (default)
  return new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  });
}

function createLimiter(options) {
  return rateLimit({
    store: getStore(),
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
}

// Login
const loginLimiter = createLimiter({
  windowMs: envNumber("RATE_LIMIT_LOGIN_WINDOW_MIN", 15) * 60 * 1000,
  max: envNumber("RATE_LIMIT_LOGIN_MAX", 5),
  skipSuccessfulRequests: true,
  message: { message: "Demasiadas tentativas de login. Tenta mais tarde." },
});

// Forgot password
const forgotPasswordLimiter = createLimiter({
  windowMs: envNumber("RATE_LIMIT_FORGOT_WINDOW_MIN", 15) * 60 * 1000,
  max: envNumber("RATE_LIMIT_FORGOT_MAX", 3),
  message: { message: "Demasiados pedidos de recuperação. Tenta mais tarde." },
});

// Geral API (opcional)
const apiLimiter = createLimiter({
  windowMs: envNumber("RATE_LIMIT_API_WINDOW_MIN", 15) * 60 * 1000,
  max: envNumber("RATE_LIMIT_API_MAX", 300),
  message: { message: "Demasiados pedidos. Tenta mais tarde." },
});

module.exports = {
  loginLimiter,
  forgotPasswordLimiter,
  apiLimiter,
};
