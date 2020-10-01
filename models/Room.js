const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  chatName: {
    type: String,
    require: true
  },
  members: [String],
  unreadedMessage: {
    type: Boolean,
    default: false
  }
});

const Room = mongoose.model('Room', RoomSchema);

module.exports = Room;
