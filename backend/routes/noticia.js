const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Noticia = require('../models/noticia');

// Configuración de multer para guardar en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = 'noticia-' + Date.now() + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

// POST: Crear noticia
router.post('/noticias', upload.single('imagen'), async (req, res) => {
  try {
    const noticia = new Noticia({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      imagenPath: req.file.filename
    });

    await noticia.save();
    res.status(200).json({ message: 'Noticia guardada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar noticia' });
  }
});

// GET: Obtener noticias
router.get('/noticias', async (req, res) => {
  try {
    const noticias = await Noticia.find().sort({ createdAt: -1 });
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    const formatted = noticias.map(n => ({
      id: n._id,
      titulo: n.titulo,
      descripcion: n.descripcion,
      imagen: baseUrl + n.imagenPath
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener noticias' });
  }
});

module.exports = router;
