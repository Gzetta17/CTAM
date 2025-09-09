const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Comercio = require('../models/comercio');

// Carpeta de uploads absoluta y segura
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `comercio-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

/** POST /comercios - Crear */
router.post('/comercios', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });

    const nuevo = await Comercio.create({
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      // ⬇️ Guardamos SOLO el nombre de archivo (coincide con tu login.js)
      imagen: req.file.filename
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error('❌ Error al crear comercio:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** GET /comercios - Listar */
router.get('/comercios', async (req, res) => {
  try {
    const comercios = await Comercio.find().sort({ createdAt: -1 });
    res.json(comercios);
  } catch (err) {
    console.error('❌ Error al obtener comercios:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** PUT /comercios/:id - Actualizar (opcionalmente imagen) */
router.put('/comercios/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;

    const toUpdate = {
      nombre: req.body.nombre,
      categoria: req.body.categoria,
    };

    if (req.file) {
      // borrar imagen anterior si existe
      const anterior = await Comercio.findById(id);
      if (anterior?.imagen) {
        const oldPath = path.join(uploadDir, anterior.imagen);
        fs.unlink(oldPath, () => {});
      }
      toUpdate.imagen = req.file.filename;
    }

    const actualizado = await Comercio.findByIdAndUpdate(id, toUpdate, { new: true });
    if (!actualizado) return res.status(404).json({ error: 'Comercio no encontrado' });

    res.json(actualizado);
  } catch (err) {
    console.error('❌ Error al actualizar comercio:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** DELETE /comercios/:id - Eliminar doc + imagen */
router.delete('/comercios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const borrado = await Comercio.findByIdAndDelete(id);
    if (!borrado) return res.status(404).json({ error: 'Comercio no encontrado' });

    if (borrado.imagen) {
      const imgPath = path.join(uploadDir, borrado.imagen);
      fs.unlink(imgPath, () => {});
    }

    res.json({ message: 'Comercio e imagen eliminados con éxito' });
  } catch (err) {
    console.error('❌ Error al eliminar comercio:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
