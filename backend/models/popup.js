const mongoose = require('mongoose');

const popupSchema = new mongoose.Schema({
  imageUrl: String,  // nombre del archivo
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Popup', popupSchema);

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Popup = require('/models/Popup');

// Configuración de multer para guardar archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde guardar
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // ej: 168234.jpeg
  }
});

const upload = multer({ storage: storage });

// Ruta para subir imagen
router.post('/popup', upload.single('image'), async (req, res) => {
  try {
    const popup = new Popup({
      imageUrl: req.file.filename
    });

    await popup.save();
    res.json({ message: 'Imagen subida correctamente', imageUrl: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

// Ruta pública para obtener la última imagen
router.get('/popup', async (req, res) => {
  try {
    const popup = await Popup.findOne().sort({ createdAt: -1 });
    if (!popup) return res.status(404).json({ error: 'No hay imagen' });

    res.json({ imageUrl: `/uploads/${popup.imageUrl}` });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener imagen' });
  }
});

module.exports = router;
