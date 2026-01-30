
const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");

// GET /api/alunos  -> lista alunos
router.get("/", async (req, res) => {
  try {
    const alunos = await Aluno.find()
      .select("_id nome email numero_estudante createdAt") // não devolver senha_hash!
      .sort({ nome: 1 });

    res.json(alunos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar alunos." });
  }
});

// GET /api/alunos/:id -> 1 aluno
router.get("/:id", async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params.id)
      .select("_id nome email numero_estudante createdAt");

    if (!aluno) return res.status(404).json({ message: "Aluno não encontrado." });

    res.json(aluno);
  } catch (err) {
    res.status(400).json({ message: "ID inválido." });
  }
});

module.exports = router;
