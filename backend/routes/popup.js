const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `popup${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// POST /popup  (campo: image)
router.post('/popup', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
  return res.status(201).json({ message: 'Imagen guardada' });
});

// GET /popup  → devuelve archivo binario
router.get('/popup', (req, res) => {
  const files = fs.readdirSync(uploadDir);
  // buscamos un archivo que empiece con "popup"
  const popup = files.find(f => f.startsWith('popup.'));
  if (!popup) return res.status(404).send('No hay imagen');
  res.sendFile(path.join(uploadDir, popup));
});

module.exports = router;
