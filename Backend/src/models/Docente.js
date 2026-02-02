const mongoose = require("mongoose");

const DocenteSchema = new mongoose.Schema({
    nome: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase:true, trim:true},
    departamento: {type: String},
    senha_hash: {type: String, required: true},
    passwordResetTokenHash: {type: String},
    passwordResetTokenHash: {type: String},
    roles: {
      type: [{ type: String, enum: ["docente", "admin"] }],
      default: ["docente"],
    },
},
{   timestamp:true}
);

module.exports = mongoose.model("Docente", DocenteSchema);