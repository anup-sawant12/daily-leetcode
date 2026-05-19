const mongoose = require('mongoose');

const dailySetSchema = new mongoose.Schema({
  date: {
    type: String, // Format YYYY-MM-DD
    required: true,
    unique: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
}, { timestamps: true });

module.exports = mongoose.model('DailySet', dailySetSchema);
