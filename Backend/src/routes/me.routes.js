const express = require("express");
const authRequired = require("../middleware/authRequired");

const router = express.Router();

// Registo Docente
router.get("/", authRequired, (req, res) => {
  res.json({user:req.user})
});
module.exports = router;
