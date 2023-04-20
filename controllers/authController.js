const User = require("../models/User");
const express = require("express");
const app = express();
const passport = require("passport");

module.exports = {
  isAuthenticated: function (req, res) {
    if (req.isAuthenticated()) {
      User.find({ secret: { $ne: null } })
        .then(function (foundUsers) {
          res.render("secrets", { usersWithSecrets: foundUsers });
        })
        .catch(function (err) {
          res.send(err);
        });
    } else {
      res.redirect("/");
    }
  },
  doRegister: async (req, res) => {
    try {
      const registerUser = await User.register(
        { username: req.body.username },
        req.body.password
      );
      if (registerUser) {
        passport.authenticate("local", {
          failureRedirect: "/register",
        })(req, res, function () {
          res.redirect("/secrets");
        });
      }
    } catch (err) {
      res.redirect("/register");
    }
  },

  doLogin: (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = new User({
      username: username,
      password: password,
    });

    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
      })(req, res, () => {
        res.redirect("/secrets");
      });
    });
  },

  doLogout: (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },
};
