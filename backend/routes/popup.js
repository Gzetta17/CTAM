const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Popup = require('../models/popup');

// Configuración para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = 'popup-' + Date.now() + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

// POST: Subir imagen de popup (solo una activa)
router.post('/popup', upload.single('imagen'), async (req, res) => {
  try {
    await Popup.deleteMany({}); // Borra anteriores
    const popup = new Popup({
      imagenPath: req.file.filename
    });

    await popup.save();
    res.status(200).json({ message: 'Imagen de popup guardada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar popup' });
  }
});

// GET: Obtener imagen actual
router.get('/popup', async (req, res) => {
  try {
    const popup = await Popup.findOne().sort({ createdAt: -1 });
    if (!popup) return res.json(null);

    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    res.json({ imagen: baseUrl + popup.imagenPath });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener popup' });
  }
});

module.exports = router;

