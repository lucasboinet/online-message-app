const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true
  },
  motif: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "not solved"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
