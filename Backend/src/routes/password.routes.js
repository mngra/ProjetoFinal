const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const Docente = require("../models/Docente");
const Aluno = require("../models/Aluno");
const { sendEmail } = require("../services/mailjet");
const { forgotPasswordLimiter } = require("../middleware/rateLimiters");


const router = express.Router();

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function makeResetToken() {
  return crypto.randomBytes(32).toString("hex"); // 64 chars
}

function getAppUrl() {
  return process.env.APP_URL || "http://localhost:9000";
}

/**
 * POST /api/auth/forgot-password
 * body: { email, tipo?: "docente"|"aluno" }
 *
 * Resposta é sempre genérica (anti-enumeração).
 */
router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  const { email, tipo } = req.body;

  if (!email) {
    return res.status(400).json({ message: "email é obrigatório" });
  }

  const emailNorm = String(email).toLowerCase().trim();

  try {
    let user = null;
    let userType = null;

    if (tipo === "docente") {
      user = await Docente.findOne({ email: emailNorm });
      userType = "docente";
    } else if (tipo === "aluno") {
      user = await Aluno.findOne({ email: emailNorm });
      userType = "aluno";
    } else {
      // sem tipo: tenta encontrar em docentes primeiro, depois alunos
      user = await Docente.findOne({ email: emailNorm });
      userType = user ? "docente" : null;

      if (!user) {
        user = await Aluno.findOne({ email: emailNorm });
        userType = user ? "aluno" : null;
      }
    }

    // Resposta sempre igual, exista ou não
    if (!user) {
      return res.json({ message: "Se o email existir, enviámos instruções de recuperação." });
    }

    const token = makeResetToken();
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    const resetLink = `${getAppUrl()}/reset-password?token=${token}&email=${encodeURIComponent(emailNorm)}&tipo=${userType}`;

    await sendEmail({
      toEmail: emailNorm,
      toName: user.nome,
      subject: "Recuperação de palavra-passe",
      text: `Olá ${user.nome},\n\nPara redefinir a palavra-passe, abre este link (válido por 30 minutos):\n${resetLink}\n\nSe não foste tu, ignora este email.`,
      html: `
        <p>Olá ${user.nome},</p>
        <p>Para redefinir a palavra-passe, clica no link (válido por <b>30 minutos</b>):</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Se não foste tu, ignora este email.</p>
      `,
    });

    return res.json({ message: "Se o email existir, enviámos instruções de recuperação." });
  } catch (e) {
    console.error("forgot-password error:", e);
    // também aqui mantém resposta genérica
    return res.json({ message: "Se o email existir, enviámos instruções de recuperação." });
  }
});

/**
 * POST /api/auth/reset-password
 * body: { email, token, tipo: "docente"|"aluno", newPassword }
 */
router.post("/reset-password", async (req, res) => {
  const { email, token, tipo, newPassword } = req.body;

  if (!email || !token || !tipo || !newPassword) {
    return res.status(400).json({ message: "email, token, tipo e newPassword são obrigatórios" });
  }

  const emailNorm = String(email).toLowerCase().trim();
  const tokenHash = sha256(String(token));

  try {
    const Model = tipo === "docente" ? Docente : tipo === "aluno" ? Aluno : null;
    if (!Model) return res.status(400).json({ message: "tipo inválido" });

    const user = await Model.findOne({ email: emailNorm });
    if (!user) return res.status(400).json({ message: "Token inválido ou expirado" });

    if (!user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
      return res.status(400).json({ message: "Token inválido ou expirado" });
    }

    if (user.passwordResetTokenHash !== tokenHash) {
      return res.status(400).json({ message: "Token inválido ou expirado" });
    }

    if (new Date() > new Date(user.passwordResetExpiresAt)) {
      return res.status(400).json({ message: "Token inválido ou expirado" });
    }

    // Atualiza password
    user.senha_hash = await bcrypt.hash(String(newPassword), 10);

    // Invalida token de reset
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;

    await user.save();

    return res.json({ message: "Palavra-passe atualizada com sucesso." });
  } catch (e) {
    console.error("reset-password error:", e);
    return res.status(500).json({ message: "Erro ao redefinir palavra-passe" });
  }
});

module.exports = router;
