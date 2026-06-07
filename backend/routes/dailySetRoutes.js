const express = require('express');
const router = express.Router();
const { getTodaySet, markAsSolved, getSolvedQuestions, generateSet, getStats, remoteSeed, getHistory, incrementSolveCount, decrementSolveCount, syncLeetcodeSubmissions } = require('../controllers/dailySetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/seed', remoteSeed);
router.get('/today', protect, getTodaySet);
router.post('/generate', protect, generateSet);
router.post('/solve/:id', protect, markAsSolved);
router.post('/solve/:id/increment', protect, incrementSolveCount);
router.post('/solve/:id/decrement', protect, decrementSolveCount);
router.get('/solved', protect, getSolvedQuestions);
router.get('/stats', protect, getStats);
router.get('/history', protect, getHistory);
router.post('/sync', protect, syncLeetcodeSubmissions);

module.exports = router;
