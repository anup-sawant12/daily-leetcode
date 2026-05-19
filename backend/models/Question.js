const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  titleSlug: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topicTags: [{ type: String }],
  url: { type: String, required: true },
  isDynamicProgramming: { type: Boolean, default: false },
  isGraph: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
