const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomContents = new mongoose.Schema(
  {
    _id: String,
    code: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomContents);
