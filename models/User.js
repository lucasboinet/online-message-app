const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  job: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  actualP: {
    type: String,
    default: "default"
  },
  status: {
    type: String,
    default: "user"
  },
  date: {
    type: Date,
    default: Date.now("<YYYY-mm-dd>")
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
