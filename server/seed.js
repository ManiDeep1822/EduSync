const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Batch = require('./models/Batch');
const Course = require('./models/Course');
const Room = require('./models/Room');
const Teacher = require('./models/Teacher');
const Timetable = require('./models/Timetable');
const { generateTimetable } = require('./services/scheduler.service');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Batch.deleteMany({});
    await Course.deleteMany({});
    await Room.deleteMany({});
    await Teacher.deleteMany({});
    await Timetable.deleteMany({});

    // 1. Create Admin
    const admin = await User.create({
      name: 'Campus Administrator',
      email: 'admin@edu.com',
      password: 'password123',
      role: 'admin'
    });

    // 2. Create 50 Rooms across 15 blocks
    const roomData = [];
    const roomTypes = ['classroom', 'lab', 'seminar_hall'];
    for (let i = 1; i <= 50; i++) {
      const type = i % 10 === 0 ? 'seminar_hall' : (i % 4 === 0 ? 'lab' : 'classroom');
      roomData.push({
        name: `${type === 'lab' ? 'LAB' : 'RM'}-${i + 200}`,
        capacity: type === 'seminar_hall' ? 120 : (i % 2 === 0 ? 60 : 40),
        type: type,
        block: ((i - 1) % 15) + 1,
        isAvailable: true,
        facilities: type === 'lab' ? ['computers', 'projector', 'AC', 'high_speed_net'] : ['projector', 'whiteboard']
      });
    }
    await Room.insertMany(roomData);
    console.log('Created 50 campus rooms.');

    // 3. Create 15 Teachers
    const teachers = [];
    const depts = ['CS', 'IT', 'ECE', 'ME'];
    for (let i = 1; i <= 15; i++) {
      const user = await User.create({
        name: `Prof. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'][i-1]}`,
        email: `teacher${i}@edu.com`,
        password: 'password123',
        role: 'teacher'
      });
      
      const teacherProfile = await Teacher.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        department: depts[i % depts.length],
        maxHoursPerWeek: 35
      });

      user.teacherId = teacherProfile._id;
      await user.save();
      teachers.push(teacherProfile);
    }
    console.log('Created 15 department teachers.');

    // 4. Create 10 Batches
    const batchNames = [
      'CS-2024-A', 'CS-2024-B', 'IT-2024-A', 'IT-2024-B', 
      'ECE-2025-A', 'ECE-2025-B', 'ME-2025-A', 'ME-2025-B',
      'CS-GRAD-1', 'IT-GRAD-1'
    ];
    const batches = [];
    for (const name of batchNames) {
      const b = await Batch.create({
        name,
        semester: name.includes('2024') ? 1 : 2,
        department: name.split('-')[0],
        academicYear: '2025-26',
        studentCount: Math.floor(Math.random() * 20) + 40
      });
      batches.push(b);
    }
    console.log('Created 10 academic batches.');

    // 5. Create Courses for each batch
    console.log('Generating courses for all batches...');
    for (const batch of batches) {
      const subjects = [
        { name: 'Core Theory 1', code: 'CRT1', type: 'theory' },
        { name: 'Advanced Concepts', code: 'ADV', type: 'theory' },
        { name: 'Practical Workshop', code: 'WKS', type: 'lab' },
        { name: 'Dept Elective', code: 'ELE', type: 'theory' }
      ];

      for (const sub of subjects) {
        await Course.create({
          name: `${batch.department} ${sub.name}`,
          code: `${batch.name.replace(/-/g, '')}-${sub.code}`,
          courseType: sub.type,
          hoursPerWeek: sub.type === 'lab' ? 2 : 3,
          batches: [batch._id],
          assignedTeacher: teachers[Math.floor(Math.random() * teachers.length)]._id,
          requiredRoomType: sub.type === 'lab' ? 'lab' : 'classroom',
          requiredCapacity: 40
        });
      }
    }

    // 6. Create 20 Students (spread across first 4 batches)
    for (let i = 1; i <= 20; i++) {
      await User.create({
        name: `Demo Student ${i}`,
        email: `student${i}@edu.com`,
        password: 'password123',
        role: 'student',
        batchId: batches[i % 4]._id
      });
    }

    // 7. Mass Timetable Generation
    const weekStart = new Date('2026-05-04'); // Monday
    weekStart.setHours(0, 0, 0, 0);

    console.log('Generating & Publishing 10 Campus Timetables...');
    for (const batch of batches) {
      process.stdout.write(`Scheduling ${batch.name}... `);
      const timetable = await generateTimetable(batch._id, weekStart, admin._id);
      await Timetable.findByIdAndUpdate(timetable._id, { status: 'published' });
      console.log('DONE');
    }

    console.log('\n--- MASSIVE SEED COMPLETED ---');
    console.log('Admins: 1 | Teachers: 15 | Batches: 10 | Rooms: 50 | Students: 20');
    console.log('All passwords: password123');
    process.exit();
  } catch (err) {
    console.error('Massive Seed failed:', err);
    process.exit(1);
  }
};

seed();
