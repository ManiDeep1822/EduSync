const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  department: {
    type: String
  },
  semester: {
    type: Number
  },
  studentCount: {
    type: Number
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  ]
}, {
  timestamps: true
});

const Batch = mongoose.model('Batch', batchSchema);
module.exports = Batch;
