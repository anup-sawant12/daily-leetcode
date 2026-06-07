const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastSolvedDate: {
    type: Date,
    default: null,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  leetcodeUsername: {
    type: String,
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
