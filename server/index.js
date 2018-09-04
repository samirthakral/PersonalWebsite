const express = require('express');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser')
const app = express();
const db = require('./db')
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')
const dbStore = new SequelizeStore({db: db});
const passport = require('passport');
const port = process.env.PORT || 3000
const { User } = require('../db')
module.exports = app

dbStore.sync();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/api', require('./api'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'a wildly insecure secret',
  store: dbStore,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  try {
    done(null, user.id)
  } catch (err) {
    next(err)
  }
})

passport.deserializeUser((id, done) => {
  User.findById(id)
  .then(user => done(null,user))
  .catch(done);
})

app.use(function(req,res,next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
})

app.use('*', function(req,res,) {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.use(function(err,req,res,next) {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal Server Error');
})

db.sync({force: true})
.then( function() {
  app.listen(port, function() {
    console.log(`Listening on port ${port}`)
  })
})

