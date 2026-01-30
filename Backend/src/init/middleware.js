const cors = require("cors");
const express = require("express");
const { apiLimiter } = require("../middleware/rateLimiters");


module.exports = (app) => {
  app.use(cors());
  app.use(express.json());
  app.use("/api", apiLimiter);

};
