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
    const userId = req.user ? req.user._id : null;
    const { easyCount, mediumCount, hardCount, allowDP, allowGraph } = req.body;
    
    const dailySet = await generateDailySet(userId, {
      easyCount: easyCount !== undefined ? Number(easyCount) : 1,
      mediumCount: mediumCount !== undefined ? Number(mediumCount) : 4,
      hardCount: hardCount !== undefined ? Number(hardCount) : 1,
      allowDP,
      allowGraph
    });
    res.json(dailySet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's daily set
// @route   GET /api/daily-sets/today
// @access  Private
const getTodaySet = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userId = req.user ? req.user._id : null;
    
    let dailySet = null;
    if (userId) {
      dailySet = await DailySet.findOne({ date: today, user: userId }).populate('questions');
    }
    
    if (!dailySet) {
      // Fallback to global/cron daily set
      dailySet = await DailySet.findOne({ date: today, user: null }).populate('questions');
    }
    
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
    const topicCounts = {};
    
    solved.forEach(sq => {
      const date = sq.solvedAt.toISOString().split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;
      if (sq.question) {
        difficultyCounts[sq.question.difficulty]++;
        if (sq.question.topicTags) {
          sq.question.topicTags.forEach(tag => {
            topicCounts[tag] = (topicCounts[tag] || 0) + 1;
          });
        }
      }
    });

    const history = Object.keys(dateCounts).map(date => ({
      date,
      solved: dateCounts[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const sortedTopics = Object.keys(topicCounts).map(name => ({
      name,
      value: topicCounts[name]
    })).sort((a, b) => b.value - a.value).slice(0, 8);

    res.json({ history, difficultyCounts, topicCounts: sortedTopics, total: solved.length });
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

    const formattedQuestions = rawQuestions.map(q => {
      const topicTags = q.topicTags.map(tag => tag.name);
      return {
        questionId: q.questionFrontendId,
        title: q.title,
        titleSlug: q.titleSlug,
        difficulty: q.difficulty,
        topicTags,
        url: `https://leetcode.com/problems/${q.titleSlug}/`,
        isDynamicProgramming: topicTags.some(tag => tag.toLowerCase() === 'dynamic programming'),
        isGraph: topicTags.some(tag => tag.toLowerCase() === 'graph' || tag.toLowerCase() === 'graphs')
      };
    });

    await Question.deleteMany();
    await Question.insertMany(formattedQuestions);
    await DailySet.deleteMany();

    res.json({ message: `Database successfully seeded with ${formattedQuestions.length} questions and DailySets cleared!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get solve history and missed questions
// @route   GET /api/daily-sets/history
// @access  Private
const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const solvedRecords = await SolvedQuestion.find({ user: userId })
      .populate('question')
      .sort({ solvedAt: -1 });

    const allSets = await DailySet.find().populate('questions');
    const solvedIds = new Set(solvedRecords.map(sq => {
      return sq.question && sq.question._id ? sq.question._id.toString() : null;
    }).filter(Boolean));

    const missedQuestionsMap = new Map();
    allSets.forEach(set => {
      set.questions.forEach(q => {
        if (q && q._id && !solvedIds.has(q._id.toString())) {
          missedQuestionsMap.set(q._id.toString(), {
            ...q.toObject(),
            missedDate: set.date
          });
        }
      });
    });

    const missedQuestions = Array.from(missedQuestionsMap.values())
      .sort((a, b) => new Date(b.missedDate) - new Date(a.missedDate));

    // Filter out null questions from solvedRecords just in case
    const validSolved = solvedRecords.filter(sq => sq.question != null);

    res.json({
      solved: validSolved,
      missed: missedQuestions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment solve count for a question
// @route   POST /api/daily-sets/solve/:id/increment
// @access  Private
const incrementSolveCount = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id;

    let solvedQuestion = await SolvedQuestion.findOne({ user: userId, question: questionId });

    if (!solvedQuestion) {
      solvedQuestion = await SolvedQuestion.create({
        user: userId,
        question: questionId,
        solveCount: 1
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
    } else {
      solvedQuestion.solveCount += 1;
      await solvedQuestion.save();
    }

    res.json({ message: 'Solve count incremented', solveCount: solvedQuestion.solveCount, status: 'solved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Decrement solve count for a question
// @route   POST /api/daily-sets/solve/:id/decrement
// @access  Private
const decrementSolveCount = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id;

    const solvedQuestion = await SolvedQuestion.findOne({ user: userId, question: questionId });

    if (!solvedQuestion) {
      return res.status(404).json({ message: 'Solved record not found' });
    }

    solvedQuestion.solveCount -= 1;

    if (solvedQuestion.solveCount <= 0) {
      await SolvedQuestion.deleteOne({ _id: solvedQuestion._id });
      return res.json({ message: 'Question unmarked', solveCount: 0, status: 'unsolved' });
    } else {
      await solvedQuestion.save();
      return res.json({ message: 'Solve count decremented', solveCount: solvedQuestion.solveCount, status: 'solved' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Sync solved questions with LeetCode submissions
// @route   POST /api/daily-sets/sync
// @access  Private
const syncLeetcodeSubmissions = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.leetcodeUsername) {
      return res.status(400).json({ message: 'Please connect your LeetCode profile username first.' });
    }

    const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';
    const query = `
      query userRecentSubmissions($username: String!, $limit: Int) {
        recentSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `;

    const response = await fetch(LEETCODE_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { username: user.leetcodeUsername, limit: 20 }
      })
    });

    const result = await response.json();
    if (!result.data || !result.data.recentSubmissionList) {
      return res.status(400).json({ message: 'Could not fetch LeetCode submissions. Please check if your profile name is correct and public.' });
    }

    const submissions = result.data.recentSubmissionList;
    const acceptedSlugs = submissions
      .filter(sub => sub.statusDisplay === 'Accepted')
      .map(sub => sub.titleSlug);

    if (acceptedSlugs.length === 0) {
      return res.json({ message: 'No new accepted submissions found on LeetCode.', syncedCount: 0, newlySolved: [], streak: user.streak });
    }

    const matchingQuestions = await Question.find({ titleSlug: { $in: acceptedSlugs } });
    const newlySolved = [];

    for (const q of matchingQuestions) {
      const exists = await SolvedQuestion.findOne({ user: userId, question: q._id });
      if (!exists) {
        await SolvedQuestion.create({
          user: userId,
          question: q._id,
          solveCount: 1,
          solvedAt: new Date()
        });
        newlySolved.push(q);
      }
    }

    if (newlySolved.length > 0) {
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
    }

    res.json({
      message: `Successfully synced! Found ${newlySolved.length} newly completed questions.`,
      syncedCount: newlySolved.length,
      newlySolved,
      streak: user.streak
    });
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
  remoteSeed,
  getHistory,
  incrementSolveCount,
  decrementSolveCount,
  syncLeetcodeSubmissions
};
