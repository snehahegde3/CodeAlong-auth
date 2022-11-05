const GoogleStratergy = require('passport-google-oauth20').Strategy;

const passport = require('passport');

passport.use(
  new GoogleStratergy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
    },
    function (accessToken, refreshToken, profile, done) {
      // console.log(profile);
      done(null, profile);
    }
  )
);

// since were using cookies, serialise and deserialise
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
