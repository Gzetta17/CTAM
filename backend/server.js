const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mongo
mongoose.connect('mongodb://localhost:27017/ctamDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Rutas
const authRoutes = require('./routes/auth');       // opcional, si lo usás
const popupRoutes = require('./routes/popup');
const comercioRoutes = require('./routes/comercio'); // OJO: singular y coincide con archivo
const noticiaRoutes = require('./routes/noticia');   // OJO: singular y coincide con archivo

app.use('/api', authRoutes);    // si no lo usás, podés comentarla
app.use('/api', popupRoutes);
app.use('/api', comercioRoutes);
app.use('/api', noticiaRoutes);

// Servir estáticos de /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ping
app.get('/', (req, res) => res.send('Servidor funcionando correctamente'));

// Start
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
