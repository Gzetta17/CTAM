// createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ctamDB')
  .then(async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = new User({ username: 'admin', password: hashedPassword });
    await user.save();
    console.log('✅ Usuario admin creado');
    mongoose.disconnect();
  })
  .catch(err => console.error(err));
  