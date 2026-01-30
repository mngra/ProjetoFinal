
const mongoose = require("mongoose");

const AlunoSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    numero_estudante: { type: String, required: true, unique: true, trim: true },
    senha_hash: { type: String, required: true },
    passwordResetTokenHash: { type: String, default: null },
    passwordResetExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Aluno", AlunoSchema);
