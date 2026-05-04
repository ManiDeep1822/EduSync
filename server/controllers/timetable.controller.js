const Timetable = require('../models/Timetable');
const Teacher = require('../models/Teacher');
const { generateTimetable } = require('../services/scheduler.service');

// @desc    Generate timetable for a batch
// @route   POST /api/timetable/generate
// @access  Admin
exports.generate = async (req, res) => {
  try {
    const { batchId, weekStartDate } = req.body;
    
    const timetable = await generateTimetable(batchId, new Date(weekStartDate), req.user._id);
    
    if (timetable.success === false) {
      return res.status(500).json(timetable);
    }

    res.status(201).json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all timetables
// @route   GET /api/timetable
// @access  Private
exports.getTimetables = async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user._id });
      if (teacher) {
        query = { 'slots.teacher': teacher._id, status: 'published' };
      } else {
        query = { _id: null }; // Ensure no results if teacher record missing
      }
    } else if (req.user.role === 'student') {
      const studentBatchId = req.user.batchId?.toString();
      if (studentBatchId) {
        query = { status: 'published', batch: studentBatchId };
      } else {
        query = { _id: null };
      }
    }

    const timetables = await Timetable.find(query)
      .populate('batch')
      .populate('slots.course')
      .populate('slots.teacher')
      .populate('slots.room')
      .sort('-createdAt');

    res.json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get timetable by ID
// @route   GET /api/timetable/:id
// @access  Private
exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('batch')
      .populate('slots.course')
      .populate('slots.teacher')
      .populate('slots.room');

    if (!timetable) return res.status(404).json({ success: false, message: 'Timetable not found' });
    
    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(404).json({ success: false, message: 'Timetable not found' });
  }
};

// @desc    Manually edit a single slot
// @route   PUT /api/timetable/:id/slot
// @access  Admin
exports.updateSlot = async (req, res) => {
  try {
    const { slotIndex, updatedSlot } = req.body;
    const timetable = await Timetable.findById(req.params.id);

    if (!timetable) return res.status(404).json({ success: false, message: 'Timetable not found' });

    // Update slot
    timetable.slots[slotIndex] = { ...timetable.slots[slotIndex], ...updatedSlot, isManuallyEdited: true };
    timetable.lastModifiedBy = req.user._id;
    timetable.lastModifiedAt = new Date();

    await timetable.save();

    // Socket Emit
    const io = req.app.get('io');
    io.to(`batch-${timetable.batch}`).emit('timetable:slotUpdated', {
      timetableId: timetable._id,
      slotIndex,
      updatedSlot: timetable.slots[slotIndex]
    });
    io.to('admin-room').emit('timetable:slotUpdated', {
      timetableId: timetable._id,
      slotIndex,
      updatedSlot: timetable.slots[slotIndex]
    });

    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Publish timetable
// @route   PUT /api/timetable/:id/publish
// @access  Admin
exports.publishTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id, 
      { status: 'published', lastModifiedBy: req.user._id, lastModifiedAt: new Date() },
      { new: true }
    );

    if (!timetable) return res.status(404).json({ success: false, message: 'Timetable not found' });

    // Socket Emit
    const io = req.app.get('io');
    io.to(`batch-${timetable.batch}`).emit('timetable:published', {
      timetableId: timetable._id,
      batchId: timetable.batch,
      weekStartDate: timetable.weekStartDate
    });
    io.to('admin-room').emit('timetable:published', {
      timetableId: timetable._id,
      batchId: timetable.batch,
      weekStartDate: timetable.weekStartDate
    });

    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete timetable
// @route   DELETE /api/timetable/:id
// @access  Admin
exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);
    if (!timetable) return res.status(404).json({ success: false, message: 'Timetable not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get latest published timetable for a batch
// @route   GET /api/timetable/batch/:batchId
// @access  Private
exports.getLatestByBatch = async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ batch: req.params.batchId, status: 'published' })
      .populate('batch')
      .populate('slots.course')
      .populate('slots.teacher')
      .populate('slots.room')
      .sort('-weekStartDate');

    if (!timetable) return res.status(404).json({ success: false, message: 'No published timetable found for this batch' });
    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get timetable for a specific teacher
// @route   GET /api/timetable/teacher/:teacherId
// @access  Private
exports.getForTeacher = async (req, res) => {
  try {
    // Find all timetables that have slots for this teacher
    const timetables = await Timetable.find({ 
      'slots.teacher': req.params.teacherId,
      status: 'published'
    })
    .populate('batch')
    .populate('slots.course')
    .populate('slots.teacher')
    .populate('slots.room');

    res.json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
