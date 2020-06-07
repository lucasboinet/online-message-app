const mongoose = require('mongoose');

const FriendshipSchema = new mongoose.Schema({
  userAsking: {
    type: String,
    require: true
  },
  userAsked: {
    type: String,
    required: true
  },
  sended: {
      type: Boolean,
      default: true
  },
  accepted: {
    type: Boolean,
    default: false
  }
});

const Friendship = mongoose.model('Friendship', FriendshipSchema);

module.exports = Friendship;
