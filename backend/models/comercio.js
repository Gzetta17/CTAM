const mongoose = require('mongoose');

const comercioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  categoria: { type: String, required: true },
  imagen: { type: String, required: true } // sólo filename
}, { timestamps: true });

module.exports = mongoose.model('Comercio', comercioSchema);
