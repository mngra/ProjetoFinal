const mongoose = require("mongoose");

module.exports = async (app, next) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI em falta no .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB ligado");
    next();
  } catch (err) {
    console.error("Erro MongoDB:", err.message);
    process.exit(1);
  }
};
