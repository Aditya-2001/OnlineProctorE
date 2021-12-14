const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose= require('mongoose');
const config = require('./config');
const {auth} = require('./controllers/login_logout/authenticate');

var index = require('./routes/root/index');
var users = require('./routes/login_logout/users');

var app = express();

mongoose.Promise=global.Promise;
mongoose.connect(config.mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
  if(err) console.log(err);
  console.log("database is connected");
});

app.all('*', (req,res,next)=>{
  if(req.secure){
    return next();
  }
  res.redirect(307,'https://'+req.hostname+':'+app.get('secPort')+req.url);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', index);
app.use('/users', users);
app.use(auth);
app.get('/dashboard', (req, res) => {
  res.render('dashboard/dashboard');
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  return res.render('error/error', {authorized: true});
});

module.exports = app;
