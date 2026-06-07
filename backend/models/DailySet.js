const mongoose = require('mongoose');

const dailySetSchema = new mongoose.Schema({
  date: {
    type: String, // Format YYYY-MM-DD
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, { timestamps: true });

dailySetSchema.index({ date: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('DailySet', dailySetSchema);
