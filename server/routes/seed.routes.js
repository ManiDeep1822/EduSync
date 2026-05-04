const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Batch = require('../models/Batch');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');

router.get('/', async (req, res) => {
  try {
    // 1. Clear everything for a truly clean slate
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Room.deleteMany({});
    await Batch.deleteMany({});
    await Course.deleteMany({});
    await Timetable.deleteMany({});

    // 2. Create Admin
    const admin = await User.create({
      name: 'Administrator',
      email: 'admin@edusync.com',
      password: 'admin123',
      role: 'admin'
    });

    // 3. Create Massive Teachers
    const teacherData = [
      { name: 'Dr. Alan Turing', department: 'Computer Science', maxHours: 20 },
      { name: 'Dr. Grace Hopper', department: 'Computer Science', maxHours: 18 },
      { name: 'Dr. Ada Lovelace', department: 'Mathematics', maxHours: 15 },
      { name: 'Prof. John von Neumann', department: 'Mathematics', maxHours: 20 },
      { name: 'Dr. Richard Feynman', department: 'Physics', maxHours: 20 },
      { name: 'Dr. Marie Curie', department: 'Physics', maxHours: 18 },
      { name: 'Dr. Nikola Tesla', department: 'Electrical', maxHours: 22 },
      { name: 'Dr. Thomas Edison', department: 'Electrical', maxHours: 20 },
      { name: 'Prof. Alexander Bell', department: 'Electronics', maxHours: 18 },
      { name: 'Dr. James Maxwell', department: 'Electronics', maxHours: 15 },
      { name: 'Prof. Isaac Newton', department: 'Mechanical', maxHours: 20 },
      { name: 'Dr. Archimedes', department: 'Mechanical', maxHours: 15 },
      { name: 'Prof. Galileo Galilei', department: 'Civil', maxHours: 20 },
      { name: 'Dr. Leonardo da Vinci', department: 'Civil', maxHours: 25 },
      { name: 'Dr. Rosalind Franklin', department: 'Biology', maxHours: 18 },
      { name: 'Prof. Charles Darwin', department: 'Biology', maxHours: 15 },
      { name: 'Dr. Linus Pauling', department: 'Chemistry', maxHours: 20 },
      { name: 'Prof. Dmitri Mendeleev', department: 'Chemistry', maxHours: 18 },
      { name: 'Dr. Sigmund Freud', department: 'Humanities', maxHours: 15 },
      { name: 'Prof. Carl Jung', department: 'Humanities', maxHours: 15 },
    ];

    const standardAvailability = [
      { day: 'Monday', slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
      { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
      { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
      { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
      { day: 'Friday', slots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] }
    ];

    const teachersToInsert = teacherData.map((t, idx) => ({
      name: t.name,
      email: `teacher${idx + 1}@edusync.com`,
      department: t.department,
      maxHoursPerWeek: t.maxHours,
      availability: standardAvailability
    }));

    const teachers = await Teacher.insertMany(teachersToInsert);

    // 4. Create Rooms
    const roomData = [];
    for (let i = 1; i <= 10; i++) roomData.push({ name: `Classroom 10${i}`, capacity: 60, type: 'classroom' });
    for (let i = 1; i <= 10; i++) roomData.push({ name: `Classroom 20${i}`, capacity: 60, type: 'classroom' });
    for (let i = 1; i <= 5; i++) roomData.push({ name: `Lab CS-${i}`, capacity: 30, type: 'lab', facilities: ['computers', 'AC'] });
    for (let i = 1; i <= 3; i++) roomData.push({ name: `Lab EC-${i}`, capacity: 30, type: 'lab', facilities: ['equipment', 'AC'] });
    roomData.push({ name: 'Main Seminar Hall', capacity: 200, type: 'seminar_hall', facilities: ['AC', 'projector', 'audio system'] });
    roomData.push({ name: 'Mini Seminar Hall', capacity: 100, type: 'seminar_hall', facilities: ['AC', 'projector'] });

    const rooms = await Room.insertMany(roomData);

    // 5. Create Batches
    const batchData = [];
    const depts = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Information Tech'];
    depts.forEach(dept => {
      const prefix = dept.substring(0, 3).toUpperCase();
      for (let sem = 1; sem <= 8; sem++) {
        batchData.push({ name: `${prefix}-A`, department: dept, semester: sem, studentCount: Math.floor(Math.random() * 20) + 40 });
        if (['Computer Science', 'Electronics'].includes(dept)) {
          batchData.push({ name: `${prefix}-B`, department: dept, semester: sem, studentCount: Math.floor(Math.random() * 20) + 40 });
        }
      }
    });

    const batches = await Batch.insertMany(batchData);

    // 6. Create Courses
    const courseData = [];
    batches.forEach((batch) => {
      for (let i = 1; i <= 5; i++) {
        const isLab = i === 5;
        const type = isLab ? 'lab' : 'theory';
        const hours = isLab ? 3 : 4;
        const cCode = `${batch.name.replace('-', '')}${batch.semester}0${i}`;
        const randomTeacher = teachers[Math.floor(Math.random() * teachers.length)];

        courseData.push({
          name: `${batch.department} ${type === 'lab' ? 'Lab' : 'Subject'} ${i} (Sem ${batch.semester})`,
          code: cCode,
          hoursPerWeek: hours,
          sessionDuration: type === 'lab' ? 120 : 60,
          courseType: type,
          requiredRoomType: type === 'lab' ? 'lab' : 'classroom',
          requiredCapacity: batch.studentCount,
          assignedTeacher: randomTeacher._id,
          batches: [batch._id]
        });
      }
    });

    const courses = await Course.insertMany(courseData);

    // 7. Extra Users
    const teacherUser = await User.create({
      name: teachers[0].name,
      email: "teacher@edusync.com",
      password: "password123",
      role: "teacher",
      teacherId: teachers[0]._id
    });
    teachers[0].userId = teacherUser._id;
    await teachers[0].save();

    await User.create({
      name: "Test Student",
      email: "student@edusync.com",
      password: "password123",
      role: "student",
      batchId: batches[0]._id
    });

    // 8. Timetables
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1);

    for (let i = 0; i < 5; i++) {
      const b = batches[i];
      const batchCourses = courses.filter(c => c.batches.includes(b._id));
      const slots = [];
      let hour = 9;
      let dayIndex = 0;
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

      batchCourses.forEach(c => {
        slots.push({
          day: days[dayIndex],
          startTime: `${hour < 10 ? '0' : ''}${hour}:00`,
          endTime: `${hour + 1 < 10 ? '0' : ''}${hour + 1}:00`,
          course: c._id,
          teacher: c.assignedTeacher,
          room: rooms[Math.floor(Math.random() * 20)]._id
        });
        hour++;
        if (hour > 15) {
          hour = 9;
          dayIndex++;
          if (dayIndex > 4) dayIndex = 0;
        }
      });

      await Timetable.create({
        batch: b._id,
        weekStartDate: startDate,
        status: i < 3 ? 'published' : 'draft',
        slots
      });
    }

    res.json({ 
      success: true, 
      message: 'Production Database Seeded Successfully with massive dataset!',
      counts: {
        users: await User.countDocuments(),
        teachers: await Teacher.countDocuments(),
        rooms: await Room.countDocuments(),
        batches: await Batch.countDocuments(),
        courses: await Course.countDocuments(),
        timetables: await Timetable.countDocuments()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
