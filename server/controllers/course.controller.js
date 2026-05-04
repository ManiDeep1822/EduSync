const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('assignedTeacher').populate('batches');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    if (req.body.assignedTeacher) {
      const courseCount = await Course.countDocuments({ assignedTeacher: req.body.assignedTeacher });
      if (courseCount >= 2) {
        return res.status(400).json({ success: false, message: 'A teacher can only be assigned to a maximum of 2 courses' });
      }
    }
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    if (req.body.assignedTeacher) {
      const currentCourse = await Course.findById(req.params.id);
      if (currentCourse && currentCourse.assignedTeacher?.toString() !== req.body.assignedTeacher.toString()) {
        const courseCount = await Course.countDocuments({ assignedTeacher: req.body.assignedTeacher });
        if (courseCount >= 2) {
          return res.status(400).json({ success: false, message: 'A teacher can only be assigned to a maximum of 2 courses' });
        }
      }
    }
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
