const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, job, password, password2 } = req.body;
  let errors = [];

  if (!name || !job || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      job,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          job,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          job,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(() => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

router.post('/changep', (req, res, next) => {
  const { pictureid, email } = req.body;
  User.updateOne(
    { "email" : email },
    { $set: { actualP : pictureid }}
  ).then(() => {
    req.flash('success_msg', 'Profile picture changed');
    res.redirect('/preferences');
  });
})

router.post('/delete/:id', (req, res, next) => {
  User.deleteOne({_id: req.params.id}).then(res.redirect('/global-settings'));
})

router.post('/grant/:id', (req, res, next) => {
  User.findOne({_id: req.params.id}).then(user => {
    if(user.status == 'user'){
      User.updateOne(
        {_id: req.params.id},
        {$set: {status : 'moderator'}}
      ).then(res.redirect('/global-settings')).catch(err => console.log(err));
    }else{
      User.updateOne(
        {_id: req.params.id},
        {$set: {status : 'admin'}}
      ).then(res.redirect('/global-settings')).catch(err => console.log(err));
    }
  })
})

router.post('/ungrant/:id', (req, res, next) => {
  User.findOne({_id: req.params.id}).then(user => {
    if(user.status == 'moderator'){
      User.updateOne(
        {_id: req.params.id},
        {$set: {status : 'user'}}
      ).then(res.redirect('/global-settings')).catch(err => console.log(err));;
    }else{
      User.updateOne(
        {_id: req.params.id},
        {$set: {status : 'moderator'}}
      ).then(res.redirect('/global-settings')).catch(err => console.log(err));;
    }
  })
})

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
