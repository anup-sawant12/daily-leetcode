const express = require('express');
const router = express.Router();
const { getQuestions, addQuestion } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getQuestions).post(protect, admin, addQuestion);

module.exports = router;
