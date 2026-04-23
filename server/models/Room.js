const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['classroom', 'lab', 'seminar_hall'],
    required: true
  },
  facilities: [String],
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
