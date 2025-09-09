const mongoose = require("mongoose");

const popupSchema = new mongoose.Schema({
  imagen: { type: String, required: true }, // ruta o base64
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Popup", popupSchema);
