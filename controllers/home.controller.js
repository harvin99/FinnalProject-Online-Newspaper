const moment = require("moment");
const passport = require("passport");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { errorFormatter } = require("../validator");
const { userModel } = require("../models");
const config = require("../config");
const crypto = require("crypto");

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
  let { username, password } = req.body;
  try {
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      //handle

      let user = await userModel.findOne({ username });
      if (user) {
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
            username,
            password,
          });
        }
      } else {
        res.render(view, {
          formError: {
            submit: "Username or Password incorrect",
          },
          username,
          password,
        });
      }
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      res.render(view, { formError, username, password });
    }
  } catch (error) {
    res.render(view, { errors: error.toString() });
  }
};
module.exports.register_post = async (req, res) => {
  let view = "home/register";
  console.log("run");
  let {
    username,
    email,
    password,
    confirmPassword,
    fullName,

    confirmCode,
  } = req.body;
  try {
    let formError = validationResult(req);
    if (formError.isEmpty()) {
      let newUser = await userModel.create({
        username,
        email,
        password,
        fullName,
      });
      res.render(view, {
        success: "create user successfully",
        formError,
        username,
        email,
        password,
        confirmPassword,
        fullName,

        confirmCode,
      });
    } else {
      formError = formError.formatWith(errorFormatter).mapped();
      res.render(view, {
        formError,
        username,
        email,
        password,
        confirmPassword,
        fullName,

        confirmCode,
      });
    }
  } catch (error) {
    console.log(error);
  }
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

module.exports.getRegisterCode = async (req, res) => {
  let length = 5;
  console.log(crypto.randomBytes(length));
  return res.json({
    code: crypto.randomBytes(length).toString("hex"),
  });
};
