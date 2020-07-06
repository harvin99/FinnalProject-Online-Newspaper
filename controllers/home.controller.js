const moment = require("moment");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorFormatter } = require("../validator");
const { userModel } = require("../models");
const config = require("../config");
module.exports.getHome = (req, res) => {
  res.render("home/home");
};
module.exports.login = (req, res) => {
  res.locals.header = false;
  res.render("home/login");
};
module.exports.register = (req, res) => {
  res.render("home/register");
};
module.exports.login_post = async (req, res) => {
  let { retUrl } = req.query;
  let view = "home/login";
  try {
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      //handle
      let { username, password } = req.body;

      let user = await userModel.findOne({ username });
      if (user) {
        let hash = await bcrypt.hash(
          password,
          config.authentication.saltRounds
        );
        console.log(hash);
        let comparePasswordResult = await bcrypt.compare(
          password,
          user.password
        );

        if (comparePasswordResult) {
          let token = user.token();

          res.cookie("token", token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
          res.redirect(retUrl ? retUrl : "/");
        } else {
          res.render(view, {
            formError: {
              submit: "Username or Password incorrect",
            },
          });
        }
      } else {
        res.render(view, {
          formError: {
            submit: "Username or Password incorrect",
          },
        });
      }
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      console.log(formError);
      res.render(view, { formError });
    }
  } catch (error) {
    res.render(view, { errors: error.toString() });
  }
};
module.exports.register_post = (req, res) => {
  res.render("home/home");
};
module.exports.facebook = (req, res, next) => {
  passport.authenticate("facebook", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      res.cookie("token", user.token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
      return res.redirect("/");
    });
  })(req, res, next);
};
module.exports.google = (req, res, next) => {
  passport.authenticate("google", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      res.cookie("token", user.token, { maxAge: 30 * 24 * 60 * 60 * 1000 });
      return res.redirect("/");
    });
  })(req, res, next);
};
module.exports.logout = async (req, res) => {
  req.logout();

  res.cookie("token", "", { maxAge: Date.now() });
  res.clearCookie("token");
  res.redirect("/");
};
