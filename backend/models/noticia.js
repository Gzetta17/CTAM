const mongoose = require('mongoose');

// Define el esquema para una noticia
const NoticiaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    categoria: {
        type: String,
        required: true,
        trim: true
    },
    imagen: { 
        type: String,
        required: true
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Noticia', NoticiaSchema);
