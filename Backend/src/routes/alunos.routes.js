const express = require("express");
const router = express.Router();
const Aluno = require("../models/Aluno");
const { envNumber } = require("../config/env");
const authRequired = require("../middleware/authRequired");

//Requere autenticação para todas as rotas
router.use(authRequired);

const ALUNO_SELECT = "_id nome email numero_estudante";

/* ------------------------------------------------------------------
 *  GET /api/alunos -> Selecionar todos os alunos
 * ------------------------------------------------------------------ */
router.get("/", async (req, res) => {
  try {
    // PAGINAÇÃO
    const defaultLimit = envNumber("PAGINATION_DEFAULT_LIMIT", 10);
    const maxLimit = envNumber("PAGINATION_MAX_LIMIT", 50);
    const noPagination =
        String(req.query.all).toLowerCase() === "true" ||
        String(req.query.paginate).toLowerCase() === "false";

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const requestedLimit = parseInt(req.query.limit || String(defaultLimit), 10);
    const limit = Number.isFinite(requestedLimit)
        ? Math.min(Math.max(requestedLimit, 1), maxLimit)
        : defaultLimit;    
        
    const skip = (page - 1) * limit;

    // FILTRO
    const { nome = "", email = "", numero_estudante = "" } = req.query;
    const filter = {};
    if (nome.trim()) {
      filter.nome = { $regex: nome.trim(), $options: "i" };
    }
    if (email.trim()) {
      filter.email = { $regex: email.trim(), $options: "i" };
    }
    if (numero_estudante.trim()) {
      filter.numero_estudante = { $regex: numero_estudante.trim(), $options: "i" };
    }

    if (noPagination) {
      const items = await Aluno.find(filter)
        .select(ALUNO_SELECT)
        .sort({ nome: 1 });

        return res.json({
          page: 1,
          limit: items.length,
          total: items.length,
          totalPages: 1,
          items,
        });
      }

    // CONSULTA
    const [items, total] = await Promise.all([
      Aluno.find(filter)
        .select("_id nome email numero_estudante createdAt")
        .sort({ nome: 1 })
        .skip(skip)
        .limit(limit),
      Aluno.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.json({
      page,
      limit,
      total,
      totalPages,
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao listar alunos." });
  }
});

/* ------------------------------------------------------------------
 * POST /api/alunos -> criar um novo aluno
 * ------------------------------------------------------------------ */
router.post("/", async (req, res) => {
  try {
    const { nome, email, numero_estudante } = req.body;

    const novoAluno = new Aluno({
      nome,
      email,
      numero_estudante,
    });

    await novoAluno.save();

    res.status(201).json({
      message: "Aluno criado com sucesso.",
      aluno: novoAluno,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Erro ao criar aluno." });
  }
});

/* ------------------------------------------------------------------
 * GET /api/alunos/:id -> obter um aluno
 * ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
 * PUT /api/alunos/:id -> atualizar um aluno existente
 * ------------------------------------------------------------------ */
router.put("/:id", async (req, res) => {
  try {
    const { nome, email, numero_estudante } = req.body;

    const alunoAtualizado = await Aluno.findByIdAndUpdate(
      req.params.id,
      { nome, email, numero_estudante },
      { new: true, runValidators: true }
    );

    if (!alunoAtualizado) {
      return res.status(404).json({ message: "Aluno não encontrado." });
    }

    res.json({ message: "Aluno atualizado com sucesso.", aluno: alunoAtualizado });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Erro ao atualizar aluno." });
  }
});


/* ------------------------------------------------------------------
 * DELETE /api/alunos/:id -> eliminar um aluno
 * ------------------------------------------------------------------ */
router.delete("/:id", async (req, res) => {
  try {
    const alunoEliminado = await Aluno.findByIdAndDelete(req.params.id);

    if (!alunoEliminado) {
      return res.status(404).json({ message: "Aluno não encontrado." });
    }

    res.json({ message: "Aluno eliminado com sucesso." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Erro ao eliminar aluno." });
  }
});



module.exports = router;