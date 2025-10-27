const mongoose = require('mongoose');

// Se usa un esquema de un solo documento para la configuración global.
const popupSettingSchema = new mongoose.Schema({
    // La imagen del pop-up (solo el nombre del archivo subido en /uploads/)
    imagen: { 
        type: String, 
        required: true 
    },
    // Booleano para saber si el pop-up debe mostrarse al cargar la web
    mostrar: { 
        type: Boolean, 
        default: false 
    },
    // Título o descripción (opcional)
    titulo: {
        type: String,
        default: 'Pop-up Principal'
    }
}, { timestamps: true });

// Usaremos findOne() o findByIdAndUpdate() para garantizar que solo haya una configuración.
module.exports = mongoose.model('PopupSetting', popupSettingSchema);
