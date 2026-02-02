const cors = require("cors");
const express = require("express");

module.exports = (app) => {
  app.use(cors({ 
    origin: "http://localhost:10000",
    credentials: true, 
    allowedHeaders: ["Content-Type", "Authorization"], 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
  app.use(express.json());
  

};
