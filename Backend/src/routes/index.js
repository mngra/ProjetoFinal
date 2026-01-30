const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => res.json({ status: "ok" }));

router.use("/auth", require("./auth.routes"));
router.use("/propostas", require("./propostas.routes"));

//Gestão de passwords
router.use("/auth", require("./auth.routes"));
router.use("/auth", require("./password.routes"));


// só para testes
router.use("/me", require("./me.routes"));
module.exports = router;


// Docentes
router.use("/docentes", require("./docentes.routes"));


//alunos
router.use("/alunos", require("./alunos.routes"));