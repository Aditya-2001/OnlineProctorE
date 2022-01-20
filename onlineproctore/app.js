const createError = require('http-errors');
var debug = require('debug')('onlineproctore:server');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose= require('mongoose');
const device = require('express-device');
const config = require('./config');
const {auth} = require('./controllers/login_logout/authenticate');
var app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

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
var passwordProfile = require('./routes/login_logout/passwordProfile');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/peerjs', peerServer);
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
app.use('/update', passwordProfile);

// oncontextmenu='return false' to be added in body tag at last

io.on('connection', socket => {
  socket.on('join-room1', (roomId, userId) => {
    socket.join(roomId);
    console.log('joined room 1');
    socket.on('camera-required', () => {
      socket.to(roomId).emit('camera-required', userId);
    })
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
  socket.on('join-room2', (roomId, userId) => {
    socket.join(roomId);
    console.log('joined room 2');
    socket.on('screen-required', () => {
      socket.to(roomId).emit('screen-required', userId);
    })
  });
})

var port = process.env.PORT || 3000;
var HOST = 'localhost';
server.listen(port, HOST, () => {
  console.log('server is listening on port:', port)
});