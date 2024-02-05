const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Question = require('./models/question.js');
const user = require('./models/user.js');
const cookieSession = require('cookie-session');

const app = express();


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));


// 'mongodb+srv://admin-wyteshadow:Mararra24@cluster0.bvh696d.mongodb.net/quizApp'
mongoose.connect('mongodb+srv://admin-wyteshadow:Mararra24@cluster0.bvh696d.mongodb.net/quizApp');
// mongodb://localhost:27017/quizApp
app.use(cookieSession({
  name: 'session',
  keys: ['your-secret-key'],
  maxAge: 24 * 60 * 60 * 1000,
}));


app.use(async (req, res, next) => {
      
  // console.log(req.session);
  // console.log(req.showQuestions);

try {

// if (req.showQuestions == null) {

  // console.log("Not found!!");

  const allQuestions = await Question.find();
  // const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);

  const Answers = Array(allQuestions.length).fill(null);
  // const pureQuestions = shuffledQuestions;
  const userAnswers = Answers;

  req.showQuestions = {
    questions: allQuestions,
    userAnswers: userAnswers
  }

  // console.log(Answers.length);
  // console.log(req.showQuestions.userAnswers.slice(0, 5));

  next();

// } else {
  
//   console.log("Found proceed!!");

//   next();
// }

} catch (err) {
console.error('Error fetching questions', err);
next(err);
};
});

app.get('/', (req, res) => {

  // Clear session data before starting
  req.session = null;
  req.showQuestions = null;

  res.redirect('/login');
});

app.get('/login', (req, res) => {

  // console.log(req.session);
  // console.log(req.showQuestions);

  res.render('login');
})



app.post('/quiz', async (req, res) => {
  const username = req.body.username;
  
  req.session.username = username;


  req.session.score = 0;

  res.redirect('/quiz/question/0');
});

app.get('/quiz/question/:index', (req, res) => {

  const index = parseInt(req.params.index);
  const { questions, userAnswers } =  req.showQuestions;
  if (index < 0 || index >= questions.length) {

    const { username, score} = req.session;
    const { questions } =  req.showQuestions;

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
  const { questions, userAnswers } =  req.showQuestions;
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
  const { questions } =  req.showQuestions;

  const userAtempt = {
    username,
    score: ((score / questions.length) * 100).toFixed(2),
  }

  //get list of users
  const updatedUsers =  (await user.find().sort({ testScore: -1 })).slice(0, 5);

  // Display the completion page
  res.render('complete', { userAtempt, users: updatedUsers });

  // Clear session data after completion
  req.session = [];
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

let port = 8080;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
