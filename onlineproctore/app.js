const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose= require('mongoose');
const device = require('express-device');
const config = require('./config');
const {auth} = require('./controllers/login_logout/authenticate');

mongoose.Promise=global.Promise;
mongoose.connect(config.mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
  if(err) console.log(err);
  console.log("database is connected");
});

var models_path = path.resolve(__dirname, './models')
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

var index = require('./routes/root/index');
var users = require('./routes/login_logout/users');
var staff = require('./routes/staff/staff');
var faculty = require('./routes/faculty/faculty');
var studentTa = require('./routes/studentTa/studentTa');
var userRedirect = require('./routes/userRedirect');

var app = express();

app.all('*', (req,res,next)=>{
  if(req.secure){
    return next();
  }
  res.redirect(307,'https://'+req.hostname+':'+app.get('secPort')+req.url);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(device.capture());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', index);
app.use('/users', users);
app.use(auth);
app.use('/dashboard', userRedirect);
app.use('/dashboard/user', studentTa);
app.use('/dashboard/faculty', faculty);
app.use('/dashboard/staff', staff);

// oncontextmenu='return false' to be added in body tag at last

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
