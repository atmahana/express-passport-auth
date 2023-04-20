require("dotenv").config();
const passport = require("passport");
const User = require("../models/User");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

function initialize(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets",
      },
      function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate(
          { username: profile.id, displayName: profile.displayName, googleId: profile.id },
          function (err, user) {
            return cb(err, user);
          }
        );
      }
    )
  );
}

module.exports = initialize;
