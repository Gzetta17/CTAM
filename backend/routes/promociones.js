const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ✅ CRÍTICO: ¡CORREGIDO! Ahora busca el archivo en PLURAL: 'promociones'
const Promocion = require('../models/promociones'); 

// Configuración de la carpeta de subidas (siguiendo el patrón de comercio/noticia)
// La ruta es relativa a routes/, por eso usamos '../uploads' para llegar a backend/uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configuración de Multer para la subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        // Nombre de archivo con prefijo promocion
        cb(null, `promocion-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });


/** POST / - Crear una nueva promoción */
// CRÍTICO: Utiliza 'promocion_imagen_file' como nombre de campo de subida (siguiendo el patrón)
// y usa 'nombre' y 'categoria'
router.post('/', upload.single('promocion_imagen_file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen.' });

        // Crear el documento con los nuevos campos del modelo
        const nuevo = await Promocion.create({
            nombre: req.body.nombre,
            categoria: req.body.categoria,
            // La imagen se guarda con la ruta relativa para el frontend
            imagen: `/uploads/${req.file.filename}` 
        });

        res.status(201).json(nuevo);
    } catch (err) {
        console.error('❌ Error al crear promoción:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/** GET / - Obtener todas las promociones */
router.get('/', async (req, res) => {
    try {
        // Ordena por fecha de creación descendente (la más reciente primero)
        const promociones = await Promocion.find().sort({ createdAt: -1 });
        res.json(promociones);
    } catch (err) {
        console.error('❌ Error al obtener promociones:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/** GET /:id - Obtener una promoción por ID */
router.get('/:id', async (req, res) => {
    try {
        const promocion = await Promocion.findById(req.params.id);
        if (!promocion) return res.status(404).json({ error: 'Promoción no encontrada.' });
        res.json(promocion);
    } catch (err) {
        console.error('❌ Error al obtener promoción por ID:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/** PUT /:id - Actualizar una promoción (opcionalmente la imagen) */
// CRÍTICO: Utiliza 'promocion_imagen_file'
router.put('/:id', upload.single('promocion_imagen_file'), async (req, res) => {
    try {
        const { id } = req.params;

        // Objeto con los datos que pueden ser actualizados
        const toUpdate = {
            nombre: req.body.nombre,
            categoria: req.body.categoria,
        };

        // Si se subió un nuevo archivo, se elimina el antiguo y se actualiza la ruta
        if (req.file) {
            const anterior = await Promocion.findById(id);
            if (anterior?.imagen) {
                // Se construye la ruta absoluta para eliminar el archivo del servidor
                const filename = anterior.imagen.replace('/uploads/', ''); 
                const oldPath = path.join(uploadDir, filename);
                fs.unlink(oldPath, () => {}); // Elimina el archivo (silenciosamente si falla)
            }
            toUpdate.imagen = `/uploads/${req.file.filename}`; // Guarda la nueva ruta
        }

        const actualizado = await Promocion.findByIdAndUpdate(id, toUpdate, { new: true });
        if (!actualizado) return res.status(404).json({ error: 'Promoción no encontrada.' });

        res.json(actualizado);
    } catch (err) {
        console.error('❌ Error al actualizar promoción:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

/** DELETE /:id - Eliminar una promoción y su imagen */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const borrado = await Promocion.findByIdAndDelete(id);
        if (!borrado) return res.status(404).json({ error: 'Promoción no encontrada.' });

        // Eliminar el archivo de imagen asociado del servidor
        if (borrado.imagen) {
            const filename = borrado.imagen.replace('/uploads/', ''); 
            const imgPath = path.join(uploadDir, filename);
            fs.unlink(imgPath, () => {}); 
        }

        res.json({ message: 'Promoción e imagen eliminadas con éxito.' });
    } catch (err) {
        console.error('❌ Error al eliminar promoción:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;
