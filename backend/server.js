const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/ctamDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch((err) => console.error('❌ Error al conectar:', err));

// Rutas
const authRoutes = require('./routes/auth');
const popupRoutes = require('./routes/popup');
const comercioRoutes = require('./routes/comercio');
const noticiaRoutes = require('./routes/noticia');

app.use('/api', authRoutes);
app.use('/api', popupRoutes);
app.use('/api', comercioRoutes);
app.use('/api', noticiaRoutes);
app.use('/uploads', express.static('uploads')); // Para servir imágenes

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Iniciar servidor al final
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
