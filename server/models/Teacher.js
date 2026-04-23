const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String
  },
  availability: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
      },
      slots: [String] // e.g. ['09:00', '10:00'] - following HH:MM format
    }
  ],
  assignedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  ],
  maxHoursPerWeek: {
    type: Number,
    default: 20
  }
}, {
  timestamps: true
});

teacherSchema.index({ userId: 1 });

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
