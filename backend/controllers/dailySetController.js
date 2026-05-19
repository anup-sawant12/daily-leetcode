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
    const sampleQuestions = [
      { questionId: '1', title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', topicTags: ['Arrays', 'Hashing'], url: 'https://leetcode.com/problems/two-sum/' },
      { questionId: '20', title: 'Valid Parentheses', titleSlug: 'valid-parentheses', difficulty: 'Easy', topicTags: ['Strings', 'Stack'], url: 'https://leetcode.com/problems/valid-parentheses/' },
      { questionId: '21', title: 'Merge Two Sorted Lists', titleSlug: 'merge-two-sorted-lists', difficulty: 'Easy', topicTags: ['Linked List'], url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { questionId: '3', title: 'Longest Substring Without Repeating Characters', titleSlug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', topicTags: ['Strings', 'Sliding Window'], url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { questionId: '11', title: 'Container With Most Water', titleSlug: 'container-with-most-water', difficulty: 'Medium', topicTags: ['Arrays', 'Greedy'], url: 'https://leetcode.com/problems/container-with-most-water/' },
      { questionId: '15', title: '3Sum', titleSlug: '3sum', difficulty: 'Medium', topicTags: ['Arrays', 'Hashing'], url: 'https://leetcode.com/problems/3sum/' },
      { questionId: '33', title: 'Search in Rotated Sorted Array', titleSlug: 'search-in-rotated-sorted-array', difficulty: 'Medium', topicTags: ['Arrays', 'Binary Search'], url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { questionId: '98', title: 'Validate Binary Search Tree', titleSlug: 'validate-binary-search-tree', difficulty: 'Medium', topicTags: ['Trees'], url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
      { questionId: '4', title: 'Median of Two Sorted Arrays', titleSlug: 'median-of-two-sorted-arrays', difficulty: 'Hard', topicTags: ['Arrays', 'Binary Search'], url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
      { questionId: '23', title: 'Merge k Sorted Lists', titleSlug: 'merge-k-sorted-lists', difficulty: 'Hard', topicTags: ['Linked List', 'Queue'], url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
    ];
    
    await Question.deleteMany();
    await Question.insertMany(sampleQuestions);
    await DailySet.deleteMany();

    res.json({ message: 'Database successfully seeded and DailySets cleared!' });
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
