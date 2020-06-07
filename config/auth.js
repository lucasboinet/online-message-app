module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
  },
  forwardAuthenticated: function(req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/dashboard');      
  },
  ensureAuthenticatedAndAdmin: function(req, res, next) {
    if(req.isAuthenticated() && req.user.status == "admin"){
      return next();
    }
    res.redirect('/dashboard');
  }
};
