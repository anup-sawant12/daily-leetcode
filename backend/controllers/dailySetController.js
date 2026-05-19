const DailySet = require('../models/DailySet');
const SolvedQuestion = require('../models/SolvedQuestion');
const User = require('../models/User');
const Question = require('../models/Question');
const { generateDailySet } = require('../utils/generator');

// @desc    Generate today's set manually
// @route   POST /api/daily-sets/generate
// @access  Private
const generateSet = async (req, res) => {
  try {
    const dailySet = await generateDailySet();
    res.json(dailySet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's daily set
// @route   GET /api/daily-sets/today
// @access  Public
const getTodaySet = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dailySet = await DailySet.findOne({ date: today }).populate('questions');
    
    if (!dailySet) {
      return res.status(404).json({ message: 'Daily set not generated yet' });
    }
    
    res.json(dailySet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark question as solved
// @route   POST /api/daily-sets/solve/:id
// @access  Private
const markAsSolved = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id;

    const exists = await SolvedQuestion.findOne({ user: userId, question: questionId });
    if (exists) {
      await SolvedQuestion.findOneAndDelete({ user: userId, question: questionId });
      return res.json({ message: 'Question unmarked', status: 'unsolved' });
    }

    await SolvedQuestion.create({
      user: userId,
      question: questionId
    });

    // Update streak logic
    const user = await User.findById(userId);
    const today = new Date().toISOString().split('T')[0];
    const lastSolved = user.lastSolvedDate ? user.lastSolvedDate.toISOString().split('T')[0] : null;

    if (lastSolved !== today) {
      if (lastSolved) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastSolved === yesterdayStr) {
          user.streak += 1;
        } else {
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }
      user.lastSolvedDate = new Date();
      await user.save();
    }

    res.json({ message: 'Question marked as solved', status: 'solved', streak: user.streak });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user stats for dashboard graphs
// @route   GET /api/daily-sets/stats
// @access  Private
const getStats = async (req, res) => {
  try {
    const solved = await SolvedQuestion.find({ user: req.user._id }).populate('question');
    
    const dateCounts = {};
    const difficultyCounts = { Easy: 0, Medium: 0, Hard: 0 };
    
    solved.forEach(sq => {
      const date = sq.solvedAt.toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
      if (sq.question) {
        difficultyCounts[sq.question.difficulty]++;
      }
    });

    const history = Object.keys(dateCounts).map(date => ({
      date,
      solved: dateCounts[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // To make the graph look good for new users, we can pad recent days if history is too short.
    // But we'll handle this padding on the frontend logic.

    res.json({ history, difficultyCounts, total: solved.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user solved questions
// @route   GET /api/daily-sets/solved
// @access  Private
const getSolvedQuestions = async (req, res) => {
  try {
    const solved = await SolvedQuestion.find({ user: req.user._id }).populate('question');
    res.json(solved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remote seeder and resetter
// @route   GET /api/daily-sets/seed
// @access  Public
const remoteSeed = async (req, res) => {
  try {
    const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';
    const QUERY = `
      query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
        problemsetQuestionList: questionList(
          categorySlug: $categorySlug
          limit: $limit
          skip: $skip
          filters: $filters
        ) {
          data {
            questionFrontendId
            title
            titleSlug
            difficulty
            topicTags { name }
          }
        }
      }
    `;

    const response = await fetch(LEETCODE_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: QUERY,
        variables: { categorySlug: "", skip: 0, limit: 5000, filters: {} }
      })
    });

    const result = await response.json();
    const rawQuestions = result.data.problemsetQuestionList.data;

    const formattedQuestions = rawQuestions.map(q => ({
      questionId: q.questionFrontendId,
      title: q.title,
      titleSlug: q.titleSlug,
      difficulty: q.difficulty,
      topicTags: q.topicTags.map(tag => tag.name),
      url: `https://leetcode.com/problems/${q.titleSlug}/`
    }));

    await Question.deleteMany();
    await Question.insertMany(formattedQuestions);
    await DailySet.deleteMany();

    res.json({ message: `Database successfully seeded with ${formattedQuestions.length} questions and DailySets cleared!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTodaySet,
  markAsSolved,
  getSolvedQuestions,
  generateSet,
  getStats,
  remoteSeed
};
