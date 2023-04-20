const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

function initialize(passport) {
  passport.use(
    new LocalStrategy({ usernameField: "username" }, User.authenticate())
  );

  passport.serializeUser(function (user, done) {
    process.nextTick(function () {
      return done(null, {
        id: user._id,
        username: user.username,
      });
    });
  });

  passport.deserializeUser(function (user, done) {
    process.nextTick(function () {
      return done(null, user);
    });
  });
}

module.exports = initialize;
