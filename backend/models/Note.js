const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Ensure a user can only have one note per question
noteSchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('Note', noteSchema);
