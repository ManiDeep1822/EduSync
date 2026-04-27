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
    // Clear existing data (optional but recommended for a fresh start)
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Room.deleteMany({});
    await Batch.deleteMany({});
    await Course.deleteMany({});
    await Timetable.deleteMany({});

    // 1. Create Admin
    await User.create({
      name: 'Administrator',
      email: 'admin@edusync.com',
      password: 'admin123',
      role: 'admin'
    });

    // 2. Create Teachers
    const teachers = await Teacher.create([
      { name: 'Dr. Alan Turing', email: 'turing@edusync.com', specialization: 'Computer Science', availability: ['Monday', 'Tuesday', 'Wednesday'] },
      { name: 'Prof. Ada Lovelace', email: 'lovelace@edusync.com', specialization: 'Mathematics', availability: ['Wednesday', 'Thursday', 'Friday'] },
      { name: 'Dr. Sarah Wilson', email: 'sarah.wilson@edusync.com', specialization: 'Physics', availability: ['Monday', 'Thursday', 'Friday'] },
      { name: 'Prof. Mike Brown', email: 'mike@edusync.com', specialization: 'CS', availability: ['Tuesday', 'Wednesday', 'Friday'] }
    ]);

    // 3. Create Rooms
    const rooms = await Room.create([
      { name: 'Room 101', capacity: 40, type: 'classroom', facilities: ['Projector'] },
      { name: 'Lab A', capacity: 30, type: 'lab', facilities: ['Computers'] },
      { name: 'Room 201', capacity: 50, type: 'classroom', facilities: ['Projector', 'AC'] },
      { name: 'Seminar Hall', capacity: 100, type: 'seminar_hall', facilities: ['Audio System'] }
    ]);

    // 4. Create Batches
    const batches = await Batch.create([
      { name: 'CSE-A', academicYear: '2023-24', studentCount: 45 },
      { name: 'CSE-B', academicYear: '2023-24', studentCount: 42 },
      { name: 'ECE-A', academicYear: '2023-24', studentCount: 40 }
    ]);

    // 5. Create Courses
    const courses = await Course.create([
      { code: 'CS101', name: 'Data Structures', credits: 4, type: 'theory' },
      { code: 'CS102', name: 'Algorithms', credits: 4, type: 'theory' },
      { code: 'CS103', name: 'Database Lab', credits: 2, type: 'lab' },
      { code: 'PH101', name: 'Engineering Physics', credits: 4, type: 'theory' }
    ]);

    // 6. Link extra users
    await User.create({
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@edusync.com',
      password: 'password123',
      role: 'teacher',
      teacherId: teachers[2]._id
    });

    await User.create({
      name: 'John Doe',
      email: 'john.doe@edusync.com',
      password: 'password123',
      role: 'student',
      batchId: batches[0]._id
    });

    const userCount = await User.countDocuments();
    res.json({ 
      success: true, 
      message: 'Production Database Seeded Successfully!',
      details: {
        users: userCount,
        teachers: teachers.length,
        batches: batches.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
