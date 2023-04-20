require("dotenv").config();
const passport = require("passport");
const User = require("../models/User");
const FacebookStrategy = require("passport-facebook");

function initialize(passport) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/secrets",
      },
      function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate(
          { username: profile.id, displayName: profile.displayName, facebookId: profile.id },
          function (err, user) {
            return cb(err, user);
          }
        );
      }
    )
  );
}

module.exports = initialize;
