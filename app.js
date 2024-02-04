const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
// const session = require('express-session')
const Question = require('./models/question.js');
const user = require('./models/user.js');
const cookieSession = require('cookie-session');

const app = express();


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));



mongoose.connect('mongodb+srv://admin-wyteshadow:Mararra24@cluster0.bvh696d.mongodb.net/quizApp');

app.use(cookieSession({
  name: 'session',
  keys: ['your-secret-key'],
  maxAge: 24 * 60 * 60 * 1000,
}));


app.use(async (req, res, next) => {
  try {

    const allQuestions = await Question.find();

    if (!req.showQuestions) {
      const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5)
          // const shuffledQuestions = shuffleArray(allQuestions);
      const Answers = Array(shuffledQuestions.length).fill(null);
      req.showQuestions = {
        questions: shuffledQuestions,
        userAnswers: Answers
      }
    } else {
      req.showQuestions = {
        questions: shuffledQuestions,
        userAnswers: Answers
      }
    }

    next();
  } catch (err) {
    console.error('Error fetching questions', err);
    next(err);
  };
});

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/script.js', (req, res) => {
  res.type('application/javascript');
  // Your JavaScript file content or send the file using res.sendFile()
  res.sendFile(path.join(__dirname, 'public', 'script.js'));
});

app.get('/style.css', (req, res) => {
  res.type('text/css');
  // Your CSS file content or send the file using res.sendFile()
  res.sendFile('./Public/style.css');
});

app.post('/quiz', async (req, res) => {
  const username = req.body.username;
  
  req.session.username = username;


  req.session.score = 0;

  res.redirect('/quiz/question/0');
});

app.get('/quiz/question/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const { questions, userAnswers } = req.showQuestions;
  if (index < 0 || index >= questions.length) {

    const { username, score} = req.session;
    const { questions } = req.showQuestions;

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

app.post('/quiz/answer/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const { questions, userAnswers } = req.showQuestions;
  const selectedOption = parseInt(req.body.answer);

  // Update user's answers
  userAnswers[index] = selectedOption;
  req.showQuestions.userAnswers = userAnswers;

  // Check if the answer is correct and update the score
  if (selectedOption === questions[index].correctOption) {
    req.session.score += 1;
  }

  res.redirect(`/quiz/question/${index + 1}`);
});

app.get('/quiz/complete', async (req, res) => {
  const { username, score} = req.session;
  const { questions } = req.showQuestions;

  const userAtempt = {
    username,
    score: ((score / questions.length) * 100).toFixed(2),
  }

  //get list of users
  const updatedUsers =  (await user.find().sort({ testScore: -1 })).slice(0, 5);

  // Display the completion page
  res.render('complete', { userAtempt, users: updatedUsers });

  // Clear session data after completion
  req.session = null;
});

let port = 8080;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
