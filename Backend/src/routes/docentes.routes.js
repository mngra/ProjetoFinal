const express = require("express");
const bcrypt = require("bcrypt");
const Docente = require("../models/Docente");
const Proposta = require("../models/Proposta");
const { envNumber } = require("../config/env");

const authRequired = require("../middleware/authRequired");


const router = express.Router();

/* ------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------ */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const DOCENTE_SELECT = "_id nome email departamento createdAt";

/* ------------------------------------------------------------------
 * GET /api/docentes
 * ------------------------------------------------------------------ */
router.get(
  "/",
  async (req, res) => {
    try {
      const defaultLimit = envNumber("PAGINATION_DEFAULT_LIMIT", 10);
      const maxLimit = envNumber("PAGINATION_MAX_LIMIT", 50);

      const noPagination =
        String(req.query.all).toLowerCase() === "true" ||
        String(req.query.paginate).toLowerCase() === "false";

      const page = Math.max(Number(req.query.page) || 1, 1);
      const requestedLimit = Number(req.query.limit);
      const limit = Number.isFinite(requestedLimit)
        ? Math.min(Math.max(requestedLimit, 1), maxLimit)
        : defaultLimit;

      // filtros
      const nome = (req.query.nome || "").trim();
      const email = (req.query.email || "").trim();
      const departamento = (req.query.departamento || "").trim();
      const q = (req.query.q || "").trim();

      const and = [];
      if (nome) and.push({ nome: { $regex: escapeRegex(nome), $options: "i" } });
      if (email) and.push({ email: { $regex: escapeRegex(email), $options: "i" } });
      if (departamento)
        and.push({ departamento: { $regex: escapeRegex(departamento), $options: "i" } });

      if (q) {
        and.push({
          $or: [
            { nome: { $regex: escapeRegex(q), $options: "i" } },
            { email: { $regex: escapeRegex(q), $options: "i" } },
            { departamento: { $regex: escapeRegex(q), $options: "i" } },
          ],
        });
      }

      const filter = and.length ? { $and: and } : {};

      // sem paginação
      if (noPagination) {
        const items = await Docente.find(filter)
          .select(DOCENTE_SELECT)
          .sort({ nome: 1 });

        return res.json({
          page: 1,
          limit: items.length,
          total: items.length,
          totalPages: 1,
          items,
        });
      }

      // com paginação
      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        Docente.find(filter)
          .select(DOCENTE_SELECT)
          .sort({ nome: 1 })
          .skip(skip)
          .limit(limit),
        Docente.countDocuments(filter),
      ]);

      const totalPages = Math.max(Math.ceil(total / limit), 1);

      return res.json({ page, limit, total, totalPages, items });
    } catch (err) {
      console.error("GET /api/docentes error:", err);
      return res.status(500).json({ message: "Erro ao listar docentes" });
    }
  }
);


module.exports = router;

/* ------------------------------------------------------------------
 * POST /api/docentes
 * ------------------------------------------------------------------ */
router.post(
  "/",
  async (req, res) => {
    try {
      const {nome,
        email,
        departamento,
        password,
        confirmPassword } = req.body;

      if (!nome || !email || !password || !confirmPassword) {
        return res.status(400).json({
          message: "Nome, email e password são obrigatórios",
        });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({
          message: "As passwords não coincidem",
        });
      }

      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",.<>/?\\|]).{8,}$/;

      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          message:
            "A password deve ter pelo menos 8 caracteres, 1 maiúscula, 1 número e 1 caracter especial",
        });
      }

      const exists = await Docente.findOne({ email });
      if (exists) {
        return res.status(409).json({ message: "Já existe um docente com esse email" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const docente = await Docente.create({
        nome,
        email,
        departamento,
        senha_hash: passwordHash
      });
      
      const docenteSafe = docente.toObject();
      delete docenteSafe.password;

      return res.status(201).json(docenteSafe);
    } catch (err) {
      console.error("POST /api/docentes error:", err);
      return res.status(500).json({ message: "Erro ao criar docente" });
    }
  }
);

/* ------------------------------------------------------------------
 * PUT /api/docentes/:id
 * ------------------------------------------------------------------ */
router.put(
  "/:id",
  authRequired,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, email, departamento } = req.body;

      const docente = await Docente.findById(id);
      if (!docente) {
        return res.status(404).json({ message: "Docente não encontrado" });
      }

      if (email && email !== docente.email) {
        const emailUsed = await Docente.findOne({ email });
        if (emailUsed) {
          return res.status(409).json({ message: "Email já está em uso" });
        }
      }

      docente.nome = nome ?? docente.nome;
      docente.email = email ?? docente.email;
      docente.departamento = departamento ?? docente.departamento;

      await docente.save();

      return res.json(docente);
    } catch (err) {
      console.error("PUT /api/docentes/:id error:", err);
      return res.status(500).json({ message: "Erro ao atualizar docente" });
    }
  }
);

/* ------------------------------------------------------------------
 * DELETE /api/docentes/:id
 *  - remove docente
 *  - limpa orientador (string)
 *  - remove do array coorientador
 * ------------------------------------------------------------------ */
router.delete(
  "/:id",
  authRequired,
  async (req, res) => {
    const { id } = req.params;

    try {
      const docente = await Docente.findById(id);
      if (!docente) {
        return res.status(404).json({ message: "Docente não encontrado" });
      }

      // limpar referências nas propostas
      await Proposta.updateMany(
        {
          $or: [
            { orientador: id },
            { coorientadores: id },
          ],
        },
        {
          $set: { orientador: null },
          $pull: { coorientadores: id },
        }
      );

      await Docente.findByIdAndDelete(id);

      return res.json({
        message: "Docente eliminado e referências removidas com sucesso",
      });
    } catch (err) {
      console.error("DELETE /api/docentes/:id error:", err);
      return res.status(500).json({ message: "Erro ao eliminar docente" });
    }
  }
);

module.exports = router;
