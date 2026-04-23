/**
 * Constraint Functions for Timetable Generation
 */

/**
 * Checks if a teacher is available at a specific day and time based on their availability profile.
 * @param {Object} teacher - Teacher document
 * @param {string} day - 'Monday', 'Tuesday', etc.
 * @param {string} startTime - '09:00', '10:00', etc.
 * @returns {boolean}
 */
const isTeacherAvailable = (teacher, day, startTime) => {
  if (!teacher.availability || teacher.availability.length === 0) return true;
  
  const dayAvailability = teacher.availability.find(a => a.day === day);
  if (!dayAvailability) return false;
  
  return dayAvailability.slots.includes(startTime);
};

/**
 * Checks if a teacher is already booked in the current matrix for a given slot.
 * @param {string} teacherId - ID of the teacher
 * @param {string} day - 'Monday', 'Tuesday', etc.
 * @param {string} startTime - '09:00', '10:00', etc.
 * @param {Object} matrix - In-memory slot matrix
 * @returns {boolean}
 */
const isTeacherFree = (teacherId, day, startTime, matrix) => {
  const slot = matrix[day][startTime];
  if (!slot) return true;
  return slot.teacherId.toString() !== teacherId.toString();
};

/**
 * Checks if a room is already booked in the current matrix for a given slot.
 * @param {string} roomId - ID of the room
 * @param {string} day - 'Monday', 'Tuesday', etc.
 * @param {string} startTime - '09:00', '10:00', etc.
 * @param {Object} matrix - In-memory slot matrix
 * @returns {boolean}
 */
const isRoomFree = (roomId, day, startTime, matrix) => {
  const slot = matrix[day][startTime];
  if (!slot) return true;
  return slot.roomId.toString() !== roomId.toString();
};

/**
 * Checks if a batch is already booked in the current matrix for a given slot.
 * @param {string} batchId - ID of the batch
 * @param {string} day - 'Monday', 'Tuesday', etc.
 * @param {string} startTime - '09:00', '10:00', etc.
 * @param {Object} matrix - In-memory slot matrix
 * @returns {boolean}
 */
const isBatchFree = (batchId, day, startTime, matrix) => {
  const slot = matrix[day][startTime];
  if (!slot) return true;
  return slot.batchId.toString() !== batchId.toString();
};

module.exports = {
  isTeacherAvailable,
  isTeacherFree,
  isRoomFree,
  isBatchFree
};
