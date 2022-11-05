//database
const mongoose = require('mongoose');
mongoose.connect(
  'mongodb+srv://sneha:12345@cluster0.kc11ulc.mongodb.net/?retryWrites=true&w=majority',
  () => {
    console.log('Connected to database');
  }
);

const userSchema = new mongoose.Schema(
  {
    username: String,
    roomId: String,
    code: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
