const mongoose = require('mongoose');

const popupSchema = new mongoose.Schema({
  imagenPath: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Popup', popupSchema);
