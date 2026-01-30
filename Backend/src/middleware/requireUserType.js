module.exports = (type) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Não autenticado" });
  if (req.user.type !== type) return res.status(403).json({ message: "Sem permissões" });
  next();
};
