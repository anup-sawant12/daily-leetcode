const mongoose = require('mongoose');

const solvedQuestionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  solvedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure a user can only solve a question once
solvedQuestionSchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('SolvedQuestion', solvedQuestionSchema);
