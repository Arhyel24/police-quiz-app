const express = require('express');
const adminRoute = express.Router()


adminRoute.route('/questions')
    .get((req, res) => {
  
      res.render('admin');
      
    })
    .post((req, res) => {
      const newQuestion = req.body.question;
      const options = [req.body.option1, req.body.option2, req.body.option3, req.body.option4];
      const correctAnswer = req.body.answer;
    
      const question = new Question  ({
        questionText: newQuestion,
        options: options,
        correctOption: correctAnswer
      });
    
      question.save();
    
      res.redirect('/admin/questions');
  })

adminRoute.post('/deleteUsers', async (req, res) => {
  try {
    await user.deleteMany({});
    res.redirect('/admin/questions');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  };
});

module.exports = adminRoute;