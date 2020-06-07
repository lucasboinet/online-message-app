const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server)


// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose.connect(db,{ useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

//Static files
app.use(express.static('public'))

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'm4y1s4e2c4r4e6t_p5h8r6a3s4e7',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge : 655555555 }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

const roomUsers = {}
const Message = require('./models/Message');
const Room = require('./models/Room');
const User = require('./models/User')


io.on('connection', socket => {
  socket.on('new-user', (room, name) => {
    socket.join(room);
    Message.updateMany(
      {userID : {$ne: name}, room : room, readStatus: "unreaded"},
      {$set: {readStatus: "read"}}
    ).then().catch(err => console.log(err));
    roomUsers[socket.id] = name;
  })
  socket.on('send-chat-message', (room, message) => {
    const newMessage = new Message({
      room: room,
      userID: roomUsers[socket.id],
      text: message
    })
    User.findOne({name: roomUsers[socket.id]}).then(user => {
      socket.to(room).emit('chat-message', {userPic: user.actualP, message: message, name: roomUsers[socket.id]});
    })
    newMessage.save().then().catch(err => console.log(err));
  })
  socket.on('disconnect', (room, name) => {
    delete roomUsers[socket.id];
  })
})

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

const PORT = process.env.PORT || 3000;

server.listen(PORT, console.log(`Server started at http://localhost:${PORT}`));
