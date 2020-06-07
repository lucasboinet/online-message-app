const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: {
    type: String,
    require: true
  },
  userID: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  readStatus: {
    type: String,
    default: "unreaded"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
