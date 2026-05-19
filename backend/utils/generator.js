const Question = require('../models/Question');
const DailySet = require('../models/DailySet');

const generateDailySet = async (allowDP = false, allowGraph = false) => {
  try {
    // Get dates for the last 7 days
    const last7Days = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // Get recently used questions
    const recentSets = await DailySet.find({ date: { $in: last7Days } });
    const usedQuestionIds = recentSets.reduce((acc, set) => {
      return acc.concat(set.questions);
    }, []);

    // Base query
    const baseQuery = { _id: { $nin: usedQuestionIds } };
    if (!allowDP) baseQuery.isDynamicProgramming = false;
    if (!allowGraph) baseQuery.isGraph = false;

    // Helper to get random questions
    const getRandomQuestions = async (difficulty, count) => {
      const q = await Question.aggregate([
        { $match: { ...baseQuery, difficulty } },
        { $sample: { size: count } }
      ]);
      return q;
    };

    const easy = await getRandomQuestions('Easy', 1);
    const medium = await getRandomQuestions('Medium', 4);
    const hard = await getRandomQuestions('Hard', 1);

    const questions = [...easy, ...medium, ...hard].map(q => q._id);

    // If not enough questions found, we might need a fallback or just proceed with what we have.
    if (questions.length < 6) {
      console.warn("Not enough unique questions found to generate full set.");
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Upsert today's set
    const dailySet = await DailySet.findOneAndUpdate(
      { date: today },
      { date: today, questions },
      { new: true, upsert: true }
    );

    return dailySet;
  } catch (error) {
    console.error('Error generating daily set:', error);
  }
};

module.exports = { generateDailySet };
