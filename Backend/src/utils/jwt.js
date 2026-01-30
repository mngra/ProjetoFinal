const jwt = require("jsonwebtoken");

function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";
  if (!secret) throw new Error("JWT_SECRET em falta");
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET em falta");
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
