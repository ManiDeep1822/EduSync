const express = require('express');
const router = express.Router();
const { 
  generate, 
  getTimetables, 
  getTimetableById, 
  updateSlot, 
  publishTimetable, 
  deleteTimetable,
  getLatestByBatch,
  getForTeacher
} = require('../controllers/timetable.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.post('/generate', authorize('admin'), generate);
router.get('/', getTimetables);
router.get('/:id', getTimetableById);
router.put('/:id/slot', authorize('admin'), updateSlot);
router.put('/:id/publish', authorize('admin'), publishTimetable);
router.delete('/:id', authorize('admin'), deleteTimetable);
router.get('/batch/:batchId', getLatestByBatch);
router.get('/teacher/:teacherId', authorize('admin', 'teacher'), getForTeacher);

module.exports = router;
