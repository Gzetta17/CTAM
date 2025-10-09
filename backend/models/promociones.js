const mongoose = require('mongoose');

const promocionSchema = new mongoose.Schema({
    // Nombre o título de la promoción
    nombre: { 
        type: String, 
        required: true,
        trim: true 
    },
    // Categoría o tipo de la promoción (ej: 'alimentos', 'bebidas', 'especial')
    categoria: { 
        type: String, 
        required: true,
        trim: true 
    },
    // Ruta de la imagen subida (ej: '/uploads/promocion-1678888888.jpg')
    imagen: { 
        type: String, 
        required: true,
        trim: true 
    },

}, { 
    // Añade campos 'createdAt' y 'updatedAt' automáticamente
    timestamps: true,
    // Eliminamos 'versionKey: false' ya que 'timestamps: true' lo reemplaza
});

// Exporta el modelo con el nombre 'Promocion'
module.exports = mongoose.model('Promocion', promocionSchema);
