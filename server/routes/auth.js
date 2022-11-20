require('dotenv').config();
const router = require('express').Router();
const passport = require('passport');

// const mongoose = require('mongoose');
// mongoose.connect(
//   'mongodb+srv://sneha:12345@cluster0.kc11ulc.mongodb.net/?retryWrites=true&w=majority'
// );
// const User = require('../models/database');

router.get('/login/success', (req, res) => {
  // console.log(req.session);
  // console.log(req.user);
  if (req.user) {
    // async function fetch_code() {
    //   const user = await User.findOne({ username: { $eq: req.user.name } });
    // }
    // fetch_code();
    // if (user) {
    //   document.getElementById
    // }
    res.status(200).json({
      error: false,
      message: 'Successfully logged in',
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: 'Not Authorized' });
  }
});

router.get('/login/failed', (req, res) => {
  res.status(401).json({
    error: true,
    message: 'Log in failure',
  });
});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: '/login/failed',
  })
);

router.get('/google', passport.authenticate('google', ['profile', 'email']));

router.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect(process.env.CLIENT_URL);
});

module.exports = router;
