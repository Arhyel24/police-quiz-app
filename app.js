const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Question = require('./models/question.js');
const user = require('./models/user.js');
const cookieSession = require('cookie-session');

const app = express();

const port = process.env.PORT || 8080;
const mongoURI = process.env.MONGODB_URI;
const sessionSecret = process.env.SESSION_SECRET;


app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

console.log(mongoURI);

mongoose.connect(mongoURI);

app.use(cookieSession({
  name: 'session',
  keys: [sessionSecret],
  maxAge: 24 * 60 * 60 * 1000,
}));

app.get('/', (req, res) => {

  // Clear session data before starting
  req.session = null;

  res.render('login');
});

app.post('/quiz', async (req, res) => {
  //Get username from form
  const username = req.body.username;
  
  // using the session to store the username and score
  req.session.username = username;
  req.session.score = 0;

  res.redirect('/quiz/question/0');
});

app.use(async (req, res, next) => {
  try {
    // Check if documents already exist in session
    if (!req.session.questions) {
      // Fetch documents from MongoDB if not in session
      const allQuestions = await Question.find();

      const Answers = Array(allQuestions.length).fill(null);
    // const pureQuestions = shuffledQuestions;
      userAnswers = Answers;

      req.session.showQuestions = {
        questions: allQuestions,
        userAnswers: userAnswers
      }
    }

    next();
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.use(async (req, res, next) => {
  try {
    const allQuestions = await Question.find();
    // const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

    const Answers = Array(allQuestions.length).fill(null);
    // const pureQuestions = shuffledQuestions;
    userAnswers = Answers;

    req.session.showQuestions = {
      questions: allQuestions,
      userAnswers: userAnswers
    }

    next();

  } catch (err) {
    console.error('Error fetching questions', err);
    next(err);
  };
});

app.get('/quiz/question/:index', (req, res) => {

  const index = parseInt(req.params.index);
  const { questions, userAnswers } =  req.session.showQuestions;
  if (index < 0 || index >= questions.length) {

    const { username, score} = req.session;
    const { questions } =  req.session.showQuestions;

    // Store the user's attempt in the database
    const userAttempt = new user ({
      userName: username,
      testScore: ((score / questions.length) * 100).toFixed(2), // Calculate percentage
    });

    userAttempt.save();

    res.redirect('/quiz/complete');
    return;
  }

  const question = questions[index];

  res.render('quiz', {
    question,
    index,
    totalQuestions: questions.length,
    userAnswer: userAnswers[index],
  });
});


app.post('/quiz/answer/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const { questions, userAnswers } =  req.session.showQuestions;
  const selectedOption = parseInt(req.body.answer);

  // Update user's answers
  userAnswers[index] = selectedOption;
   req.session.showQuestions.userAnswers = userAnswers;

  // Check if the answer is correct and update the score
  if (selectedOption === questions[index].correctOption) {
    req.session.score += 1;
  }

  res.redirect(`/quiz/question/${index + 1}`);
});

app.get('/quiz/complete', async (req, res) => {
  const { username, score} = req.session;
  const { questions } =  req.session.showQuestions;

  const userAttempt = {
    username,
    score: ((score / questions.length) * 100).toFixed(2),
  }

  //get list of users and display the top five scoring candidates
  const updatedUsers =  (await user.find().sort({ testScore: -1 })).slice(0, 5);

  // Display the completion page
  res.render('complete', { userAttempt, users: updatedUsers });
});

app.get('/admin/addquestions', async (req, res) => {

    res.render('admin');
  
});

app.post('/compose', (req, res) => {
  const newQuestion = req.body.question;
  const options = [req.body.option1, req.body.option2, req.body.option3, req.body.option4];
  const correctAnswer = req.body.answer;

  const question = new Question  ({
    questionText: newQuestion,
    options: options,
    correctOption: correctAnswer
  });

  question.save();

  res.redirect('/admin/addquestions');
})

app.post('/admin/deleteUsers', async (req, res) => {
  try {
    await user.deleteMany({});
    res.redirect('/admin/addquestions');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  };
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
