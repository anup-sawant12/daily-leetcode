const express = require('express');
const router = express.Router();
const { getTodaySet, markAsSolved, getSolvedQuestions, generateSet, getStats } = require('../controllers/dailySetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/today', getTodaySet);
router.post('/generate', protect, generateSet);
router.post('/solve/:id', protect, markAsSolved);
router.get('/solved', protect, getSolvedQuestions);
router.get('/stats', protect, getStats);

module.exports = router;
