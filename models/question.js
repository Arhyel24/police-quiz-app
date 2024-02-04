const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctOption: Number,
});

module.exports = mongoose.model('Question', questionSchema);
