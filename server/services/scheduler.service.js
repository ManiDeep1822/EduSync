const Teacher = require('../models/Teacher');
const Room = require('../models/Room');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const {
  isTeacherAvailable,
  isTeacherFree,
  isRoomFree,
  isBatchFree
} = require('../utils/conflictDetector');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const START_HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

/**
 * Custom Scheduling Algorithm
 * @param {string} batchId - ID of the batch to generate timetable for
 * @param {Date} weekStartDate - Starting date of the week
 * @param {string} generatedBy - User ID
 */
const generateTimetable = async (batchId, weekStartDate, generatedBy) => {
  try {
    // Normalize date to midnight to ensure consistent comparison across the week
    const normalizedDate = new Date(weekStartDate);
    normalizedDate.setHours(0, 0, 0, 0);
    
    // 1. Input Collection
    const courses = await Course.find({ batches: batchId }).populate('assignedTeacher');
    const rooms = await Room.find({ isAvailable: true });

    // 2. Optimization: Pre-fetch all existing timetables for this week to avoid DB queries inside loops
    const existingTimetables = await Timetable.find({ weekStartDate: normalizedDate });
    const busyTeachers = new Set();
    const busyRooms = new Set();

    existingTimetables.forEach(t => {
      t.slots.forEach(slot => {
        if (slot.teacher) busyTeachers.add(`${slot.day}-${slot.startTime}-${slot.teacher.toString()}`);
        if (slot.room) busyRooms.add(`${slot.day}-${slot.startTime}-${slot.room.toString()}`);
      });
    });

    // 3. Slot Matrix Setup
    // structure: matrix[day][time] = { courseId, teacherId, roomId, batchId }
    const matrix = {};
    DAYS.forEach(day => {
      matrix[day] = {};
      START_HOURS.forEach(hour => {
        matrix[day][hour] = null;
      });
    });

    const resultSlots = [];
    const conflicts = [];

    // 4. Assignment Loop
    for (const course of courses) {
      let weeklyHoursLeft = course.hoursPerWeek;
      const teacher = course.assignedTeacher;

      if (!teacher) {
        conflicts.push({
          type: 'teacher',
          description: `No teacher assigned to course ${course.code} (${course.name})`,
          slotIndex: -1
        });
        continue;
      }

      // Track how many slots this course has on each day to prevent clumping
      const dailyCourseHours = {};
      DAYS.forEach(d => dailyCourseHours[d] = 0);

      // Try to assign slots
      for (const day of DAYS) {
        if (weeklyHoursLeft <= 0) break;

        // Shuffle START_HOURS to create natural gaps (leisure hours)
        const shuffledHours = [...START_HOURS].sort(() => Math.random() - 0.5);

        for (const startTime of shuffledHours) {
          if (weeklyHoursLeft <= 0) break;

          // Reserve 13:00 for lunch break
          if (startTime === '13:00') continue;

          // Enforce realistic scattering: max 1 hour per day for theory, 2 for lab
          const maxHoursPerDay = course.courseType === 'lab' ? 2 : 1;
          if (dailyCourseHours[day] >= maxHoursPerDay) continue;

          // Check if batch is already busy in this slot
          if (!isBatchFree(batchId, day, startTime, matrix)) continue;

          // Check if teacher is available according to their profile
          if (!isTeacherAvailable(teacher, day, startTime)) continue;

          // Check if teacher is free using our pre-fetched busy map
          if (busyTeachers.has(`${day}-${startTime}-${teacher._id.toString()}`)) continue;

          // Find an available room
          let finalRoom = null;
          for (const room of rooms) {
            if (room.type !== course.requiredRoomType) continue;
            if (room.capacity < (course.requiredCapacity || 0)) continue;

            // Check if room is free using our pre-fetched busy map
            if (!busyRooms.has(`${day}-${startTime}-${room._id.toString()}`)) {
              finalRoom = room;
              break;
            }
          }

          if (finalRoom) {
            // SUCCESS: Assign slot
            const endTimeHour = parseInt(startTime.split(':')[0]) + 1;
            const endTime = `${endTimeHour.toString().padStart(2, '0')}:00`;

            const slotData = {
              day,
              startTime,
              endTime,
              course: course._id,
              teacher: teacher._id,
              room: finalRoom._id,
              batch: batchId,
              isManuallyEdited: false
            };

            matrix[day][startTime] = {
              courseId: course._id,
              teacherId: teacher._id,
              roomId: finalRoom._id,
              batchId: batchId
            };

            resultSlots.push(slotData);
            weeklyHoursLeft--;
            dailyCourseHours[day]++;
            
            // Mark teacher and room as busy for the generated timetable as well
            busyTeachers.add(`${day}-${startTime}-${teacher._id.toString()}`);
            busyRooms.add(`${day}-${startTime}-${finalRoom._id.toString()}`);
          }
        }
      }

      // If after checking all slots, we still have hours left
      if (weeklyHoursLeft > 0) {
        conflicts.push({
          type: 'batch',
          description: `Could not find ${weeklyHoursLeft} hour(s) for course ${course.code} due to constraints.`,
          slotIndex: resultSlots.length // approximate location
        });
      }
    }

    // 4. Find existing or create new
    let timetable = await Timetable.findOne({ batch: batchId, weekStartDate: normalizedDate });
    
    if (timetable) {
      // Update existing
      timetable.slots = resultSlots;
      timetable.conflicts = conflicts;
      timetable.generatedBy = generatedBy;
      timetable.lastModifiedBy = generatedBy;
      timetable.lastModifiedAt = new Date();
      // Keep existing status (usually draft)
    } else {
      // Create new
      timetable = new Timetable({
        weekStartDate: normalizedDate,
        batch: batchId,
        generatedBy,
        status: 'draft',
        slots: resultSlots,
        conflicts,
        lastModifiedBy: generatedBy,
        lastModifiedAt: new Date()
      });
    }

    await timetable.save();
    
    // Return populated
    return await Timetable.findById(timetable._id)
      .populate('batch')
      .populate('slots.course')
      .populate('slots.teacher')
      .populate('slots.room');

  } catch (error) {
    console.error('Error in scheduler service:', error);
    // Requirements say never throw, so we return a "failed" object with conflicts
    return {
      success: false,
      message: error.message,
      conflicts: [{ type: 'batch', description: 'Internal Scheduler Error: ' + error.message, slotIndex: -1 }]
    };
  }
};

module.exports = {
  generateTimetable
};
