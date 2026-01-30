const express = require("express");
const Docente = require("../models/Docente");
const { envNumber } = require("../config/env");

const authRequired = require("../middleware/authRequired");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// GET /api/docentes?page=1&limit=10&q=ana
// (protege: só admin, ajusta se quiseres público)
router.get("/", async (req, res) => {
  try {
    const defaultLimit = envNumber("PAGINATION_DEFAULT_LIMIT", 10);
    const maxLimit = envNumber("PAGINATION_MAX_LIMIT", 50);

    // ✅ desligar paginação
    const all = String(req.query.all || "").toLowerCase() === "true";
    const paginate = String(req.query.paginate || "").toLowerCase() !== "false";
    const noPagination = all || !paginate;

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const requestedLimit = parseInt(req.query.limit || String(defaultLimit), 10);
    const limit = Math.min(Math.max(requestedLimit, 1), maxLimit);

    // 🔎 filtros por campo
    const nome = (req.query.nome || "").toString().trim();
    const email = (req.query.email || "").toString().trim();
    const departamento = (req.query.departamento || "").toString().trim();
    const q = (req.query.q || "").toString().trim();

    const and = [];
    if (nome) and.push({ nome: { $regex: nome, $options: "i" } });
    if (email) and.push({ email: { $regex: email, $options: "i" } });
    if (departamento) and.push({ departamento: { $regex: departamento, $options: "i" } });

    if (q) {
      and.push({
        $or: [
          { nome: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { departamento: { $regex: q, $options: "i" } },
        ],
      });
    }

    const filter = and.length ? { $and: and } : {};

    // ✅ se for "all" (sem paginação), devolve array direto
    if (noPagination) {
      const items = await Docente.find(filter)
        .select("_id nome email departamento createdAt")
        .sort({ nome: 1 });

      return res.json(items); // <-- array direto
    }

    // paginação normal
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Docente.find(filter)
        .select("_id nome email departamento createdAt")
        .sort({ nome: 1 })
        .skip(skip)
        .limit(limit),
      Docente.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({ page, limit, total, totalPages, items });
  } catch (e) {
    console.error("Erro listar docentes:", e);
    return res.status(500).json({ message: "Erro ao listar docentes" });
  }
});



module.exports = router;
