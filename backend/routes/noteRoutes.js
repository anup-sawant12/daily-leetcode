const express = require('express');
const router = express.Router();
const { getUserNotes, upsertNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getUserNotes);

router.route('/:questionId')
  .put(upsertNote)
  .delete(deleteNote);

module.exports = router;
