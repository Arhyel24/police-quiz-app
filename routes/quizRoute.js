const express = require('express');
const quizRoute = express.Router()


  
quizRoute.post('/', async (req, res) => {
    //Get username from form
    const username = req.body.username;
    
    // using the session to store the username and score
    req.session.username = username;
    req.session.score = 0;
  
    res.redirect('/quiz/question/0');
  });
  
  quizRoute.use(async (req, res, next) => {
    try {
      
      if (!req.session.questions) {
        console.log('Not found');
  
        const allQuestions = await Question.find();
  
        const Answers = Array(allQuestions.length).fill(null);
  
        req.session.questions = {
          questions: allQuestions,
          userAnswers: Answers
        }
        
      } else {
        console.log('Found');
      }
  
      next();
  
    } catch (err) {
      res.status(500).send('Internal Server Error');
    };
  });


  
  quizRoute.get('/question/:index', (req, res) => {
  
    const index = parseInt(req.params.index);
    const { questions, userAnswers } =  req.session.questions;
    if (index < 0 || index >= questions.length) {
  
      const { username, score} = req.session;
      const { questions } =  req.session.questions;
  
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
  
  
  quizRoute.post('/answer/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const { questions, userAnswers } =  req.session.questions;
    const selectedOption = parseInt(req.body.answer);
  
    // Update user's answers
    userAnswers[index] = selectedOption;
     req.session.questions.userAnswers = userAnswers;
  
    // Check if the answer is correct and update the score
    if (selectedOption === questions[index].correctOption) {
      req.session.score += 1;
    }
  
    res.redirect(`/quiz/question/${index + 1}`);
  });
  
  
  quizRoute.get('/complete', async (req, res) => {
    const { username, score} = req.session;
    const { questions } =  req.session.questions;
  
    const userAttempt = {
      username,
      score: ((score / questions.length) * 100).toFixed(2),
    }
  
    //get list of users and display the top five scoring candidates
    const updatedUsers =  (await user.find().sort({ testScore: -1 })).slice(0, 5);
  
    // Display the completion page
    res.render('complete', { userAttempt, users: updatedUsers });
  });
  
  module.exports = quizRoute;