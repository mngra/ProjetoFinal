const { verifyToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ message: "Token em falta" });

  try {
    req.user = verifyToken(token); // { sub, type, role? }
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
};
