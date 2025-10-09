const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Noticia = require('../models/noticia'); // Asegúrate de que el path sea correcto

// Directorio para guardar las imágenes subidas
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuración de Multer para el almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `noticia-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

/** POST /noticias - Crear una nueva noticia con imagen y contenido */
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    // Validación de imagen y campos obligatorios
    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
    if (!req.body.nombre || !req.body.categoria || !req.body.contenido) {
        // En un entorno de producción, es bueno validar todos los campos requeridos.
        // Asumiendo que el modelo de Mongoose ya maneja 'required', esta validación es un extra.
        return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, categoria o contenido).' });
    }

    const nuevo = await Noticia.create({
      nombre: req.body.nombre,
      contenido: req.body.contenido, // <-- CAMBIO: Añadido el campo 'contenido'
      categoria: req.body.categoria,
      imagen: `/uploads/${req.file.filename}`
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error('❌ Error al crear noticia:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** GET /noticias - Listar todas las noticias, ordenadas por más reciente */
router.get('/', async (req, res) => {
  try {
    const noticias = await Noticia.find().sort({ createdAt: -1 });
    res.json(noticias);
  } catch (err) {
    console.error('❌ Error al obtener noticias:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** GET /noticias/:id - Obtener una noticia por ID */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const noticia = await Noticia.findById(id);
    
    if (!noticia) {
      return res.status(404).json({ error: 'Noticia no encontrada' });
    }

    res.json(noticia);
  } catch (err) {
    console.error('❌ Error al obtener noticia por ID:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** PUT /noticias/:id - Actualizar (incluyendo campos de texto y opcionalmente imagen) */
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;

    const toUpdate = {
      nombre: req.body.nombre,
      contenido: req.body.contenido, // <-- CAMBIO: Añadido el campo 'contenido'
      categoria: req.body.categoria,
    };

    // Lógica para actualizar o reemplazar la imagen
    if (req.file) {
      const anterior = await Noticia.findById(id);
      // Intenta borrar la imagen antigua si existe
      if (anterior?.imagen) {
        const oldPath = path.join(uploadDir, anterior.imagen.replace('/uploads/', ''));
        // Usamos fs.unlink para eliminar el archivo del sistema de archivos
        fs.unlink(oldPath, (err) => {
            if (err) console.warn(`Advertencia: No se pudo eliminar la imagen antigua: ${oldPath}`, err);
        });
      }
      toUpdate.imagen = `/uploads/${req.file.filename}`; // Setea la nueva ruta de imagen
    }

    const actualizado = await Noticia.findByIdAndUpdate(id, toUpdate, { new: true, runValidators: true });
    if (!actualizado) return res.status(404).json({ error: 'Noticia no encontrada' });

    res.json(actualizado);
  } catch (err) {
    console.error('❌ Error al actualizar noticia:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

/** DELETE /noticias/:id - Eliminar noticia y su imagen asociada */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const borrada = await Noticia.findByIdAndDelete(id);
    if (!borrada) return res.status(404).json({ error: 'Noticia no encontrada' });

    // Lógica para eliminar el archivo de imagen del servidor
    if (borrada.imagen) {
      const imgPath = path.join(uploadDir, borrada.imagen.replace('/uploads/', ''));
      fs.unlink(imgPath, (err) => {
        if (err) console.warn(`Advertencia: No se pudo eliminar la imagen: ${imgPath}`, err);
      });
    }

    res.json({ message: 'Noticia e imagen eliminadas con éxito' });
  } catch (err) {
    console.error('❌ Error al eliminar noticia:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
