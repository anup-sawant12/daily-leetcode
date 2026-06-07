const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const sampleQuestions = [
  // Easy
  { questionId: '1', title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', topicTags: ['Arrays', 'Hashing'], url: 'https://leetcode.com/problems/two-sum/' },
  { questionId: '20', title: 'Valid Parentheses', titleSlug: 'valid-parentheses', difficulty: 'Easy', topicTags: ['Strings', 'Stack'], url: 'https://leetcode.com/problems/valid-parentheses/' },
  { questionId: '21', title: 'Merge Two Sorted Lists', titleSlug: 'merge-two-sorted-lists', difficulty: 'Easy', topicTags: ['Linked List'], url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  // Medium
  { questionId: '3', title: 'Longest Substring Without Repeating Characters', titleSlug: 'longest-substring-without-repeating-characters', difficulty: 'Medium', topicTags: ['Strings', 'Sliding Window'], url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { questionId: '11', title: 'Container With Most Water', titleSlug: 'container-with-most-water', difficulty: 'Medium', topicTags: ['Arrays', 'Greedy'], url: 'https://leetcode.com/problems/container-with-most-water/' },
  { questionId: '15', title: '3Sum', titleSlug: '3sum', difficulty: 'Medium', topicTags: ['Arrays', 'Hashing'], url: 'https://leetcode.com/problems/3sum/' },
  { questionId: '33', title: 'Search in Rotated Sorted Array', titleSlug: 'search-in-rotated-sorted-array', difficulty: 'Medium', topicTags: ['Arrays', 'Binary Search'], url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { questionId: '98', title: 'Validate Binary Search Tree', titleSlug: 'validate-binary-search-tree', difficulty: 'Medium', topicTags: ['Trees'], url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
  // Hard
  { questionId: '4', title: 'Median of Two Sorted Arrays', titleSlug: 'median-of-two-sorted-arrays', difficulty: 'Hard', topicTags: ['Arrays', 'Binary Search'], url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
  { questionId: '23', title: 'Merge k Sorted Lists', titleSlug: 'merge-k-sorted-lists', difficulty: 'Hard', topicTags: ['Linked List', 'Queue'], url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
];

const importData = async () => {
  try {
    await Question.deleteMany();
    const formatted = sampleQuestions.map(q => ({
      ...q,
      isDynamicProgramming: q.topicTags.some(tag => tag.toLowerCase() === 'dynamic programming'),
      isGraph: q.topicTags.some(tag => tag.toLowerCase() === 'graph' || tag.toLowerCase() === 'graphs')
    }));
    await Question.insertMany(formatted);
    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
