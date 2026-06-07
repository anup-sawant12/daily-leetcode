const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const SolvedQuestion = require('../models/SolvedQuestion');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      streak: req.user.streak,
      isAdmin: req.user.isAdmin,
      leetcodeUsername: req.user.leetcodeUsername || ""
    };
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get social leaderboard rankings
// @route   GET /api/auth/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'overall' } = req.query;
    
    let dateFilter = null;
    const now = new Date();
    
    if (timeframe === 'weekly') {
      dateFilter = new Date();
      dateFilter.setDate(now.getDate() - 7);
    } else if (timeframe === 'monthly') {
      dateFilter = new Date();
      dateFilter.setDate(now.getDate() - 30);
    }

    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'solvedquestions',
          localField: '_id',
          foreignField: 'user',
          as: 'solvedList'
        }
      },
      {
        $project: {
          name: 1,
          streak: 1,
          solvedCount: dateFilter
            ? {
                $size: {
                  $filter: {
                    input: '$solvedList',
                    as: 'sq',
                    cond: { $gte: ['$$sq.solvedAt', dateFilter] }
                  }
                }
              }
            : { $size: '$solvedList' }
        }
      },
      {
        $sort: {
          solvedCount: -1,
          streak: -1,
          name: 1
        }
      }
    ]);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user public profile and solve stats
// @route   GET /api/auth/profile/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const targetUser = await User.findById(userId).select('-password -email -isAdmin');
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch solved questions statistics for this user
    const solved = await SolvedQuestion.find({ user: userId }).populate('question');
    
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

    const sortedTopics = Object.keys(topicCounts).map(name => ({
      name,
      value: topicCounts[name]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // limit to top 5 tags

    const history = Object.keys(dateCounts).map(date => ({
      date,
      solved: dateCounts[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      user: targetUser,
      totalSolved: solved.length,
      difficultyCounts,
      topicCounts: sortedTopics,
      history
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getLeaderboard,
  getUserProfile,
};
