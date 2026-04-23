const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String
  },
  hoursPerWeek: {
    type: Number,
    required: true
  },
  sessionDuration: {
    type: Number,
    default: 60
  },
  courseType: {
    type: String,
    enum: ['theory', 'lab', 'tutorial'],
    required: true
  },
  requiredRoomType: {
    type: String,
    enum: ['classroom', 'lab', 'seminar_hall'],
    required: true
  },
  requiredCapacity: {
    type: Number
  },
  assignedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch'
    }
  ]
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
