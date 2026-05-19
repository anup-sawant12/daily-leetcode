const Question = require('../models/Question');

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({});
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a question (Admin only)
// @route   POST /api/questions
// @access  Private/Admin
const addQuestion = async (req, res) => {
  try {
    const { questionId, title, titleSlug, difficulty, topicTags, url, isDynamicProgramming, isGraph } = req.body;
    
    const exists = await Question.findOne({ questionId });
    if (exists) {
      return res.status(400).json({ message: 'Question already exists' });
    }

    const question = await Question.create({
      questionId, title, titleSlug, difficulty, topicTags, url, isDynamicProgramming, isGraph
    });
    
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getQuestions,
  addQuestion
};
