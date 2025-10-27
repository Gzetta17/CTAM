const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Importa el modelo
const PopupSetting = require('../models/PopupSetting'); 

// NOTA: SE ASUME QUE LA AUTENTICACIÓN (verifyToken) NO SE REQUIERE TEMPORALMENTE 
// para evitar el error 'Cannot find module', pero se recomienda añadirla.

// Define el directorio de subidas
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer para la subida de archivos (usará prefijo 'popup')
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `popup-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

// ID fijo para la configuración. Como solo debe haber un pop-up, usaremos un ID constante.
// En MongoDB, puedes usar un ID conocido o siempre buscar el primer documento.
// Aquí usaremos una lógica que siempre se enfoca en el *único* documento.
const CONFIG_ID = 'singleton-popup-config'; 

// --- FUNCIONES CRUD PARA LA CONFIGURACIÓN ÚNICA DEL POP-UP ---

/** GET / - Obtener la configuración actual del pop-up */
router.get('/', async (req, res) => {
    try {
        // Busca el único documento de configuración (o el primero que encuentre)
        let config = await PopupSetting.findOne({}); 

        if (!config) {
            // Si no existe, crea un documento por defecto (sin imagen, no visible)
            config = await PopupSetting.create({
                imagen: '/uploads/default-placeholder.png', // Usa un placeholder
                mostrar: false,
                titulo: 'Configuración Inicial'
            });
        }
        
        res.json(config);
    } catch (err) {
        console.error('❌ Error al obtener configuración de pop-up:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


/** PUT / - Actualizar la configuración del pop-up (imagen, estado de mostrar, etc.) */
// Requiere 'imagen' opcionalmente, y campos 'mostrar' y 'titulo' en el cuerpo (body)
router.put('/', upload.single('imagen'), async (req, res) => {
    try {
        const { mostrar, titulo } = req.body;
        
        // 1. Buscamos el documento actual. Si no existe, lo creamos.
        let anterior = await PopupSetting.findOne({});

        if (!anterior) {
             anterior = await PopupSetting.create({
                imagen: '/uploads/default-placeholder.png',
                mostrar: false,
                titulo: 'Configuración Inicial'
            });
        }

        const toUpdate = {
            titulo: titulo || anterior.titulo,
            mostrar: (mostrar === 'true' || mostrar === true), // Convierte a booleano
        };

        // 2. Si se sube un nuevo archivo, actualizamos la imagen
        if (req.file) {
            
            // Si la imagen anterior no era el placeholder, la eliminamos del disco
            if (anterior.imagen && anterior.imagen !== '/uploads/default-placeholder.png') {
                const filename = anterior.imagen.replace('/uploads/', ''); 
                const oldPath = path.join(uploadDir, filename);
                fs.unlink(oldPath, () => {
                    // console.log(`Imagen anterior eliminada: ${oldPath}`);
                }); 
            }
            
            // Guarda la nueva ruta corregida
            toUpdate.imagen = `/uploads/${req.file.filename}`; 
        } else {
             // Si no se sube un archivo, mantenemos la imagen anterior
             toUpdate.imagen = anterior.imagen;
        }

        // 3. Buscamos y actualizamos el documento único (el ID del documento encontrado)
        const actualizado = await PopupSetting.findByIdAndUpdate(
            anterior._id, 
            toUpdate, 
            { new: true, upsert: true } // upsert: true asegura que si lo borramos, se cree uno nuevo
        );

        res.json(actualizado);

    } catch (err) {
        console.error('❌ Error al actualizar configuración de pop-up:', err);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;