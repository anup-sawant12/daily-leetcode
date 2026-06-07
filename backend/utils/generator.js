const Question = require('../models/Question');
const DailySet = require('../models/DailySet');

const generateDailySet = async (userId = null, options = {}) => {
  try {
    const {
      easyCount = 1,
      mediumCount = 4,
      hardCount = 1,
      allowDP = false,
      allowGraph = false
    } = options;

    // Get dates for the last 7 days
    const last7Days = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // Get recently used questions for this specific user (or global if userId is null)
    const recentSets = await DailySet.find({ 
      date: { $in: last7Days },
      user: userId
    });
    const usedQuestionIds = recentSets.reduce((acc, set) => {
      return acc.concat(set.questions);
    }, []);

    // Base query
    const baseQuery = { _id: { $nin: usedQuestionIds } };
    if (!allowDP) baseQuery.isDynamicProgramming = false;
    if (!allowGraph) baseQuery.isGraph = false;

    // Helper to get random questions
    const getRandomQuestions = async (difficulty, count) => {
      if (count <= 0) return [];
      const q = await Question.aggregate([
        { $match: { ...baseQuery, difficulty } },
        { $sample: { size: count } }
      ]);
      return q;
    };

    const easy = await getRandomQuestions('Easy', easyCount);
    const medium = await getRandomQuestions('Medium', mediumCount);
    const hard = await getRandomQuestions('Hard', hardCount);

    const questions = [...easy, ...medium, ...hard].map(q => q._id);

    const totalExpected = easyCount + mediumCount + hardCount;
    if (questions.length < totalExpected) {
      console.warn("Not enough unique questions found to generate full set.");
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Upsert today's set for this user (or global if userId is null)
    const dailySet = await DailySet.findOneAndUpdate(
      { date: today, user: userId },
      { date: today, user: userId, questions },
      { new: true, upsert: true }
    ).populate('questions');

    return dailySet;
  } catch (error) {
    console.error('Error generating daily set:', error);
    throw error;
  }
};

module.exports = { generateDailySet };
