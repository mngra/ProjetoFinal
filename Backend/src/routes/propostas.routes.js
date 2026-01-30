const express = require("express");
const mongoose = require("mongoose");
const Proposta = require("../models/Proposta");
const Docente = require("../models/Docente");
const Aluno = require("../models/Aluno");
const { envNumber } = require("../config/env");
const authRequired = require("../middleware/authRequired");

const router = express.Router();

function isObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function ensureDocentesExist(docenteIds) {
  if (!docenteIds?.length) return true;
  const count = await Docente.countDocuments({ _id: { $in: docenteIds } });
  return count === docenteIds.length;
}

async function ensureAlunosExist(alunoIds) {
  if (!alunoIds?.length) return true;
  const count = await Aluno.countDocuments({ _id: { $in: alunoIds } });
  return count === alunoIds.length;
}

// LISTAR propostas (docente: suas | aluno: associadas)
router.get("/", authRequired, async (req, res) => {
  try {
    const defaultLimit = envNumber("PAGINATION_DEFAULT_LIMIT", 10);
    const maxLimit = envNumber("PAGINATION_MAX_LIMIT", 50);

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const requestedLimit = parseInt(req.query.limit || String(defaultLimit), 10);
    const limit = Math.min(Math.max(requestedLimit, 1), maxLimit);

    const { titulo = "", autor = "", orientador = "", q = "" } = req.query;

    const and = [];

    if (titulo.trim()) and.push({ titulo: { $regex: titulo.trim(), $options: "i" } });
    if (autor.trim()) and.push({ "alunos.nome": { $regex: autor.trim(), $options: "i" } });
    if (orientador.trim()) and.push({ "orientador.nome": { $regex: orientador.trim(), $options: "i" } });

    if (q.trim()) {
      and.push({
        $or: [
          { titulo: { $regex: q.trim(), $options: "i" } },
          { "orientador.nome": { $regex: q.trim(), $options: "i" } },
          { "alunos.nome": { $regex: q.trim(), $options: "i" } },
        ],
      });
    }

    let baseFilter = {};
    if (req.user.type === "docente") {
      baseFilter = {
    $or: [
      { orientador: req.user.sub },
      { coorientadores: req.user.sub },
    ],
  };
    } else if (req.user.type === "aluno") {
      baseFilter = { alunos: req.user.sub };
    } else {
      return res.status(403).json({ message: "Tipo de utilizador inválido" });
    }

    const filter = and.length ? { $and: [...and, baseFilter] } : baseFilter;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Proposta.find(filter)
        .populate("orientador", "nome")
        .populate("coorientadores", "nome")
        .populate("alunos", "nome numero_estudante")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Proposta.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    return res.json({ page, limit, total, totalPages, items });
  } catch (e) {
    console.error("Erro listar propostas:", e);
    return res.status(500).json({ message: "Erro ao listar propostas" });
  }
});

// OBTER proposta por ID
router.get("/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "ID inválido" });

    const proposta = await Proposta.findById(id)
      .populate("orientador", "nome")
      .populate("coorientadores", "nome") // inclui aqui mais campos se quiseres
      .populate("alunos", "nome numero_estudante");

    if (!proposta) return res.status(404).json({ message: "Proposta não encontrada" });

    return res.json(proposta);
  } catch (e) {
    console.error("Erro ao obter proposta:", e);
    return res.status(500).json({ message: "Erro ao obter proposta" });
  }
});



// CRIAR proposta (apenas docentes)
router.post("/", authRequired, async (req, res) => {
  try {
    if (req.user.type !== "docente") {
      return res.status(403).json({ message: "Apenas docentes podem criar propostas" });
    }

    const {
      titulo,
      descricao_objetivos,
      coorientadores = [],
      alunos = [],
      palavras_chave = [],
      status = "publica",
      orientador,
    } = req.body;

    if (!titulo || !descricao_objetivos) {
      return res.status(400).json({ message: "titulo e descricao_objetivos são obrigatórios" });
    }

    const orientadorId = req.user.roles?.includes("admin") && orientador ? orientador : req.user.sub;

    if (!isObjectId(orientadorId)) return res.status(400).json({ message: "orientador inválido" });
    if (!(await Docente.exists({ _id: orientadorId }))) return res.status(400).json({ message: "orientador não existe" });

    const coIds = coorientadores.map(String);
    const alIds = alunos.map(String);

    if (coIds.some((id) => !isObjectId(id)) || alIds.some((id) => !isObjectId(id))) {
      return res.status(400).json({ message: "IDs inválidos em coorientadores/alunos" });
    }

    if (!(await ensureDocentesExist(coIds))) return res.status(400).json({ message: "Um ou mais coorientadores não existem" });
    if (!(await ensureAlunosExist(alIds))) return res.status(400).json({ message: "Um ou mais alunos não existem" });

    const coFiltered = coIds.filter((id) => id !== String(orientadorId));

    const proposta = await Proposta.create({
      titulo,
      descricao_objetivos,
      orientador: orientadorId,
      coorientadores: coFiltered,
      alunos: alIds,
      palavras_chave,
      status,
    });

    const full = await Proposta.findById(proposta._id)
      .populate("orientador", "nome")
      .populate("coorientadores", "nome")
      .populate("alunos", "nome numero_estudante");

    res.status(201).json(full);
  } catch (e) {
    console.error("Erro ao criar proposta:", e);
    res.status(500).json({ message: "Erro ao criar proposta" });
  }
});

// EDITAR proposta
router.put("/:id", authRequired, async (req, res) => {
  try {
    if (req.user.type !== "docente") return res.status(403).json({ message: "Apenas docentes podem editar propostas" });

    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "ID inválido" });

    const proposta = await Proposta.findById(id);
    if (!proposta) return res.status(404).json({ message: "Proposta não encontrada" });

    const isAdmin = req.user.roles?.includes("admin");
    const isOwner = String(proposta.orientador) === String(req.user.sub);
    if (!isAdmin && !isOwner) return res.status(403).json({ message: "Sem permissões" });

    const patch = {};
    const allowed = ["titulo", "descricao_objetivos", "coorientadores", "alunos", "palavras_chave", "status"];
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];

    if ("coorientadores" in patch) {
      const coIds = (patch.coorientadores || []).map(String);
      if (coIds.some((x) => !isObjectId(x))) return res.status(400).json({ message: "IDs inválidos em coorientadores" });
      if (!(await ensureDocentesExist(coIds))) return res.status(400).json({ message: "Um ou mais coorientadores não existem" });
      patch.coorientadores = coIds.filter((x) => x !== String(proposta.orientador));
    }

    if ("alunos" in patch) {
      const alIds = (patch.alunos || []).map(String);
      if (alIds.some((x) => !isObjectId(x))) return res.status(400).json({ message: "IDs inválidos em alunos" });
      if (!(await ensureAlunosExist(alIds))) return res.status(400).json({ message: "Um ou mais alunos não existem" });
      patch.alunos = alIds;
    }

    const updated = await Proposta.findByIdAndUpdate(id, patch, { new: true })
      .populate("orientador", "nome")
      .populate("coorientadores", "nome")
      .populate("alunos", "nome numero_estudante");

    res.json(updated);
  } catch (e) {
    console.error("Erro ao editar proposta:", e);
    res.status(500).json({ message: "Erro ao editar proposta" });
  }
});

// APAGAR proposta
router.delete("/:id", authRequired, async (req, res) => {
  try {
    if (req.user.type !== "docente") return res.status(403).json({ message: "Apenas docentes podem apagar propostas" });

    const { id } = req.params;
    if (!isObjectId(id)) return res.status(400).json({ message: "ID inválido" });

    const proposta = await Proposta.findById(id);
    if (!proposta) return res.status(404).json({ message: "Proposta não encontrada" });

    const isAdmin = req.user.roles?.includes("admin");
    const isOwner = String(proposta.orientador) === String(req.user.sub);
    if (!isAdmin && !isOwner) return res.status(403).json({ message: "Sem permissões" });

    await Proposta.findByIdAndDelete(id);
    res.status(204).send();
  } catch (e) {
    console.error("Erro ao apagar proposta:", e);
    res.status(500).json({ message: "Erro ao apagar proposta" });
  }
});

module.exports = router;