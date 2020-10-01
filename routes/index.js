const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensureAuthenticatedAndAdmin, forwardAuthenticated } = require('../config/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const Room = require('../models/Room');
const Friendship = require('../models/Friendship');
//Welcome page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Auth Page
router.get('/auth', forwardAuthenticated, (req, res) => res.render('auth'));

router.get('/espace', ensureAuthenticated, (req, res) => {
  Room.find({chatName: {$regex: req.user.id}}).then(chatRoom => {
    console.log(chatRoom.id);
    res.render('espace', {chatRoom: chatRoom, user: req.user});
  }).catch(err => console.log(err))
})

router.get('/espace/:room', ensureAuthenticated, (req, res) => {
  var roomID = req.params.room;
  var otherUserID = roomID.replace(req.user.id,'');
  Message.find({room: req.params.room}).then(roomMessages => {
    User.findOne({_id: otherUserID}).then(otherUser => {
      res.render('room', {otherUser: otherUser, roomMessages: roomMessages, roomName: req.params.room, user: req.user});
    })
  })
})

router.post('/request/send/:id', ensureAuthenticated, (req, res) => {
  const newFriendship = new Friendship ({
    userAsking: req.user.id,
    userAsked: req.params.id,
    accepted: false
  })
  newFriendship.save().then(() => {
    res.redirect('/profile/'+req.params.id);
  }).catch(err => console.log(err));
})

router.post('/request/delete/:id', ensureAuthenticated, (req, res) => {
    Friendship.deleteOne({userAsked: req.params.id, userAsking: req.user.id}).then(
      res.redirect('/dashboard')
    ).catch(err => console.log(err));
})

router.post('/request/refuse/:id', ensureAuthenticated, (req, res) => {
  Friendship.deleteOne({_id: req.params.id}).then(res.redirect('/dashboard')).catch(err => console.log(err));
})

router.post('/request/add/:id', ensureAuthenticated, (req, res) => {
    Friendship.updateOne({_id: req.params.id},{$set: {accepted: true}}).then(res.redirect('/dashboard')).catch(err => console.log(err));
})

//User preferences page
router.get('/preferences', ensureAuthenticated, (req, res) => res.render('preferences', {user: req.user}));

router.get('/global-settings', ensureAuthenticatedAndAdmin, (req, res) => {
  User.find({}).then(users => {
    Ticket.find({}).then(tickets => {
      res.render('global-settings', {users: users, tickets: tickets});
    })
  });
});

router.get('/friendlist', ensureAuthenticated, (req, res) => {
  Friendship.find({
    $or : [
      { $and : [ { userAsked : req.user.id }, { accepted : true } ] },
      { $and : [ { userAsking : req.user.id }, { accepted : true } ] }
  ]
  }).then(friends => {res.render('friendlist', {friends: friends, user: req.user})})
})

router.get('/support', ensureAuthenticated, (req, res) => res.render('support', {user: req.user}));

router.post('/support/add', (req, res) => {
  const { motif } = req.body;
  const newTicket = new Ticket({
    userID: req.user._id,
    motif
  });
  newTicket.save().then(() => {
    req.flash('success_msg','Ticket successfully sent');
    res.redirect('/support');
  })
})

router.post('/espace/:roomid', (req, res) => {
  var roomID = req.params.roomid;
  var otherUserID = roomID.replace(req.user.id,'');
  Room.findOne({
    $and: [
      {chatName: {$regex: req.user.id}},
      {chatName: {$regex: otherUserID}}
    ]
  }).then(room => {
    if(room != null && room.length != 0){
      return res.redirect('/espace/'+room.chatName)
    }
    User.find({
      $or: [
        {$and: [{_id: req.user.id}]},
        {$and: [{_id: otherUserID}]}
      ]
    }).then(users => {
        const newRoom = new Room({
          chatName: req.params.roomid,
          members: [users.name]
        })
        newRoom.save()
          .then(res.redirect('/espace/'+req.params.roomid))
          .catch(err => console.log(err));
      })    
  })
})

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  Friendship.find({userAsked: req.user.id, accepted: false}).then(friendrequest => {
    Friendship.find({
      $or : [
        {userAsked: req.user.id, accepted: true},
        {userAsking: req.user.id, accepted: true}
      ]
    }).countDocuments().then(numberF => {
      res.render('dashboard', {user: req.user, friendrequest: friendrequest, numberF: numberF});
    })
  })
});

router.get('/profile/:userid', ensureAuthenticated, (req, res) => {
  User.findOne({_id: req.params.userid}).then(user => {
    Friendship.findOne({userAsking: req.user.id, userAsked: req.params.userid}).then(friendship => {
      res.render('profile', {user: user, actualU: req.user, friendship: friendship})
    }).catch(err => console.log(err))
  })
})

module.exports = router;
