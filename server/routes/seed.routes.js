const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');

router.get('/', async (req, res) => {
  try {
    // 1. Clean Slate (Optional but ensures no old slots remain)
    await Timetable.deleteMany({});
    
    // 2. Create/Update Admin
    const admin = await User.findOneAndUpdate(
      { email: 'admin@edusync.com' },
      { name: 'Administrator', password: 'admin123', role: 'admin' },
      { upsert: true, new: true }
    );

    // 3. Create/Update Batches
    const batches = await Promise.all([
      Batch.findOneAndUpdate({ name: 'CSE-A' }, { academicYear: '2023-24', studentCount: 45 }, { upsert: true, new: true }),
      Batch.findOneAndUpdate({ name: 'CSE-B' }, { academicYear: '2023-24', studentCount: 42 }, { upsert: true, new: true })
    ]);

    // 4. Create/Update Rooms
    const rooms = await Promise.all([
      Room.findOneAndUpdate({ name: 'Room 101' }, { capacity: 40, type: 'classroom' }, { upsert: true, new: true }),
      Room.findOneAndUpdate({ name: 'Lab A' }, { capacity: 30, type: 'lab' }, { upsert: true, new: true }),
      Room.findOneAndUpdate({ name: 'Room 201' }, { capacity: 50, type: 'classroom' }, { upsert: true, new: true })
    ]);

    // 5. Create/Update Courses
    const courses = await Promise.all([
      Course.findOneAndUpdate({ code: 'CS101' }, { name: 'Data Structures', hoursPerWeek: 4, courseType: 'theory', requiredRoomType: 'classroom' }, { upsert: true, new: true }),
      Course.findOneAndUpdate({ code: 'PH101' }, { name: 'Physics', hoursPerWeek: 4, courseType: 'theory', requiredRoomType: 'classroom' }, { upsert: true, new: true }),
      Course.findOneAndUpdate({ code: 'CS103' }, { name: 'DB Lab', hoursPerWeek: 3, courseType: 'lab', requiredRoomType: 'lab' }, { upsert: true, new: true })
    ]);

    // 6. Create/Update Teachers
    const teachers = await Promise.all([
      Teacher.findOneAndUpdate({ email: 'turing@edusync.com' }, { name: 'Alan Turing', availability: [{ day: 'Monday' }, { day: 'Tuesday' }] }, { upsert: true, new: true }),
      Teacher.findOneAndUpdate({ email: 'sarah.wilson@edusync.com' }, { name: 'Sarah Wilson', availability: [{ day: 'Monday' }, { day: 'Wednesday' }] }, { upsert: true, new: true })
    ]);

    // 7. Create/Update Users for demo
    await User.findOneAndUpdate(
      { email: 'john.doe@edusync.com' },
      { name: 'John Doe', password: 'password123', role: 'student', batchId: batches[0]._id },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: 'sarah.wilson@edusync.com' },
      { name: 'Sarah Wilson', password: 'password123', role: 'teacher', teacherId: teachers[1]._id },
      { upsert: true, new: true }
    );

    // 8. Generate Published Timetable
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

    await Timetable.create({
      batch: batches[0]._id,
      weekStartDate: startDate,
      status: 'published',
      slots: [
        { day: 'Monday', startTime: '09:00', endTime: '10:00', course: courses[0]._id, teacher: teachers[0]._id, room: rooms[0]._id },
        { day: 'Monday', startTime: '10:00', endTime: '11:00', course: courses[1]._id, teacher: teachers[1]._id, room: rooms[2]._id }
      ]
    });

    res.json({ success: true, message: 'Seeding complete and idempotent!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
