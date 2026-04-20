require('dotenv').config();
const express = require('express');
const passport = require('passport');
require('./passportConfig');
const app = express();
const UserRouter = require('./routers/UserRouter');
const ProjectRouter = require('./routers/ProjectRouter');
const AuthRouter = require('./routers/AuthRouterNew');
const ContactRouter = require('./routers/ContactRouter');
const cors = require('cors');

const port = process.env.PORT || 5000;

//middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost origins for development
    if (origin.match(/^http:\/\/localhost:\d+$/)) return callback(null, true);
    
    // Allow all origins for live preview routes
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use('/user', UserRouter);
app.use('/project', ProjectRouter);
app.use('/api/auth', AuthRouter);
app.use('/contact', ContactRouter);

//endpoint
app.get('/', (req, res) => {
  res.send('response from express');
});

app.get('/add', (req, res) => {
  res.send('response from add');
});

app.get('/all', (req, res) => {
  res.send('response from all');
});

app.get('/delete', (req, res) => {
  res.send('response from delete');
});

//starting the server
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});