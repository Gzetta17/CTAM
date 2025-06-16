const express = require('express');
const router = express.Router();
const multer = require('multer');
const PopUp = require('../models/popup');

// Configurar multer para guardar la imagen en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/popup', upload.single('image'), async (req, res) => {
  try {
    const newPopup = new PopUp({
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await newPopup.save();
    res.status(200).json({ message: 'Imagen guardada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar la imagen' });
  }
});

module.exports = router;

// Ruta para obtener la última imagen guardada
router.get('/popup/last', async (req, res) => {
  try {
    const lastPopup = await PopUp.findOne().sort({ createdAt: -1 });

    if (!lastPopup) {
      return res.status(404).json({ error: 'No hay imágenes guardadas' });
    }

    res.json({
      image: lastPopup.image.data.toString('base64'),
      contentType: lastPopup.image.contentType
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la imagen' });
  }
});
