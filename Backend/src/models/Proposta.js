const mongoose = require("mongoose");

const PropostaSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    orientador: { type: mongoose.Schema.Types.ObjectId, ref: "Docente", required: true },
    descricao_objetivos: { type: String, required: true, trim: true },
    coorientadores: [{ type: mongoose.Schema.Types.ObjectId, ref: "Docente" }],
    alunos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Aluno" }],
    palavras_chave: [{ type: String, trim: true }],
    status: { type: String, enum: ["publica", "privada"], default: "publica" },
  },
  { timestamps: true }
);

PropostaSchema.pre("save", async function () {
  const toObjectIdArrayUnique = (arr) => {
    if (!Array.isArray(arr)) return arr;

    return [...new Set(arr.map((v) => String(v).trim()))]
      .filter(Boolean)
      .filter((v) => mongoose.Types.ObjectId.isValid(v))
      .map((v) => new mongoose.Types.ObjectId(v));
  };

  if (Array.isArray(this.coorientadores)) {
    this.coorientadores = toObjectIdArrayUnique(this.coorientadores);
  }

  if (Array.isArray(this.alunos)) {
    this.alunos = toObjectIdArrayUnique(this.alunos);
  }

  if (Array.isArray(this.palavras_chave)) {
    this.palavras_chave = [...new Set(
      this.palavras_chave
        .map((s) => String(s).trim())
        .filter(Boolean)
    )];
  }
});



module.exports = mongoose.model("Proposta", PropostaSchema);
