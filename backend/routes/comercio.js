const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Comercio = require('../models/comercio');

// Configuración de multer para guardar archivos en disco
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + '-' + Date.now() + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Ruta POST para guardar un comercio
router.post('/comercios', upload.single('imagen'), async (req, res) => {
  try {
    const nuevoComercio = new Comercio({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      imagenPath: req.file.filename // Guardamos solo el nombre de archivo
    });

    await nuevoComercio.save();
    res.status(200).json({ message: 'Comercio guardado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar comercio' });
  }
});

// Ruta GET para obtener comercios
router.get('/comercios', async (req, res) => {
  try {
    const comercios = await Comercio.find().sort({ createdAt: -1 });
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/`;
    const formatted = comercios.map(c => ({
      id: c._id,
      nombre: c.nombre,
      categoria: c.categoria,
      imagen: baseUrl + c.imagenPath
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comercios' });
  }
});

module.exports = router;
