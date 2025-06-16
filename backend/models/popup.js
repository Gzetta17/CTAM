const mongoose = require('mongoose');

const popupSchema = new mongoose.Schema({
  image: {
    data: Buffer,
    contentType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PopUp', popupSchema);
