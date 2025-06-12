const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Clave secreta (podés moverla a un archivo .env más adelante)
const SECRET = 'claveSuperSecreta123';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Buscar usuario
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ error: 'Usuario no encontrado' });
  }

  // Comparar contraseñas
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ error: 'Contraseña incorrecta' });
  }

  // Crear token JWT
  const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: '1h' });

  res.json({ message: 'Login correcto', token });
});

module.exports = router;
