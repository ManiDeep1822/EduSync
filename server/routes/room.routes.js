const express = require('express');
const router = express.Router();
const { getRooms, createRoom, updateRoom, deleteRoom } = require('../controllers/room.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.route('/')
  .get(authorize('admin'), getRooms)
  .post(authorize('admin'), createRoom);

router.route('/:id')
  .put(authorize('admin'), updateRoom)
  .delete(authorize('admin'), deleteRoom);

module.exports = router;
