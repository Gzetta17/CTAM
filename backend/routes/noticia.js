// routes/noticia.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Noticia = require('../models/noticia');

// Configuración multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/noticia', upload.single('image'), async (req, res) => {
  try {
    const noticia = new Noticia({
      title: req.body.title,
      description: req.body.description,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await noticia.save();
    res.status(201).json({ message: 'Noticia guardada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar la noticia', details: err });
  }
});

router.get('/noticias', async (req, res) => {
  try {
    const noticias = await Noticia.find().sort({ createdAt: -1 });
    res.json(noticias);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
});

module.exports = router;
