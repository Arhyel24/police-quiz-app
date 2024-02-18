const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Question = require('./models/question.js');
const user = require('./models/user.js');
const cookieSession = require('cookie-session');

const adminRoute = require('./routes/adminRoute.js')
const quizRoute = require('./routes/quizRoute.js')

const app = express();

//Setting up public files
app.use(express.static('public'));
app.use('/css', express.static(__dirname, + 'public'));
app.use('/img', express.static(__dirname, + 'public'));
app.use('/js', express.static(__dirname, + 'public'));

//Setting the view engines
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  maxAge: 24 * 60 * 60 * 1000,
}));

app.get('/', async (req, res) => {

  // Clear session data before starting
  req.session = null;

  //get list of users and display the top five scoring candidates
  const updatedUsers =  (await user.find().sort({ testScore: -1 })).slice(0, 5); 

  // Display the completion page
  res.render('login', { users: updatedUsers });
});

app.use('/quiz', quizRoute);
app.use('/admin', adminRoute);

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

port = process.env.PORT
if (port == null || port == "") {
    port = 8080
};

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
