const mongoose = require('mongoose');

const comercioSchema = new mongoose.Schema({
  nombre: String,
  categoria: String,
  imagenUrl: String // Ruta de la imagen en disco
}, { timestamps: true });

module.exports = mongoose.model('Comercio', comercioSchema);
