const express = require("express");
const router = express.Router();
const { loginLimiter } = require("../middleware/rateLimiters");

router.use("/auth", loginLimiter, require("./auth.routes"));
router.use("/propostas", require("./propostas.routes"));

// Docentes
router.use("/docentes", require("./docentes.routes"));

//alunos
router.use("/alunos", require("./alunos.routes"));

module.exports = router;


