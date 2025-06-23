// models/noticia.js
const mongoose = require('mongoose');

const noticiaSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: {
    data: Buffer,
    contentType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Noticia', noticiaSchema);
