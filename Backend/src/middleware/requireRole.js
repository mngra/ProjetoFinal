module.exports = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Não autenticado" });

  const roles = Array.isArray(req.user.roles) ? req.user.roles : [];
  if (!roles.includes(role)) return res.status(403).json({ message: "Sem permissões" });

  next();
};
