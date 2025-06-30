const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
  imagenPath: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Noticia', noticiaSchema);
