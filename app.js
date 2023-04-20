//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const User = require("./models/User");
const Auth = require("./controllers/authController");
const initializeLocal = require("./configs/passport-config");
const initializeGoogle = require("./configs/google-config");
const initializeFacebook = require("./configs/facebook-config");

const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(flash());
app.use(
  session({
    secret: process.env.SECRETS,
    resave: false,
    saveUninitialized: false,
  })
);

initializeLocal(passport);
initializeGoogle(passport);
initializeFacebook(passport);

app.use(passport.initialize());
app.use(passport.session());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGODB_URL);
}

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);
app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/secrets");
  }
);

app.get("/auth/facebook", passport.authenticate("facebook"));
app.get(
  "/auth/facebook/secrets",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/secrets");
  }
);

app.get("/secrets", Auth.isAuthenticated);

app
  .route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post(Auth.doRegister);

app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(Auth.doLogin);

app.get("/logout", Auth.doLogout);

app
  .route("/submit")
  .get((req, res) => {
    if (req.isAuthenticated()) {
      res.render("submit");
    } else {
      res.redirect("/login");
    }
  })
  .post((req, res) => {
    const submittedSecret = req.body.secret;
    const userId = req.user.id;

    User.findById(userId)
      .then((foundUser) => {
        if (foundUser) {
          foundUser.secret = submittedSecret;
          return foundUser.save();
        }
        return null;
      })
      .then(() => {
        res.redirect("/secrets");
      })
      .catch((err) => {
        res.send(err);
      });
  });

app.listen(PORT, () => {
  console.log("Server started on port 3000");
});
