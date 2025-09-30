const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para servir archivos estáticos desde la carpeta 'uploads'
// Esto es VITAL para que las imágenes de comercios y noticias se vean
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para servir archivos estáticos de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/ctam_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
    // IMPORTANTE: Un error en la conexión a DB puede hacer que las rutas fallen.
    // Aunque el servidor arranque, las rutas que usan la DB fallarán internamente.
});

// Rutas de la API
// Asegúrate de que estos archivos existan:
const authRoutes = require('./routes/auth');
const popupRoutes = require('./routes/popup');
const comercioRoutes = require('./routes/comercio');
const noticiaRoutes = require('./routes/noticia');

// Mapeo de rutas para Noticias y Comercios
app.use('/api/auth', authRoutes);
app.use('/api', popupRoutes);
app.use('/api/comercios', comercioRoutes); // Maneja toda la lógica de comercios
app.use('/api/noticias', noticiaRoutes);   // Maneja toda la lógica de noticias

// Ping
app.get('/', (req, res) => res.send('Servidor funcionando correctamente'));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🌐 Accede a tu aplicación en http://localhost:${PORT}/noticias.html`);
});