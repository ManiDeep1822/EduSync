const express = require('express');
const router = express.Router();
const { getBatches, createBatch, updateBatch, deleteBatch } = require('../controllers/batch.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);

router.route('/')
  .get(authorize('admin'), getBatches)
  .post(authorize('admin'), createBatch);

router.route('/:id')
  .put(authorize('admin'), updateBatch)
  .delete(authorize('admin'), deleteBatch);

module.exports = router;
