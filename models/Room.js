const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  chatName: {
    type: String,
    require: true
  },
  onlineUser: {
    type: Number,
    default: 0
  },
  unreadedMessage: {
    type: Boolean,
    default: false
  }
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
