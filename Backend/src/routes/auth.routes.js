const express = require("express");
const bcrypt = require("bcrypt");
const Docente = require("../models/Docente");
const Aluno = require("../models/Aluno");
const { signToken } = require("../utils/jwt");
const { loginLimiter } = require("../middleware/rateLimiters");


const router = express.Router();

// Registo docente (por defeito: só "docente")
router.post("/register/docente", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ message: "nome, email e senha são obrigatórios" });
    }

    const emailNorm = email.toLowerCase().trim();
    const exists = await Docente.findOne({ email: emailNorm });
    if (exists) return res.status(409).json({ message: "Email já registado" });

    const senha_hash = await bcrypt.hash(senha, 10);

    const docente = await Docente.create({
      nome,
      email: emailNorm,
      senha_hash,
      roles: ["docente"], // ✅ sempre
    });

    return res.status(201).json({
      id: docente._id,
      nome: docente.nome,
      email: docente.email,
      roles: docente.roles,
    });
  } catch(e) {
    return res.status(500).json({ 
      message: "Erro ao registar docente" , 
      error: e?.message,
      code: e?.code});
  }
});

// Registo aluno (igual)
router.post("/register/aluno", async (req, res) => {
  try {
    const { nome, email, senha, numero_estudante } = req.body;

    if (!nome || !email || !senha || !numero_estudante) {
      return res.status(400).json({ message: "nome, email, senha, numero_estudante são obrigatórios" });
    }

    const emailNorm = email.toLowerCase().trim();
    const numNorm = String(numero_estudante).trim();

    if (await Aluno.findOne({ email: emailNorm })) return res.status(409).json({ message: "Email já registado" });
    if (await Aluno.findOne({ numero_estudante: numNorm })) return res.status(409).json({ message: "Número de estudante já registado" });

    const senha_hash = await bcrypt.hash(senha, 10);

    const aluno = await Aluno.create({
      nome,
      email: emailNorm,
      numero_estudante: numNorm,
      senha_hash,
    });

    return res.status(201).json({
      id: aluno._id,
      nome: aluno.nome,
      email: aluno.email,
      numero_estudante: aluno.numero_estudante,
    });
  } catch {
    return res.status(500).json({ message: "Erro ao registar aluno" });
  }
});

// Login (docente/aluno) — docente devolve roles
router.post("/login", loginLimiter, async (req, res) => {
  const { email, senha, tipo } = req.body;

  if (!email || !senha || !tipo) {
    return res.status(400).json({ message: "email, senha e tipo são obrigatórios" });
  }

  const emailNorm = email.toLowerCase().trim();

  try {
    if (tipo === "docente") {
      const docente = await Docente.findOne({ email: emailNorm });
      if (!docente) return res.status(401).json({ message: "Credenciais inválidas" });

      const ok = await bcrypt.compare(senha, docente.senha_hash);
      if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

      const roles = Array.isArray(docente.roles) && docente.roles.length ? docente.roles : ["docente"];

      // ✅ JWT com roles
      const token = signToken({
        sub: String(docente._id),
        type: "docente",
        roles,
      });

      return res.json({
        token,
        user: { id: docente._id, nome: docente.nome, email: docente.email, type: "docente", roles },
      });
    }

    if (tipo === "aluno") {
      const aluno = await Aluno.findOne({ email: emailNorm });
      if (!aluno) return res.status(401).json({ message: "Credenciais inválidas" });

      const ok = await bcrypt.compare(senha, aluno.senha_hash);
      if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

      const token = signToken({ sub: String(aluno._id), type: "aluno" });

      return res.json({
        token,
        user: { id: aluno._id, nome: aluno.nome, email: aluno.email, type: "aluno" },
      });
    }

    return res.status(400).json({ message: "tipo inválido (use 'docente' ou 'aluno')" });
  } catch {
    return res.status(500).json({ message: "Erro no login" });
  }
});

module.exports = router;
