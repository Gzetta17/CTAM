const express = require('express');
const router = express.Router();
const multer = require('multer');
const Comercio = require('../models/comercio');

// Cargar imagen con multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta POST para guardar un comercio
router.post('/comercios', upload.single('imagen'), async (req, res) => {
  try {
    const nuevoComercio = new Comercio({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      imagen: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    await nuevoComercio.save();
    res.status(200).json({ message: 'Comercio guardado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar comercio' });
  }
});

// Ruta GET para obtener todos los comercios
router.get('/comercios', async (req, res) => {
  try {
    const comercios = await Comercio.find().sort({ createdAt: -1 });
    const formatted = comercios.map(c => ({
      id: c._id,
      nombre: c.nombre,
      categoria: c.categoria,
      imagen: `data:${c.imagen.contentType};base64,${c.imagen.data.toString('base64')}`
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comercios' });
  }
});

module.exports = router;
