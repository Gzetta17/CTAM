const express = require('express');
const router = express.Router();

// Ruta de prueba para popup
router.get('/popup-test', (req, res) => {
  res.json({ message: 'Ruta popup funcionando' });
});

module.exports = router;
